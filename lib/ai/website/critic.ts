/**
 * Visual composition critic + repair loop.
 *
 * The critic runs against the raw delimited text after generation. It
 * checks both structural drift (per-niche banned shapes) AND visual
 * composition quality (hero weakness, rhythm flatness, image role
 * mismatch, weak footer/CTA, lack of layering).
 *
 * The loop is bounded: at most one repair pass via generateText.
 *
 * The critic is deterministic (regex + heuristic). No LLM call for
 * detection. The repair pass is the only LLM call.
 */

import type { Niche } from "./niche-router";
import { getNicheProfile } from "./niche-profiles";
import {
  renderDesignConformanceForRepair,
  type DesignConformanceReport,
} from "@/lib/design-md/cenate";
import type { WebsiteVariantPlan } from "./design-families";
import {
  REQUIRED_SCAFFOLD_DIRECTORIES,
  REQUIRED_SCAFFOLD_FILES,
} from "./scaffold-files";
import { getVariantStarterBase } from "./starter-bases";

export type CriticIssue = {
  rule: string;
  detail: string;
  severity: "hard" | "soft";
  hint: string;
};

export type CriticReport = {
  niche: Niche;
  passed: boolean;
  issues: CriticIssue[];
};

type Detector = {
  rule: string;
  severity: "hard" | "soft";
  hint: string;
  test: (raw: string) => string | null;
};

// ──────────────────────────────────────────────
// Helper: extract a section's code from the raw delimited output
// ──────────────────────────────────────────────
function extractSection(raw: string, pattern: RegExp): string | null {
  const m = raw.match(pattern);
  return m ? m[0] : null;
}

function countPattern(text: string, re: RegExp): number {
  return (text.match(re) || []).length;
}

function hasFileBlock(raw: string, filePath: string): boolean {
  return raw.includes(`===FILE:${filePath}===`);
}

function extractFilePaths(raw: string): string[] {
  const matches = raw.matchAll(/===FILE:(.*?)===/g);
  return Array.from(matches, (match) => match[1].trim());
}

function extractFileBlock(raw: string, filePath: string): string | null {
  const pattern = new RegExp(
    `===FILE:${filePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}===\\n([\\s\\S]*?)===END_FILE===`
  );
  const match = raw.match(pattern);
  return match ? match[1] : null;
}

function extractSectionFiles(raw: string): Array<{ path: string; content: string }> {
  return Array.from(
    raw.matchAll(/===FILE:(src\/components\/(?!ui\/)[^=]+\.tsx)===\n([\s\S]*?)===END_FILE===/g),
    (match) => ({
      path: match[1],
      content: match[2],
    })
  );
}

function getLayoutSignature(content: string): string {
  if (/Gallery|grid-cols-3[\s\S]{0,200}<img|aspect-\[/.test(content) && /<img/.test(content)) {
    return "gallery";
  }
  if (/timeline|border-l|space-y-8[\s\S]{0,200}(?:01|02|03|04|step)/i.test(content)) {
    return "timeline";
  }
  if (/StatsBand|grid-cols-4[\s\S]{0,200}(?:years|clients|teams|projects|uptime|awards|locations)/i.test(content)) {
    return "stats-row";
  }
  if (/(?:md|lg):grid-cols-3|(?:md|lg):grid-cols-4/.test(content)) {
    return "grid";
  }
  if (/(?:md|lg):grid-cols-2|items-center[\s\S]{0,200}<img/.test(content)) {
    return "split";
  }
  if (/text-center/.test(content)) {
    return "centered-stack";
  }
  return "other";
}

const PRIMITIVE_IMPORT_RULES = [
  { symbols: ["Button"], path: "@/components/ui/button" },
  { symbols: ["Input"], path: "@/components/ui/input" },
  { symbols: ["Textarea"], path: "@/components/ui/textarea" },
  { symbols: ["Badge"], path: "@/components/ui/badge" },
  { symbols: ["Card"], path: "@/components/ui/card" },
  { symbols: ["Section"], path: "@/components/ui/section" },
  { symbols: ["Container"], path: "@/components/ui/container" },
  { symbols: ["Heading"], path: "@/components/ui/heading" },
  { symbols: ["Separator"], path: "@/components/ui/separator" },
  {
    symbols: ["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent"],
    path: "@/components/ui/accordion",
  },
  { symbols: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"], path: "@/components/ui/tabs" },
  {
    symbols: ["Dialog", "DialogTrigger", "DialogContent", "DialogClose", "DialogTitle", "DialogDescription"],
    path: "@/components/ui/dialog",
  },
  { symbols: ["Sheet", "SheetTrigger", "SheetContent", "SheetClose"], path: "@/components/ui/sheet" },
  { symbols: ["MobileNav"], path: "@/components/ui/mobile-nav" },
  { symbols: ["AspectRatio"], path: "@/components/ui/aspect-ratio" },
  { symbols: ["Testimonial"], path: "@/components/ui/testimonial" },
  { symbols: ["StatsBand"], path: "@/components/ui/stats-band" },
  { symbols: ["Gallery"], path: "@/components/ui/gallery" },
] as const;

// ──────────────────────────────────────────────
// UNIVERSAL DETECTORS — run for every niche
// ──────────────────────────────────────────────
const UNIVERSAL_DETECTORS: Detector[] = [
  {
    rule: "project must include manifest and app entry files",
    severity: "hard",
    hint: "Emit the full project contract: manifest, src/App.tsx, and the injected Lovable-style scaffold files.",
    test: (raw) => {
      const missing = ["===PROJECT_MANIFEST===", "src/App.tsx"].filter((entry) =>
        entry === "===PROJECT_MANIFEST===" ? !raw.includes(entry) : !hasFileBlock(raw, entry)
      );
      if (missing.length > 0) {
        return `Missing required project contract entries: ${missing.join(", ")}.`;
      }
      return null;
    },
  },
  {
    rule: "project must include required Lovable-style scaffold files",
    severity: "hard",
    hint: `Emit the stable scaffold contract files: ${REQUIRED_SCAFFOLD_FILES.join(", ")}.`,
    test: (raw) => {
      const missing = REQUIRED_SCAFFOLD_FILES.filter((filePath) => !hasFileBlock(raw, filePath));
      if (missing.length > 0) {
        return `Missing required scaffold files: ${missing.join(", ")}.`;
      }
      return null;
    },
  },
  {
    rule: "project must include required Lovable-style scaffold directories",
    severity: "hard",
    hint: `Emit files under these scaffold directories: ${REQUIRED_SCAFFOLD_DIRECTORIES.join(", ")}.`,
    test: (raw) => {
      const filePaths = extractFilePaths(raw);
      const missing = REQUIRED_SCAFFOLD_DIRECTORIES.filter(
        (dirPath) => !filePaths.some((filePath) => filePath.startsWith(dirPath))
      );
      if (missing.length > 0) {
        return `Missing required scaffold directories: ${missing.join(", ")}.`;
      }
      return null;
    },
  },
  {
    rule: "App must render a real page composition",
    severity: "hard",
    hint: "Wrap src/App.tsx in a <main role=\"main\"> and render Navbar, Hero, 3-5 body sections, and Footer in order.",
    test: (raw) => {
      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;

      const hasMain = /<main[\s\S]*role="main"|<main role="main"[\s\S]*/.test(app);
      const hasNavbar = /<Navbar\b/.test(app);
      const hasHero = /<Hero\b/.test(app);
      const hasFooter = /<Footer\b/.test(app);
      const renderedComponents = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)).map((m) => m[1]);
      const unique = [...new Set(renderedComponents)].filter((name) => name !== "React");
      const bodySectionCount = unique.filter((name) => !["Navbar", "Hero", "Footer"].includes(name)).length;

      if (!hasMain || !hasNavbar || !hasHero || !hasFooter || bodySectionCount < 3 || bodySectionCount > 5) {
        return `App composition invalid: hasMain=${hasMain}, hasNavbar=${hasNavbar}, hasHero=${hasHero}, hasFooter=${hasFooter}, bodySectionCount=${bodySectionCount}.`;
      }
      return null;
    },
  },
  // ── Structural ──
  {
    rule: "no four-column link sitemap footer",
    severity: "hard",
    hint: "Replace the four-column link grid with a designed identity footer (closing line + contact + locations + non-link element).",
    test: (raw) => {
      const f = extractSection(raw, /Footer[\s\S]{0,3000}?===END_FILE===/i);
      if (!f) return null;
      if (/grid-cols-4/.test(f) && countPattern(f, /<a /g) >= 8) {
        return "Footer uses grid-cols-4 with 8+ link anchors (utility sitemap pattern).";
      }
      return null;
    },
  },
  {
    rule: "no centered eyebrow + headline + two buttons CTA",
    severity: "hard",
    hint: "Replace the centered CTA with a split panel, inset bordered band with left-aligned copy, or a real form surface.",
    test: (raw) => {
      const c = extractSection(raw, /(?:CTA|Conversion|Contact|Reservation)[\s\S]{0,2500}?===END_FILE===/i);
      if (!c) return null;
      const hasCenter = /text-center/.test(c);
      const hasEyebrow = /(?:rounded-full[^>]*?inline-flex|inline-flex[^>]*?rounded-full)/.test(c);
      const buttonCount = countPattern(c, /<button|<a [^>]*(?:rounded-full|rounded-lg|rounded-md)/g);
      if (hasCenter && hasEyebrow && buttonCount >= 2) {
        return "Centered CTA with eyebrow pill + 2+ buttons detected.";
      }
      return null;
    },
  },

  // ── Visual Composition (Impeccable enforcement) ──
  {
    rule: "hero must have structural composition, not just text over photo",
    severity: "hard",
    hint: "Add a second composition plane to the hero: a credential rail, an offset media inset, an overlapping element, or a framed product surface. The hero must have layering, not just text floating over a background.",
    test: (raw) => {
      const h = extractSection(raw, /Hero[\s\S]{0,4000}?===END_FILE===/i);
      if (!h) return null;
      // Detect the "safe AI hero": centered text over a full-bleed bg image
      const hasBgImage = /bg-\[url|background-image|projectImages\.|https?:\/\//.test(h);
      const hasOverlay = /bg-black\/[456789]0|bg-gradient.*black/.test(h);
      const hasCenterText = /text-center[\s\S]{0,500}?text-(?:4|5|6|7)xl/.test(h);
      // Check for structural elements that indicate composition
      const hasCredentialRail = /credential|award|michelin|established|est\.|years|license/i.test(h);
      const hasOffsetElement = /col-span|offset|overlap|absolute.*(?:right|left|bottom|top)-(?!0)|translate|z-\d|inset/.test(h);
      const hasSplitLayout = /grid-cols-2|md:grid-cols-2|lg:flex|lg:grid-cols-\d|md:w-1\/2|lg:w-/.test(h);
      if (hasBgImage && hasOverlay && hasCenterText && !hasCredentialRail && !hasOffsetElement && !hasSplitLayout) {
        return "Hero is centered text over a dimmed background image with no structural composition (no credential rail, no offset element, no split layout).";
      }
      return null;
    },
  },
  {
    rule: "hero must include a supporting structure beyond headline and CTA",
    severity: "hard",
    hint: "Add a trust row, stats rail, credential strip, supporting meta panel, or structured media frame to the hero.",
    test: (raw) => {
      const h = extractFileBlock(raw, "src/components/Hero.tsx");
      if (!h) return null;
      const hasTrustRow = /12,000\+|99\.99|trusted|certified|award|years|clients|teams|projects|uptime|est\.|since|logo/i.test(h);
      const hasStatRail = /grid-cols-[234]|flex[^\\n]+gap-[46]/.test(h) && /text-(?:xs|sm|base)[\s\S]{0,240}(?:%|\+|teams|clients|projects|years|uptime|awards|logos)/i.test(h);
      const hasMetaPanel = /rounded-(?:xl|2xl|3xl)[\s\S]{0,320}(?:border|shadow)[\s\S]{0,420}(?:credential|metric|team|delivery|speed|days|support|status|secure|trusted|customers)/i.test(h);
      const hasStructuredMedia = /aspect-\[|h-\[\d+px\]|overflow-hidden[\s\S]{0,120}img|rounded-(?:xl|2xl|3xl)[\s\S]{0,180}border[\s\S]{0,260}<img/.test(h);
      if (!hasTrustRow && !hasStatRail && !hasMetaPanel && !hasStructuredMedia) {
        return "Hero lacks a supporting trust/stat/meta/media structure beyond headline/body/button.";
      }
      return null;
    },
  },
  {
    rule: "body sections must not exceed five",
    severity: "hard",
    hint: "Render 3 to 5 body sections total. Merge related content instead of adding a sixth section.",
    test: (raw) => {
      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;
      const renderedComponents = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)).map((m) => m[1]);
      const unique = [...new Set(renderedComponents)].filter((name) => name !== "React");
      const bodySectionCount = unique.filter((name) => !["Navbar", "Hero", "Footer"].includes(name)).length;
      if (bodySectionCount > 5) {
        return `App renders ${bodySectionCount} body sections (maximum 5).`;
      }
      return null;
    },
  },
  {
    rule: "body sections must not repeat the same dominant layout type",
    severity: "hard",
    hint: "Mix layout signatures across sections. No single dominant layout type may appear three or more times across body sections.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw).filter(
        (file) => !/(?:Navbar|Hero|Footer)\.tsx$/.test(file.path)
      );
      const counts = new Map<string, number>();
      for (const file of sectionFiles) {
        const signature = getLayoutSignature(file.content);
        if (signature === "other") continue;
        counts.set(signature, (counts.get(signature) ?? 0) + 1);
      }
      const repeated = Array.from(counts.entries()).filter(([, count]) => count >= 3);
      if (repeated.length > 0) {
        return `Repeated layout signatures detected: ${repeated.map(([name, count]) => `${name} x${count}`).join(", ")}.`;
      }
      return null;
    },
  },
  {
    rule: "no more than one uniform card grid per page",
    severity: "hard",
    hint: "Replace one of the card grids with a different composition: editorial list, typographic band, split layout, or asymmetric blocks.",
    test: (raw) => {
      // Count sections that use grid-cols-3 with rounded card shells
      const cardGridSections = countPattern(raw, /(?:md|lg):grid-cols-3[\s\S]{0,500}?rounded-(?:xl|2xl|3xl)/g);
      if (cardGridSections >= 2) {
        return `Page has ${cardGridSections} sections using grid-cols-3 with rounded card shells (max 1 allowed).`;
      }
      return null;
    },
  },
  {
    rule: "section rhythm must not be flat",
    severity: "hard",
    hint: "Vary section padding (py-12 to py-32) by purpose. Add at least one rhythm break: a full-bleed media moment, an asymmetric section, or a surface shift.",
    test: (raw) => {
      // Extract all py-{n} values from section containers
      const pyValues = raw.match(/\bpy-(\d+)\b/g);
      if (!pyValues || pyValues.length < 4) return null;
      // Check if all py values are the same
      const unique = new Set(pyValues);
      if (unique.size === 1) {
        return `All sections use the same padding (${pyValues[0]}). Spacing must vary by section purpose.`;
      }
      return null;
    },
  },
  {
    rule: "footer must be a designed closure, not a utility strip",
    severity: "soft",
    hint: "Add brand closure (closing statement, wordmark, or typographic anchor), real contact info, and at least one non-link element to the footer.",
    test: (raw) => {
      const f = extractSection(raw, /Footer[\s\S]{0,3000}?===END_FILE===/i);
      if (!f) return null;
      // Check if footer is just links + copyright with nothing else
      const linkCount = countPattern(f, /<a /g);
      const hasClosingStatement = /©|all\s*rights|copyright/i.test(f);
      const hasBrandElement = /font-(?:serif|display)|text-(?:2xl|3xl|4xl)|playfair|cormorant|tiempos/i.test(f);
      const hasNonLink = /form|input|status|badge|newsletter|subscribe|hours|phone|address|license/i.test(f);
      if (linkCount >= 4 && !hasBrandElement && !hasNonLink && hasClosingStatement) {
        return "Footer is a utility strip with links + copyright but no brand closure, no non-link element.";
      }
      return null;
    },
  },

  // ── Typography ──
  {
    rule: "no text-8xl or text-9xl anywhere on page",
    severity: "hard",
    hint: "text-8xl (96px) and text-9xl (128px) cause viewport overflow on all standard screens. Maximum is text-7xl for short headlines, text-6xl for multi-word headlines.",
    test: (raw) => {
      if (/text-(?:8xl|9xl)/.test(raw)) {
        return "Page uses text-8xl or text-9xl which causes viewport overflow. Maximum allowed is text-7xl for short headlines.";
      }
      return null;
    },
  },

  // ── UI Primitive Usage ──
  {
    rule: "section components must import UI primitives",
    severity: "hard",
    hint: "Every section component should import and use Section + Container from @/components/ui/. Use the pre-injected primitives (Button, Input, Card, Heading, Badge, Section, Container) instead of rebuilding them from scratch.",
    test: (raw) => {
      // Extract all section component files (excluding Navbar, which may not need Section/Container)
      const sectionFiles = raw.match(/===FILE:src\/components\/(?!ui\/|Navbar)[A-Za-z]+\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!sectionFiles || sectionFiles.length === 0) return null;

      let sectionsWithoutPrimitives = 0;
      const badSections: string[] = [];

      for (const section of sectionFiles) {
        const nameMatch = section.match(/===FILE:src\/components\/([A-Za-z]+)\.tsx===/);
        const name = nameMatch ? nameMatch[1] : "unknown";

        // Check for imports from @/components/ui/
        const hasUiImport = /@\/components\/ui\//.test(section);
        if (!hasUiImport) {
          sectionsWithoutPrimitives++;
          badSections.push(name);
        }
      }

      if (sectionsWithoutPrimitives >= 2) {
        return `${sectionsWithoutPrimitives} section components (${badSections.join(", ")}) do not import any UI primitives from @/components/ui/. All sections must use the pre-injected primitives.`;
      }
      return null;
    },
  },
  {
    rule: "sections must not rebuild primitive components inline",
    severity: "hard",
    hint: "Import Button, Card, Section, Container, Heading from @/components/ui/ instead of rebuilding them inline. The primitives are pre-injected and stable.",
    test: (raw) => {
      // Check if section files define their own Button/Card/Section/Container components
      const sectionFiles = raw.match(/===FILE:src\/components\/(?!ui\/)[A-Za-z]+\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!sectionFiles) return null;

      let rebuilds = 0;
      const examples: string[] = [];

      for (const section of sectionFiles) {
        const nameMatch = section.match(/===FILE:src\/components\/([A-Za-z]+)\.tsx===/);
        const name = nameMatch ? nameMatch[1] : "unknown";

        // Detect inline component definitions that duplicate primitives
        const definesButton = /(?:function|const)\s+(?:Button|Btn)\s*[=(]/.test(section) && !/@\/components\/ui\/button/.test(section);
        const definesCard = /(?:function|const)\s+(?:Card|CardComponent)\s*[=(]/.test(section) && !/@\/components\/ui\/card/.test(section);

        if (definesButton || definesCard) {
          rebuilds++;
          examples.push(`${name} rebuilds ${definesButton ? "Button" : ""}${definesButton && definesCard ? "+" : ""}${definesCard ? "Card" : ""}`);
        }
      }

      if (rebuilds > 0) {
        return `${rebuilds} section(s) rebuild primitive components inline: ${examples.join("; ")}. Import from @/components/ui/ instead.`;
      }
      return null;
    },
  },
  {
    rule: "used UI primitives must be explicitly imported",
    severity: "hard",
    hint: "If a section renders Button, Card, Accordion, Tabs, Dialog, Sheet, MobileNav, Gallery, or other scaffold primitives, import the exact primitive module before using it.",
    test: (raw) => {
      const sectionFiles = raw.match(/===FILE:src\/components\/(?!ui\/)[A-Za-z]+\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!sectionFiles) return null;

      const failures: string[] = [];

      for (const section of sectionFiles) {
        const nameMatch = section.match(/===FILE:src\/components\/([A-Za-z]+)\.tsx===/);
        const name = nameMatch ? nameMatch[1] : "unknown";

        for (const rule of PRIMITIVE_IMPORT_RULES) {
          const usesPrimitive = rule.symbols.some((symbol) =>
            new RegExp(`<${symbol}(?=[\\s>])`).test(section)
          );
          if (!usesPrimitive) continue;

          const hasImport = section.includes(`from "${rule.path}"`) || section.includes(`from '${rule.path}'`);
          if (!hasImport) {
            failures.push(`${name} uses ${rule.symbols.join("/")} without importing ${rule.path}`);
          }
        }
      }

      if (failures.length > 0) {
        return failures.join("; ");
      }
      return null;
    },
  },
  {
    rule: "action surfaces must use Button for primary CTAs",
    severity: "hard",
    hint: "In Navbar, Hero, Contact, Conversion, CTA, Reservation, and similar action surfaces, use Button from @/components/ui/button instead of raw styled anchors/buttons for primary actions.",
    test: (raw) => {
      const actionFiles = raw.match(/===FILE:src\/components\/(?:Navbar|Hero|[A-Za-z]*(?:CTA|Contact|Conversion|Reservation))[A-Za-z]*\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!actionFiles) return null;

      const failures: string[] = [];
      for (const section of actionFiles) {
        const nameMatch = section.match(/===FILE:src\/components\/([A-Za-z]+)\.tsx===/);
        const name = nameMatch ? nameMatch[1] : "unknown";
        const hasButtonPrimitive = /from ["']@\/components\/ui\/button["']/.test(section) || /<Button\b/.test(section);
        const hasStyledRawAction = /<(?:button|a)\b[\s\S]{0,220}className="[^"]*(?:bg-|rounded|border|px-\d|py-\d)[^"]*"/.test(section);
        if (hasStyledRawAction && !hasButtonPrimitive) {
          failures.push(name);
        }
      }

      if (failures.length > 0) {
        return `Primary action surfaces use raw styled anchors/buttons instead of Button: ${failures.join(", ")}.`;
      }
      return null;
    },
  },

  // ── Page Composition Contract ──
  {
    rule: "App.tsx must import and render ordered section components",
    severity: "hard",
    hint: "App.tsx must import Navbar, Hero, at least 2 middle sections, and Footer, then render them in order. Do not return null or an empty fragment.",
    test: (raw) => {
      const app = extractSection(raw, /===FILE:src\/App\.tsx===\n[\s\S]*?===END_FILE===/i);
      if (!app) return "Missing src/App.tsx.";
      const importCount = countPattern(app, /from\s+["']\.\/components\//g);
      const renderCount = new Set(
        Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)).map((match) => match[1])
      );
      if (importCount < 3 || renderCount.size < 5) {
        return `App.tsx composition too thin: importCount=${importCount}, renderCount=${renderCount.size}.`;
      }
      if (/return\s*null|return\s*\(\s*\)/.test(app)) {
        return "App.tsx returns null or an empty fragment — it must render ordered section components.";
      }
      return null;
    },
  },
  // ── Primitive-First CTA Enforcement ──
  {
    rule: "CTA buttons must use Button primitive, not raw elements",
    severity: "soft",
    hint: "Import Button from @/components/ui/button and use <Button> instead of raw <a> or <button> elements for call-to-action buttons. Use variant='outline' for secondary CTAs.",
    test: (raw) => {
      const sectionFiles = raw.match(/===FILE:src\/components\/(?!ui\/)[A-Za-z]+\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!sectionFiles) return null;

      let rawCtaCount = 0;
      for (const section of sectionFiles) {
        const hasButtonImport = /@\/components\/ui\/button/.test(section);
        // Detect raw styled anchor/button elements that look like CTA buttons
        const rawStyledButtons = countPattern(section, /<(?:a|button)\s[^>]*(?:rounded-(?:lg|md|full|xl)|px-\d+\s+py-\d+)[^>]*>/g);
        if (rawStyledButtons > 0 && !hasButtonImport) {
          rawCtaCount += rawStyledButtons;
        }
      }

      if (rawCtaCount >= 2) {
        return rawCtaCount + " CTA-styled raw <a>/<button> elements found without Button primitive import. Use <Button> or <Button asChild><a>...</a></Button>.";
      }
      return null;
    },
  },

  // ── Mobile Navigation ──
  {
    rule: "navbar must have mobile navigation pattern",
    severity: "hard",
    hint: "Import MobileNav from @/components/ui/mobile-nav or use Sheet for mobile nav. Every navbar needs a responsive mobile menu — do not rely on md:hidden links alone.",
    test: (raw) => {
      const nav = extractSection(raw, /Navbar[\s\S]{0,3000}?===END_FILE===/i);
      if (!nav) return null;
      const hasMobileNav = /mobile-nav|MobileNav|SheetTrigger|Sheet/.test(nav);
      const hasHiddenDesktopNav = /hidden\s+md:flex|md:hidden/.test(nav);
      if (!hasMobileNav && hasHiddenDesktopNav) {
        return "Navbar hides desktop nav on mobile but has no MobileNav or Sheet for mobile users.";
      }
      return null;
    },
  },
  {
    rule: "sections must use composite primitives when applicable",
    severity: "soft",
    hint: "Use pre-injected Testimonial, StatsBand, or Gallery components instead of building equivalent patterns from scratch.",
    test: (raw) => {
      const sectionFiles = raw.match(/===FILE:src\/components\/(?!ui\/|Navbar)[A-Za-z]+\.tsx===\n[\s\S]*?===END_FILE===/g);
      if (!sectionFiles) return null;

      let rebuilds = 0;
      for (const section of sectionFiles) {
        // Detect inline testimonial/quote patterns without using the Testimonial primitive
        const hasQuotePattern = /blockquote[\s\S]{0,200}?figcaption|<blockquote[\s\S]{0,300}?<p[\s\S]{0,100}?author/i.test(section);
        const usesTestimonialPrimitive = /@\/components\/ui\/testimonial/.test(section);
        if (hasQuotePattern && !usesTestimonialPrimitive) rebuilds++;

        // Detect inline stats/metrics patterns without using StatsBand
        const hasStatsGrid = /grid-cols-(?:2|4)[\s\S]{0,200}?(?:font-bold|text-\d+xl)[\s\S]{0,100}?\+/.test(section);
        const usesStatsBand = /@\/components\/ui\/stats-band/.test(section);
        if (hasStatsGrid && !usesStatsBand) rebuilds++;
      }

      if (rebuilds >= 2) {
        return rebuilds + " section(s) rebuild composite patterns (testimonials, stats bands) that have pre-injected primitives. Use Testimonial, StatsBand, or Gallery instead.";
      }
      return null;
    },
  },

  // ── Image Role ──
  {
    rule: "images must not be generic scenic filler",
    severity: "hard",
    hint: "Replace generic scenic images (mountains, lakes, bridges, generic skylines) with niche-specific images that serve a composition role.",
    test: (raw) => {
      // Check for common generic Unsplash photo patterns in the image URLs/alt text
      const imgTags = raw.match(/<img[^>]*>/g);
      if (!imgTags) return null;
      const genericIndicators = /mountain|lake|sunset|bridge|ocean|forest|nature|landscape|aerial.*city|skyline/i;
      let genericCount = 0;
      for (const img of imgTags) {
        if (genericIndicators.test(img)) genericCount++;
      }
      if (genericCount >= 2) {
        return `${genericCount} images appear to be generic scenic filler (mountains, lakes, bridges, skylines). Use niche-specific images with composition roles.`;
      }
      return null;
    },
  },
  {
    rule: "sections must not use placeholder visual panels as fake media",
    severity: "hard",
    hint: "Replace empty framed rectangles, pulse-dot cards, generic browser-window shells, and faux dashboard slabs with real images or an intentional text-led composition.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      const offenders: string[] = [];
      for (const file of sectionFiles) {
        const hasRealMedia = /<img\b|projectImages\./.test(file.content);
        const hasPlaceholderPanel =
          /(pulse|animate-pulse|browser|window|dashboard|workflow|chrome)/i.test(file.content) &&
          /rounded-(?:xl|2xl|3xl)[\s\S]{0,220}(?:border|bg-card|bg-muted|backdrop-blur)/i.test(
            file.content
          ) &&
          !hasRealMedia;

        if (hasPlaceholderPanel) {
          offenders.push(file.path.replace(/^src\/components\//, ""));
        }
      }

      if (offenders.length > 0) {
        return `Placeholder-style visual panels detected without real media in: ${offenders.join(", ")}.`;
      }
      return null;
    },
  },
  {
    rule: "manifest assets must use generated local assets",
    severity: "soft",
    hint: "Use Cenate generated assets with source \"generated\". External stock URLs and fallback-heavy manifests are below the target quality bar.",
    test: (raw) => {
      const manifest = extractSection(raw, /===PROJECT_MANIFEST===[\s\S]*?===END_MANIFEST===/i);
      if (!manifest) return null;
      const generatedCount = countPattern(manifest, /"source"\s*:\s*"generated"/g);
      const fallbackCount = countPattern(manifest, /"source"\s*:\s*"fallback"/g);
      if (generatedCount === 0 || fallbackCount >= 2) {
        return `Manifest assets are not using the generated local asset contract. generated=${generatedCount}, fallback=${fallbackCount}.`;
      }
      if (/images\.unsplash\.com|https?:\/\/(?!data:image)/.test(manifest)) {
        return "Manifest still contains external image URLs. Use generated local assets only.";
      }
      return null;
    },
  },
  {
    rule: "CTA must include a real action surface",
    severity: "soft",
    hint: "Add a real form (email, fields), real contact info (email, phone), or a booking interface. A headline + buttons alone is not a conversion surface.",
    test: (raw) => {
      const c = extractSection(raw, /(?:CTA|Conversion|Contact|Reservation|Booking|Estimate|Inquiry)[\s\S]{0,3000}?===END_FILE===/i);
      if (!c) return null;
      const hasForm = /<form|<input|<textarea|<select/i.test(c);
      const hasRealContact = /email|phone|@|tel:/i.test(c);
      if (!hasForm && !hasRealContact) {
        return "CTA/conversion section has no form fields and no real contact info. It's just buttons.";
      }
      return null;
    },
  },

  // ── Section + Container + Heading primitive enforcement ──
  {
    rule: "every section component must use Section and Container wrappers",
    severity: "hard",
    hint: "Wrap section content in <Section> and <Container> from @/components/ui/. Every body section must use these structural primitives.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw).filter(
        (file) => !/(?:Navbar|Footer)\.tsx$/.test(file.path)
      );
      if (sectionFiles.length === 0) return null;

      const missing: string[] = [];
      for (const file of sectionFiles) {
        const hasSection = /<Section\b/.test(file.content) || /@\/components\/ui\/section/.test(file.content);
        const hasContainer = /<Container\b/.test(file.content) || /@\/components\/ui\/container/.test(file.content);
        if (!hasSection || !hasContainer) {
          const name = file.path.replace(/^src\/components\//, "").replace(/\.tsx$/, "");
          missing.push(name);
        }
      }

      if (missing.length >= 2) {
        return `${missing.length} sections (${missing.join(", ")}) missing Section/Container wrappers. All body sections must use these primitives.`;
      }
      return null;
    },
  },
  {
    rule: "every section component must use Heading for titles",
    severity: "soft",
    hint: "Use <Heading> from @/components/ui/heading for section titles instead of raw h2/h3 tags. This ensures consistent typography hierarchy.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw).filter(
        (file) => !/(?:Navbar|Footer)\.tsx$/.test(file.path)
      );
      if (sectionFiles.length === 0) return null;

      let withoutHeading = 0;
      for (const file of sectionFiles) {
        const hasHeadingPrimitive = /<Heading\b/.test(file.content) || /@\/components\/ui\/heading/.test(file.content);
        const hasRawHeading = /<h[1-4]\b/.test(file.content);
        if (!hasHeadingPrimitive && hasRawHeading) {
          withoutHeading++;
        }
      }

      if (withoutHeading >= 2) {
        return `${withoutHeading} sections use raw h1-h4 tags instead of the Heading primitive. Import Heading from @/components/ui/heading for consistent typography.`;
      }
      return null;
    },
  },

  // ── Consecutive layout detection ──
  {
    rule: "no two consecutive sections may share the same layout signature",
    severity: "hard",
    hint: "Adjacent sections must use different layout patterns. If two consecutive sections both use 'grid' or 'split', restructure one of them.",
    test: (raw) => {
      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;

      // Extract section component names in render order
      const rendered = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g))
        .map((m) => m[1])
        .filter((name) => !["React", "Navbar", "Footer"].includes(name));
      const uniqueOrdered: string[] = [];
      const seen = new Set<string>();
      for (const name of rendered) {
        if (!seen.has(name)) {
          seen.add(name);
          uniqueOrdered.push(name);
        }
      }

      // Skip Hero, get body sections in order
      const bodySections = uniqueOrdered.filter((name) => name !== "Hero");
      if (bodySections.length < 2) return null;

      const signatures: string[] = [];
      for (const name of bodySections) {
        const content = extractFileBlock(raw, `src/components/${name}.tsx`);
        if (content) {
          signatures.push(getLayoutSignature(content));
        }
      }

      for (let i = 1; i < signatures.length; i++) {
        if (signatures[i] !== "other" && signatures[i] === signatures[i - 1]) {
          return `Consecutive sections ${bodySections[i - 1]} and ${bodySections[i]} share the same layout (${signatures[i]}). Adjacent sections must differ.`;
        }
      }
      return null;
    },
  },

  // ── Spacing variation ──
  {
    rule: "sections must use varied vertical spacing",
    severity: "soft",
    hint: "Use at least 3 different py-N values across sections to create visual rhythm. Vary spacing by section purpose (hero generous, content standard, accent tight).",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length < 3) return null;

      const pyValues = new Set<string>();
      for (const file of sectionFiles) {
        const matches = file.content.match(/\bpy-(\d+)\b/g);
        if (matches) {
          for (const m of matches) pyValues.add(m);
        }
      }

      if (pyValues.size <= 1 && sectionFiles.length >= 3) {
        return `All sections use the same vertical padding. Use at least 3 different py-N values for visual rhythm.`;
      }
      return null;
    },
  },

  // ── Surface variation ──
  {
    rule: "page must have at least 2 visible surface shifts",
    severity: "soft",
    hint: "Use alternating backgrounds across sections (bg-background, bg-card, bg-muted, bg-zinc-950, etc.) to create visual separation.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length < 3) return null;

      const backgrounds = new Set<string>();
      for (const file of sectionFiles) {
        const bgMatch = file.content.match(/\bbg-(?:background|card|muted|secondary|zinc-\d+|slate-\d+|neutral-\d+|stone-\d+|gray-\d+)/);
        if (bgMatch) backgrounds.add(bgMatch[0]);
      }

      if (backgrounds.size <= 1) {
        return "All sections appear to use the same background. Add at least 2 visible surface shifts for visual separation.";
      }
      return null;
    },
  },

  // ── Design System Token Enforcement ──
  {
    rule: "sections must use semantic design tokens, not raw hex colors",
    severity: "soft",
    hint: "Replace raw hex colors (#fff, #000, #334155, etc.) with semantic tokens: bg-background, text-foreground, bg-card, text-muted-foreground, bg-primary, text-primary, border-border, etc.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let rawHexCount = 0;
      for (const file of sectionFiles) {
        // Count raw hex colors in className strings (not in SVG paths or data attributes)
        const classHexes = file.content.match(/className="[^"]*#[0-9a-fA-F]{3,8}[^"]*"/g);
        if (classHexes) rawHexCount += classHexes.length;
        // Count inline style hex colors
        const styleHexes = file.content.match(/style=\{[^}]*#[0-9a-fA-F]{3,8}[^}]*\}/g);
        if (styleHexes) rawHexCount += styleHexes.length;
      }

      if (rawHexCount >= 3) {
        return `${rawHexCount} instances of raw hex colors found in section components. Use semantic design tokens (bg-background, text-foreground, bg-primary, etc.) instead.`;
      }
      return null;
    },
  },

  // ── Section Identity Enforcement ──
  {
    rule: "adjacent sections must have distinct visual identity",
    severity: "hard",
    hint: "Each section must differ from its neighbor in alignment, density, or surface. Rebuild one section if two adjacent sections share centered alignment + same background + same layout.",
    test: (raw) => {
      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;

      const rendered = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g))
        .map((m) => m[1])
        .filter((name) => !["React", "Navbar", "Footer"].includes(name));
      const uniqueOrdered: string[] = [];
      const seen = new Set<string>();
      for (const name of rendered) {
        if (!seen.has(name)) { seen.add(name); uniqueOrdered.push(name); }
      }

      if (uniqueOrdered.length < 2) return null;

      type SectionTraits = { centered: boolean; bg: string; layout: string };
      const traits: SectionTraits[] = [];
      for (const name of uniqueOrdered) {
        const content = extractFileBlock(raw, `src/components/${name}.tsx`);
        if (!content) { traits.push({ centered: false, bg: "unknown", layout: "other" }); continue; }
        const centered = /text-center/.test(content);
        const bgMatch = content.match(/\bbg-(background|card|muted|secondary|zinc-\d+|slate-\d+|neutral-\d+|stone-\d+)/);
        const bg = bgMatch ? bgMatch[0] : "default";
        const layout = getLayoutSignature(content);
        traits.push({ centered, bg, layout });
      }

      for (let i = 1; i < traits.length; i++) {
        const prev = traits[i - 1];
        const curr = traits[i];
        if (prev.centered && curr.centered && prev.bg === curr.bg && prev.layout === curr.layout && prev.layout !== "other") {
          return `Sections ${uniqueOrdered[i - 1]} and ${uniqueOrdered[i]} share identical visual identity (both centered, same background "${curr.bg}", same layout "${curr.layout}"). Rebuild one.`;
        }
      }
      return null;
    },
  },
  {
    rule: "no card shell may appear in more than 2 sections",
    severity: "hard",
    hint: "Vary card treatments across sections. Use different backgrounds, border styles, radius, or padding. Features, testimonials, and pricing should each look distinct.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw).filter(
        (file) => !/(?:Navbar|Footer)\.tsx$/.test(file.path)
      );
      if (sectionFiles.length < 3) return null;

      // Detect sections using the common rounded card shell pattern
      let cardShellSections = 0;
      for (const file of sectionFiles) {
        const hasCardShell = /rounded-(?:xl|2xl|3xl)[\s\S]{0,120}border[\s\S]{0,120}(?:bg-card|bg-muted|surface-card|backdrop-blur)/i.test(file.content);
        const cardCount = countPattern(file.content, /rounded-(?:xl|2xl|3xl)/g);
        if (hasCardShell && cardCount >= 3) cardShellSections++;
      }

      if (cardShellSections >= 3) {
        return `${cardShellSections} sections use the same rounded card shell pattern (3+ cards each). Maximum 2 sections may share a card shell. Vary card treatments.`;
      }
      return null;
    },
  },

  // ── Image System Enforcement ──
  {
    rule: "section images must use projectImages from generated-images module",
    severity: "hard",
    hint: "Import projectImages from '@/assets/generated-images' and use projectImages.hero, projectImages.support, etc. No Unsplash or external URLs.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let externalUrlCount = 0;
      const offenders: string[] = [];
      for (const file of sectionFiles) {
        const hasExternalImg = /(?:src|image|img)=["']https?:\/\/(?!data:)/.test(file.content);
        const hasUnsplash = /unsplash\.com/.test(file.content);
        if (hasExternalImg || hasUnsplash) {
          externalUrlCount++;
          const name = file.path.replace(/^src\/components\//, "").replace(/\.tsx$/, "");
          offenders.push(name);
        }
      }

      if (externalUrlCount > 0) {
        return `${externalUrlCount} section(s) (${offenders.join(", ")}) use external image URLs. Use projectImages.* from "@/assets/generated-images" only.`;
      }
      return null;
    },
  },
  {
    rule: "images must have explicit size control",
    severity: "soft",
    hint: "Wrap every <img> in a container with explicit dimensions: aspect-ratio, height class, or grid framing. Add object-cover to prevent distortion.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let unsizedImages = 0;
      for (const file of sectionFiles) {
        // Find img tags that lack size control
        const imgTags = file.content.match(/<img[^>]*>/g);
        if (!imgTags) continue;
        for (const img of imgTags) {
          const hasObjectFit = /object-cover|object-contain/.test(img);
          const hasSizeClass = /\bh-\[|h-full|w-full|aspect-/.test(img);
          if (!hasObjectFit && !hasSizeClass) unsizedImages++;
        }
      }

      if (unsizedImages >= 2) {
        return `${unsizedImages} images lack size control (no object-cover, no height/width class). Wrap images in sized containers with object-cover.`;
      }
      return null;
    },
  },

  // ── Anti-Generic: All Sections Centered ──
  {
    rule: "not all sections may use centered text alignment",
    severity: "hard",
    hint: "At least 2 body sections must use text-left or asymmetric alignment. Centered-only pages look generic.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw).filter(
        (file) => !/(?:Navbar|Footer)\.tsx$/.test(file.path)
      );
      if (sectionFiles.length < 3) return null;

      let centeredCount = 0;
      for (const file of sectionFiles) {
        if (/text-center/.test(file.content) && !/text-left/.test(file.content)) {
          centeredCount++;
        }
      }

      if (centeredCount >= sectionFiles.length - 1 && sectionFiles.length >= 3) {
        return `${centeredCount} of ${sectionFiles.length} body sections use centered-only alignment. At least 2 sections must use left-aligned or asymmetric layouts.`;
      }
      return null;
    },
  },

  // ── Anti-Generic: All Buttons Same Variant ──
  {
    rule: "page must vary Button variants",
    severity: "soft",
    hint: "Use different Button variants across the page: primary for main CTAs, variant='outline' for secondary, variant='ghost' for tertiary actions.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let totalButtons = 0;
      let hasVariant = false;
      for (const file of sectionFiles) {
        const buttonTags = countPattern(file.content, /<Button\b/g);
        totalButtons += buttonTags;
        if (/variant=/.test(file.content)) hasVariant = true;
      }

      if (totalButtons >= 4 && !hasVariant) {
        return `${totalButtons} Button components on the page but none use variant= prop. Vary between primary, outline, ghost, and link variants.`;
      }
      return null;
    },
  },

  // ── Anti-Generic: Flat Typography Hierarchy ──
  {
    rule: "page must show clear typography size hierarchy",
    severity: "soft",
    hint: "Use distinct text sizes: hero headline text-4xl to text-6xl, section headings text-2xl to text-4xl, body text-base to text-lg, labels text-xs to text-sm. Not all headings the same size.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length < 3) return null;

      const headingSizes = new Set<string>();
      for (const file of sectionFiles) {
        const sizeMatches = file.content.match(/text-(?:xl|2xl|3xl|4xl|5xl|6xl)/g);
        if (sizeMatches) {
          for (const s of sizeMatches) headingSizes.add(s);
        }
      }

      if (headingSizes.size <= 1 && sectionFiles.length >= 3) {
        return `All sections use the same heading size (${[...headingSizes].join(", ") || "none found"}). Create clear typography hierarchy with varied sizes.`;
      }
      return null;
    },
  },

  // ── Anti-Generic: Gradient Soup ──
  {
    rule: "page must not rely on gradient meshes, blur blobs, and pulse dots for visual interest",
    severity: "soft",
    hint: "Premium feel should come from structure: typography hierarchy, density shifts, asymmetric composition, real media. Not from blur-xl, gradient-mesh, pulse, or glow rings.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let decorativeCount = 0;
      for (const file of sectionFiles) {
        const blurs = countPattern(file.content, /blur-(?:xl|2xl|3xl)/g);
        const pulses = countPattern(file.content, /animate-pulse/g);
        const glows = countPattern(file.content, /shadow-(?:lg|xl|2xl)[\s\S]{0,60}(?:primary|accent|blue|purple|emerald)/g);
        decorativeCount += blurs + pulses + glows;
      }

      if (decorativeCount >= 6) {
        return `Page uses ${decorativeCount} decorative blur/pulse/glow effects. Premium feel should come from structure, not gradient soup.`;
      }
      return null;
    },
  },

  // ── Design Review: Card Gap Minimum ──
  {
    rule: "card grids must use gap-6 or larger",
    severity: "soft",
    hint: "Replace gap-2, gap-3, gap-4 on card grids with gap-6 minimum for breathing room between cards.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let tightGaps = 0;
      for (const file of sectionFiles) {
        // Find grid containers with cards (rounded + border) that use tight gaps
        const hasCardGrid = /grid-cols-[23][\s\S]{0,300}rounded-(?:xl|2xl|3xl)/g.test(file.content);
        if (hasCardGrid) {
          const tightGap = /\bgap-[234]\b/.test(file.content) && !/\bgap-[6789]\b/.test(file.content);
          if (tightGap) tightGaps++;
        }
      }

      if (tightGaps >= 2) {
        return `${tightGaps} card grids use tight spacing (gap-2 to gap-4). Use gap-6 minimum for card layouts.`;
      }
      return null;
    },
  },

  // ── Design Review: Font Family Tokens ──
  {
    rule: "headings must use font-heading, not raw font-serif or font-sans",
    severity: "soft",
    hint: "Replace font-serif with font-heading and font-sans with font-body. Use the design system's font tokens.",
    test: (raw) => {
      const sectionFiles = extractSectionFiles(raw);
      if (sectionFiles.length === 0) return null;

      let rawFontCount = 0;
      for (const file of sectionFiles) {
        // Detect raw font-serif/font-sans in className (not in CSS variables)
        const rawFonts = countPattern(file.content, /className="[^"]*\bfont-(?:serif|sans)\b[^"]*"/g);
        rawFontCount += rawFonts;
      }

      if (rawFontCount >= 3) {
        return `${rawFontCount} elements use raw font-serif or font-sans instead of font-heading/font-body design tokens.`;
      }
      return null;
    },
  },

  // ── Anti-generic pattern: stats-row immediately below hero that also has stats ──
  {
    rule: "first body section must not duplicate hero stats rail",
    severity: "soft",
    hint: "If the hero already contains a stats row (3–4 metric items), the first body section should not also be a stats band. Use a narrative, gallery, or service section as the first body section instead.",
    test: (raw) => {
      const hero = extractFileBlock(raw, "src/components/Hero.tsx");
      if (!hero) return null;
      const heroHasStats =
        /StatsBand/.test(hero) ||
        (/grid-cols-[234]/.test(hero) && /(?:text-[2-4]xl|font-bold)[\s\S]{0,200}(?:%|\+|clients|projects|years|uptime)/i.test(hero));
      if (!heroHasStats) return null;

      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;
      const rendered = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g))
        .map((m) => m[1])
        .filter((name) => !["React", "Navbar", "Hero", "Footer"].includes(name));
      const unique: string[] = [];
      const seen = new Set<string>();
      for (const name of rendered) {
        if (!seen.has(name)) { seen.add(name); unique.push(name); }
      }
      if (unique.length === 0) return null;
      const firstContent = extractFileBlock(raw, `src/components/${unique[0]}.tsx`);
      if (!firstContent) return null;
      const firstHasStats =
        /StatsBand/.test(firstContent) ||
        (/grid-cols-[234]/.test(firstContent) && /(?:text-[2-4]xl|font-bold)[\s\S]{0,200}(?:%|\+|clients|projects|years|uptime)/i.test(firstContent));
      if (firstHasStats) {
        return `Hero has a stats rail and first body section (${unique[0]}) is also stats-heavy. Avoid back-to-back metric rows.`;
      }
      return null;
    },
  },

  // ── Anti-generic pattern: hero followed by card grid ──
  {
    rule: "page must not follow hero immediately with a 3-card grid",
    severity: "soft",
    hint: "The first body section after Hero should not be a 3-card grid. Start with a narrative, split, or manifesto section instead.",
    test: (raw) => {
      const app = extractFileBlock(raw, "src/App.tsx");
      if (!app) return null;

      const rendered = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g))
        .map((m) => m[1])
        .filter((name) => !["React", "Navbar", "Footer", "Hero"].includes(name));

      const uniqueOrdered: string[] = [];
      const seen = new Set<string>();
      for (const name of rendered) {
        if (!seen.has(name)) {
          seen.add(name);
          uniqueOrdered.push(name);
        }
      }

      if (uniqueOrdered.length === 0) return null;
      const firstSection = uniqueOrdered[0];
      const content = extractFileBlock(raw, `src/components/${firstSection}.tsx`);
      if (!content) return null;

      const isCardGrid = /(?:md|lg):grid-cols-3[\s\S]{0,500}?rounded-(?:xl|2xl|3xl)/.test(content);
      if (isCardGrid) {
        return `First body section (${firstSection}) after Hero is a 3-card grid. This is the most generic landing page pattern. Use a narrative, split, or manifesto section first.`;
      }
      return null;
    },
  },
];

// ──────────────────────────────────────────────
// NICHE-SPECIFIC DETECTORS
// ──────────────────────────────────────────────
const NICHE_DETECTORS: Partial<Record<Niche, Detector[]>> = {
  saas: [
    {
      rule: "saas pricing must NOT be three uniform cards",
      severity: "hard",
      hint: "Use a comparison table, 2+1 asymmetric highlight, single-plan hero, or stacked tier ladder.",
      test: (raw) => {
        const p = extractSection(raw, /Pricing[\s\S]{0,3000}?===END_FILE===/i);
        if (!p) return null;
        if (/(?:md|lg):grid-cols-3/.test(p)) {
          const cardShells = countPattern(p, /rounded-(?:xl|2xl|3xl)/g);
          if (cardShells >= 3) {
            return "Pricing section uses md/lg:grid-cols-3 with 3+ uniform rounded card shells.";
          }
        }
        return null;
      },
    },
    {
      rule: "saas hero must show a real product surface",
      severity: "hard",
      hint: "Show an inset product window with visible chrome, an edge-bleeding product screen, or an equal-weight split with the product surface as primary content.",
      test: (raw) => {
        const h = extractSection(raw, /Hero[\s\S]{0,4000}?===END_FILE===/i);
        if (!h) return null;
        const hasGradientMesh = /bg-gradient-to|gradient-mesh/.test(h);
        const hasBlob = /blur-(?:2xl|3xl)|blob/.test(h);
        const hasProductChrome = /(?:dashboard|window|chrome|titlebar|app-window|product-surface|toolbar|sidebar|panel)/i.test(h);
        const hasProductUI = /(?:chart|table|workflow|editor|canvas|command|palette|metric)/i.test(h);
        if (hasGradientMesh && hasBlob && !hasProductChrome && !hasProductUI) {
          return "Hero relies on gradient mesh + blur blobs without a real product surface.";
        }
        return null;
      },
    },
    {
      rule: "saas sections must not all use the same card shell",
      severity: "hard",
      hint: "Features, testimonials, and pricing must each use visually distinct composition language — different density, alignment, background, and card shape.",
      test: (raw) => {
        // Count sections reusing the backdrop-blur card shell
        const blurCardShell = /bg-[\w/]+\s+backdrop-blur[\s\S]{0,80}?border[\s\S]{0,80}?white\/\d+[\s\S]{0,80}?rounded-(?:xl|2xl)/g;
        const shellCount = countPattern(raw, blurCardShell);
        if (shellCount >= 9) { // 3+ sections with 3+ cards each
          return `Backdrop-blur card shell repeated ${shellCount} times across sections. Features, testimonials, and pricing must use distinct composition.`;
        }
        return null;
      },
    },
  ],
  portfolio: [
    {
      rule: "portfolio selected work must NOT be alternating 7/4 rail",
      severity: "hard",
      hint: "Use a stacked editorial case-study, asymmetric project index, offset overlap grid, horizontal scroll rail, or single hero project + secondary strip.",
      test: (raw) => {
        const w = extractSection(raw, /Selected[A-Za-z]*Work[\s\S]{0,4000}?===END_FILE===/i);
        if (!w) return null;
        const has74 = /col-span-7|col-span-5|grid-cols-12[\s\S]*col-span-(?:7|5)/.test(w);
        const flipPattern = /md:flex-row-reverse|lg:flex-row-reverse/.test(w);
        if (has74 || flipPattern) {
          return "Selected Work uses a 7/4 (or row-reverse alternating) rail.";
        }
        return null;
      },
    },
    {
      rule: "portfolio process must NOT be four numbered steps",
      severity: "hard",
      hint: "Use a narrative with inline numbered markers, a vertical timeline with asymmetric media, or omit process entirely.",
      test: (raw) => {
        const p = extractSection(raw, /Process[\s\S]{0,3000}?===END_FILE===/i);
        if (!p) return null;
        const hasNumberedLabels = /(?:01|02|03|04)[\s\S]*(?:01|02|03|04)/.test(p);
        const hasGrid4 = /grid-cols-4|md:grid-cols-2 lg:grid-cols-4/.test(p);
        if (hasNumberedLabels && hasGrid4) {
          return "Process uses 4 numbered cards (01/02/03/04 grid).";
        }
        return null;
      },
    },
    {
      rule: "portfolio about must NOT use stat chips",
      severity: "hard",
      hint: "Use first-person long-form, typographic manifesto, interview Q&A, or timeline of practice.",
      test: (raw) => {
        const a = extractSection(raw, /About[\s\S]{0,3000}?===END_FILE===/i);
        if (!a) return null;
        if (/50\+|10\+|12\s*(?:awards|years|projects)/i.test(a) && /grid-cols-(?:2|3|4)/.test(a)) {
          return "About uses '50+ / 12' stat chips in a grid.";
        }
        return null;
      },
    },
    {
      rule: "portfolio must sustain images across 3+ sections beyond hero",
      severity: "hard",
      hint: "Add real images (from curated library or Unsplash) to at least 3 sections after the hero. Portfolio pages must be image-led throughout.",
      test: (raw) => {
        const sections = raw.match(/===FILE:src\/components\/[\s\S]*?===END_FILE===/g);
        if (!sections || sections.length < 4) return null;
        // Skip first section (hero) and count sections with images
        let sectionsWithImages = 0;
        for (let i = 1; i < sections.length; i++) {
          if (/unsplash|<img/i.test(sections[i])) sectionsWithImages++;
        }
        if (sectionsWithImages < 3) {
          return `Only ${sectionsWithImages} sections after hero have images (need 3+). Portfolio pages must be image-led throughout.`;
        }
        return null;
      },
    },
  ],
  restaurant: [
    {
      rule: "restaurant menu must NOT be a 3-card grid",
      severity: "hard",
      hint: "Use an editorial ruled list with name + description + price OR a narrative tasting menu.",
      test: (raw) => {
        const u = extractSection(raw, /Menu[A-Za-z]*[\s\S]{0,3000}?===END_FILE===/i);
        if (!u) return null;
        if (/grid-cols-3/.test(u) && /rounded-(?:xl|2xl)/.test(u)) {
          return "Menu uses a 3-card grid with rounded card shells.";
        }
        return null;
      },
    },
    {
      rule: "restaurant gallery must NOT be uniform 3-column",
      severity: "hard",
      hint: "Use an asymmetric multi-column layout (e.g. 8/4 with one large + stacked secondaries).",
      test: (raw) => {
        const g = extractSection(raw, /Gallery[\s\S]{0,3000}?===END_FILE===/i);
        if (!g) return null;
        if (/grid-cols-3/.test(g) && !/col-span-2|col-span-3|col-span-7|col-span-5/.test(g)) {
          return "Gallery uses uniform grid-cols-3 without asymmetric spans.";
        }
        return null;
      },
    },
    {
      rule: "restaurant must sustain images across 4+ sections",
      severity: "hard",
      hint: "Restaurant pages are image-led. Add food/venue photography to at least 4 sections.",
      test: (raw) => {
        const sections = raw.match(/===FILE:src\/components\/[\s\S]*?===END_FILE===/g);
        if (!sections || sections.length < 5) return null;
        let sectionsWithImages = 0;
        for (const s of sections) {
          if (/unsplash|<img/i.test(s)) sectionsWithImages++;
        }
        if (sectionsWithImages < 4) {
          return `Only ${sectionsWithImages} sections have images (need 4+). Restaurant pages must be image-led throughout.`;
        }
        return null;
      },
    },
  ],
  construction: [
    {
      rule: "construction hero must show a real project, not stock",
      severity: "hard",
      hint: "Use a real construction project photo (building, renovation, site). Not a generic handshake, office, or skyline.",
      test: (raw) => {
        const h = extractSection(raw, /Hero[\s\S]{0,3000}?===END_FILE===/i);
        if (!h) return null;
        // Look for signs of generic stock instead of construction content
        const hasConstructionContent = /(?:build|construct|project|site|renovation|hardhat|blueprint|crew|contractor)/i.test(h);
        if (!hasConstructionContent && /unsplash|<img/i.test(h)) {
          return "Hero has an image but no construction-related content indicators. Ensure the hero photo shows a real project.";
        }
        return null;
      },
    },
    {
      rule: "construction hero must not use software/product panel visuals",
      severity: "hard",
      hint: "Construction hero media must show a real build, site, crew, or finished structure. Do not use browser-window or dashboard-style panels.",
      test: (raw) => {
        const h = extractSection(raw, /Hero[\s\S]{0,3200}?===END_FILE===/i);
        if (!h) return null;
        const hasSoftwarePanel = /(dashboard|workflow|browser|window|analytics|toolbar|sidebar|chrome)/i.test(h);
        const hasRealMedia = /<img\b|projectImages\./.test(h);
        if (hasSoftwarePanel && !hasRealMedia) {
          return "Construction hero uses a software/product-style panel instead of real project media.";
        }
        return null;
      },
    },
  ],
  realEstate: [
    {
      rule: "real estate must show property photography, not generic stock",
      severity: "hard",
      hint: "Use real property photography (exteriors, interiors, neighborhoods). Not generic skylines or stock photos.",
      test: (raw) => {
        const sections = raw.match(/===FILE:src\/components\/[\s\S]*?===END_FILE===/g);
        if (!sections || sections.length < 4) return null;
        let sectionsWithImages = 0;
        for (const s of sections) {
          if (/unsplash|<img/i.test(s)) sectionsWithImages++;
        }
        if (sectionsWithImages < 3) {
          return `Only ${sectionsWithImages} sections have property images (need 3+). Real estate pages must be property-photography-led.`;
        }
        return null;
      },
    },
  ],
};

function createStarterBaseDetectors(
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): Detector[] {
  const starterBase = getVariantStarterBase(niche, variantPlan);
  if (!starterBase) return [];

  return [
    {
      rule: "output must include the starter-base component scaffold",
      severity: "hard",
      hint: `Emit the exact starter-base component files for ${starterBase.name}: ${starterBase.componentFiles.join(", ")}.`,
      test: (raw) => {
        const missing = starterBase.componentFiles.filter(
          (filePath) => !hasFileBlock(raw, filePath)
        );
        if (missing.length > 0) {
          return `Missing starter-base component files: ${missing.join(", ")}.`;
        }
        return null;
      },
    },
  ];
}

// ──────────────────────────────────────────────
// STYLE-COMPLIANCE DETECTORS — run when a routed style is active
// ──────────────────────────────────────────────

type StyleSpec = {
  fontSignatures: RegExp[];
  colorMode: "dark" | "light";
  darkBgPattern: RegExp;
  accentName: string;
  accentHueRange: [number, number];
};

const STYLE_SPECS: Record<string, StyleSpec> = {
  editorial_luxury: {
    fontSignatures: [/Playfair/i],
    colorMode: "dark",
    darkBgPattern: /--background:\s*\d+\s+\d+%\s+[0-9]{1,2}%/,
    accentName: "brass/gold",
    accentHueRange: [25, 50],
  },
  modern_minimal: {
    fontSignatures: [/Inter/i],
    colorMode: "light",
    darkBgPattern: /--background:\s*\d+\s+\d+%\s+9[0-9]%/,
    accentName: "blue/indigo/teal",
    accentHueRange: [170, 270],
  },
  bold_commercial: {
    fontSignatures: [/Bebas|Barlow/i],
    colorMode: "dark",
    darkBgPattern: /--background:\s*\d+\s+\d+%\s+[0-9]{1,2}%/,
    accentName: "amber/orange/red",
    accentHueRange: [0, 40],
  },
  warm_artisan: {
    fontSignatures: [/Playfair/i],
    colorMode: "light",
    darkBgPattern: /--background:\s*\d+\s+\d+%\s+9[0-9]%/,
    accentName: "terracotta/warm earth",
    accentHueRange: [10, 35],
  },
};

// Per-style, per-direction expected --primary hue range [min, max].
// Soft check: if the generated index.css has a --primary hue outside this range
// it means the model ignored the palette direction binding.
const PALETTE_HUE_RANGES: Record<string, Record<string, [number, number]>> = {
  bold_commercial: {
    A: [20, 36],   // Amber & Charcoal
    B: [0, 8],     // Electric Red & Dark Steel (wraps near 360 too, checked separately)
    C: [75, 92],   // Neon Lime & Black
    D: [10, 22],   // Hot Orange & Navy
  },
  editorial_luxury: {
    A: [30, 45],   // Brass & Graphite
    B: [14, 28],   // Copper & Midnight
    C: [36, 50],   // Champagne & Charcoal
    D: [28, 42],   // Warm Gold & Deep Wine
  },
  modern_minimal: {
    A: [215, 232],  // Cool Blue
    B: [235, 252],  // Deep Indigo
    C: [162, 182],  // Teal Focus
    D: [252, 272],  // Violet Edge
  },
  warm_artisan: {
    A: [14, 28],   // Terracotta & Cream
    B: [130, 155], // Sage & Linen
    C: [20, 35],   // Clay & Oat
    D: [8, 22],    // Rust & Ivory
  },
};

function createPaletteDirectionDetector(styleId: string, paletteDirection: string): Detector[] {
  const styleRanges = PALETTE_HUE_RANGES[styleId];
  if (!styleRanges) return [];
  const range = styleRanges[paletteDirection];
  if (!range) return [];

  return [
    {
      rule: `palette direction compliance: ${styleId} direction ${paletteDirection}`,
      severity: "soft",
      hint: `The pre-selected palette direction ${paletteDirection} for ${styleId} expects --primary hue in [${range[0]}, ${range[1]}] in src/index.css. Check that the CSS override from BINDING DESIGN CHOICES was applied.`,
      test: (raw) => {
        const globals = extractFileBlock(raw, "src/index.css") ?? extractFileBlock(raw, "src/globals.css") ?? "";
        if (!globals) return null;
        const primaryMatch = globals.match(/--primary:\s*(\d+)\s+/);
        if (!primaryMatch) return null;
        const hue = parseInt(primaryMatch[1], 10);
        // Special handling for red (wraps near 360)
        if (styleId === "bold_commercial" && paletteDirection === "B") {
          if (hue > 8 && hue < 352) {
            return `Palette direction B (Electric Red) expects --primary hue near 0–8 or 352–360, but found ${hue}. Apply the binding palette CSS override.`;
          }
          return null;
        }
        if (hue < range[0] || hue > range[1]) {
          return `Palette direction ${paletteDirection} expects --primary hue in [${range[0]}, ${range[1]}], but found ${hue}. Apply the binding palette CSS override.`;
        }
        return null;
      },
    },
  ];
}

function createPageArchetypeOpeningDetector(pageArchetypeName: string): Detector[] {
  type ArchetypeSpec = { checkFor: RegExp; failPattern: RegExp; hint: string };
  const ENFORCED: Record<string, ArchetypeSpec> = {
    "proof-wall": {
      checkFor: /StatsBand|stats-band|grid-cols-[234][\s\S]{0,200}(?:text-[2-4]xl|font-bold)[\s\S]{0,100}(?:%|\+|clients|projects|years|uptime|awards|licensed)/i,
      failPattern: /(?:md|lg):grid-cols-3[\s\S]{0,500}?rounded-(?:xl|2xl|3xl)/,
      hint: "proof-wall archetype requires the first body section to be a stats-band or credential gallery. Reorder sections so stats come before services.",
    },
    "social-proof-led": {
      checkFor: /StatsBand|stats-band|grid-cols-[234][\s\S]{0,200}(?:text-[2-4]xl|font-bold)[\s\S]{0,100}(?:%|\+|clients|uptime|integrations|customers)/i,
      failPattern: /(?:md|lg):grid-cols-3[\s\S]{0,500}?rounded-(?:xl|2xl|3xl)/,
      hint: "social-proof-led archetype requires the first body section to be a metrics band or logo-proof strip.",
    },
    "authority-showcase": {
      checkFor: /<img\b|projectImages\.|Gallery\b|gallery/i,
      failPattern: /(?:md|lg):grid-cols-3[\s\S]{0,500}?rounded-(?:xl|2xl|3xl)/,
      hint: "authority-showcase archetype requires the first body section to feature a project showcase or gallery, not a services grid.",
    },
  };

  const spec = ENFORCED[pageArchetypeName];
  if (!spec) return [];

  return [
    {
      rule: `page archetype opening compliance: ${pageArchetypeName}`,
      severity: "soft",
      hint: spec.hint,
      test: (raw) => {
        const app = extractFileBlock(raw, "src/App.tsx");
        if (!app) return null;
        const rendered = Array.from(app.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g))
          .map((m) => m[1])
          .filter((name) => !["React", "Navbar", "Hero", "Footer"].includes(name));
        const unique: string[] = [];
        const seen = new Set<string>();
        for (const name of rendered) {
          if (!seen.has(name)) { seen.add(name); unique.push(name); }
        }
        if (unique.length === 0) return null;
        const content = extractFileBlock(raw, `src/components/${unique[0]}.tsx`);
        if (!content) return null;
        if (!spec.checkFor.test(content) && spec.failPattern.test(content)) {
          return `First body section (${unique[0]}) is a generic services grid. ${pageArchetypeName} archetype requires a different opening — reorder sections to match the archetype.`;
        }
        return null;
      },
    },
  ];
}

function createHeroArchetypeDetector(heroVariant: number): Detector[] {
  if (heroVariant !== 2) return []; // Only enforce Option 2 — Option 1 has no shape constraint

  return [
    {
      rule: "hero archetype compliance: Option 2 must not be a plain split hero",
      severity: "soft",
      hint: "Hero Option 2 was pre-selected. It should NOT be a plain two-column split (left text, right image). Use the style skill's Option 2 archetype — typically a centered cinematic, immersive, or stacked composition.",
      test: (raw) => {
        const h = extractFileBlock(raw, "src/components/Hero.tsx");
        if (!h) return null;
        // Detect the pure split pattern: two-column with image on right and text on left
        const hasBasicSplit = /(?:lg|md):grid-cols-2/.test(h) && /<img\b/.test(h) && !(/col-span-\d|grid-cols-12|absolute|z-\d|translate/.test(h));
        const hasImmersiveComposition = /min-h-screen|h-screen|aspect-video|full-bleed|inset-0|absolute.*inset/.test(h);
        if (hasBasicSplit && !hasImmersiveComposition) {
          return "Hero uses a plain two-column split layout (lg:grid-cols-2 with text+image). Option 2 archetype requires a different composition.";
        }
        return null;
      },
    },
  ];
}

function createStyleComplianceDetectors(styleId: string): Detector[] {
  const spec = STYLE_SPECS[styleId];
  if (!spec) return [];

  return [
    {
      rule: `style compliance: ${styleId} font family`,
      severity: "soft",
      hint: `The selected style (${styleId}) requires specific fonts. Ensure font-heading and font-body match the style specification.`,
      test: (raw) => {
        const globals = extractFileBlock(raw, "src/globals.css") ?? "";
        const allContent = globals + raw.slice(0, 8000);
        const missing = spec.fontSignatures.filter((re) => !re.test(allContent));
        if (missing.length > 0) {
          return `Style ${styleId} font signatures not found in globals.css or theme variables.`;
        }
        return null;
      },
    },
    {
      rule: `style compliance: ${styleId} color mode must be ${spec.colorMode}`,
      severity: "hard",
      hint: `The selected style (${styleId}) requires ${spec.colorMode} mode. ${spec.colorMode === "dark" ? "Background must be dark (lightness < 15%)." : "Background must be light (lightness > 90%)."}`,
      test: (raw) => {
        const globals = extractFileBlock(raw, "src/globals.css") ?? "";
        if (!globals) return null;
        const bgMatch = globals.match(/--background:\s*(\d+)\s+(\d+)%\s+(\d+)%/);
        if (!bgMatch) return null;
        const lightness = parseInt(bgMatch[3], 10);
        if (spec.colorMode === "dark" && lightness > 25) {
          return `Style ${styleId} requires dark mode but --background lightness is ${lightness}% (expected < 25%).`;
        }
        if (spec.colorMode === "light" && lightness < 75) {
          return `Style ${styleId} requires light mode but --background lightness is ${lightness}% (expected > 75%).`;
        }
        return null;
      },
    },
    {
      rule: `style compliance: ${styleId} heading font tokens`,
      severity: "soft",
      hint: `Headings must use font-heading class (mapped to the ${styleId} display font). Do not use raw font-serif or font-sans.`,
      test: (raw) => {
        const sectionFiles = extractSectionFiles(raw);
        let fontHeadingCount = 0;
        let rawFontCount = 0;
        for (const file of sectionFiles) {
          fontHeadingCount += countPattern(file.content, /font-heading/g);
          rawFontCount += countPattern(file.content, /\bfont-(?:serif|sans)\b/g);
        }
        if (fontHeadingCount === 0 && sectionFiles.length >= 3) {
          return `No section uses font-heading token. Style ${styleId} requires consistent heading font usage.`;
        }
        if (rawFontCount > fontHeadingCount) {
          return `More raw font-serif/font-sans (${rawFontCount}) than font-heading tokens (${fontHeadingCount}). Use design system tokens.`;
        }
        return null;
      },
    },
  ];
}

/**
 * Run the critic against raw generated text. Returns a CriticReport.
 *
 * @param opts - Optional pre-selection context from the binding design choices.
 *   All fields are optional and backward-compatible — existing call sites without
 *   opts continue to work unchanged.
 */
export function runCritic(
  niche: Niche,
  raw: string,
  selectedStyleId?: string,
  opts?: {
    paletteDirection?: string | null;
    heroVariant?: number | null;
    pageArchetypeName?: string | null;
    variantPlan?: WebsiteVariantPlan;
  }
): CriticReport {
  const detectors = [
    ...UNIVERSAL_DETECTORS,
    ...createStarterBaseDetectors(niche, opts?.variantPlan),
    ...(NICHE_DETECTORS[niche] ?? []),
    ...(selectedStyleId ? createStyleComplianceDetectors(selectedStyleId) : []),
    ...(selectedStyleId && opts?.paletteDirection
      ? createPaletteDirectionDetector(selectedStyleId, opts.paletteDirection)
      : []),
    ...(opts?.heroVariant ? createHeroArchetypeDetector(opts.heroVariant) : []),
    ...(opts?.pageArchetypeName ? createPageArchetypeOpeningDetector(opts.pageArchetypeName) : []),
  ];
  const issues: CriticIssue[] = [];
  for (const d of detectors) {
    const detail = d.test(raw);
    if (detail) {
      issues.push({
        rule: d.rule,
        detail,
        severity: d.severity,
        hint: d.hint,
      });
    }
  }
  return {
    niche,
    passed: issues.filter((i) => i.severity === "hard").length === 0,
    issues,
  };
}

/**
 * Build a repair prompt for a failed critic report. Targets hero, CTA,
 * footer, and the worst middle section. Preserves good sections.
 */
export function buildRepairPrompt(
  niche: Niche,
  raw: string,
  report: CriticReport,
  conformanceReport?: DesignConformanceReport,
  variantPlan?: WebsiteVariantPlan
): string {
  const sanitizedRaw = raw
    .replace(
      /===FILE:src\/assets\/generated-images\.ts===\n[\s\S]*?===END_FILE===\n?/g,
      "===FILE:src/assets/generated-images.ts===\n// omitted generated image data for repair prompt\n===END_FILE===\n"
    )
    .replace(/data:image\/[^`"')\s]+/g, "data:image/[omitted]")
    .replace(
      /"url":\s*"data:image\/[^"]+"/g,
      '"url": "data:image/[omitted]"'
    );

  const profile = getNicheProfile(niche);
  const issueLines = report.issues
    .map(
      (i, idx) =>
        `${idx + 1}. [${i.severity.toUpperCase()}] ${i.rule}\n   Detected: ${i.detail}\n   Fix: ${i.hint}`
    )
    .join("\n");
  const conformanceBlock = conformanceReport
    ? `\nPOST-GENERATION DESIGN CONFORMANCE:\n${renderDesignConformanceForRepair(conformanceReport)}\n`
    : "";
  const variantPlanBlock = variantPlan
    ? `\nBINDING VARIANT PLAN TO PRESERVE:\n- designFamily: ${variantPlan.designFamily}\n- heroVariant: ${variantPlan.heroVariant}\n- sectionChoreography: ${variantPlan.sectionChoreography}\n- bodyRoleSequence: ${variantPlan.bodyRoleSequence.join(" -> ")}\n- proofVariant: ${variantPlan.proofVariant}\n- featureVariant: ${variantPlan.featureVariant}\n- ctaVariant: ${variantPlan.ctaVariant}\n- footerVariant: ${variantPlan.footerVariant}\n- imageStrategy: ${variantPlan.imageStrategy}\n- densityMode: ${variantPlan.densityMode}\n- contrastMode: ${variantPlan.contrastMode}\nRepair may fix violations, but it may NOT flatten these choices into a generic safe scaffold.\n`
    : "";

  return `You previously generated a multi-file React + TypeScript + Vite + Tailwind project for a ${profile.label} brief. The visual composition critic found issues.

You must REGENERATE the complete project in the same delimited format (===PROJECT_MANIFEST===, ===FILE:...===, ===END_FILE===), fixing the issues listed below. Preserve: the manifest structure, the file set, the design direction, the typography, the color strategy, and the section order. Do not introduce new sections, rename components, or break imports.

PRIORITY REPAIR TARGETS (fix these first):
- Hero composition (if flagged)
- The most generic middle section (if flagged)
- CTA/conversion surface (if flagged)
- Footer closure (if flagged)

Sections NOT flagged should be preserved — do not weaken them.

ISSUES TO FIX:
${issueLines}
${conformanceBlock}
${variantPlanBlock}

NICHE CONTRACT REMINDER (${profile.label}):
- Required choreography: ${profile.choreography.join(" → ")}
- CTA style: ${profile.ctaStyle}
- Footer style: ${profile.footerStyle}
- Proof style: ${profile.proofStyle}
- Banned layouts: ${profile.bannedLayouts.join("; ")}

ORIGINAL OUTPUT TO REPAIR:
${sanitizedRaw}

Output the complete repaired project in the delimited format. Do not output any explanation, summary, or fence — only the manifest and files.`;
}

/**
 * Render a CriticReport as a multi-line string for logs and reports.
 */
export function renderCriticReport(report: CriticReport): string {
  const hardCount = report.issues.filter((i) => i.severity === "hard").length;
  const softCount = report.issues.filter((i) => i.severity === "soft").length;
  if (report.issues.length === 0) {
    return `Critic [${report.niche}]: PASS`;
  }
  const status = report.passed ? "PASS" : "FAIL";
  const lines = [
    `Critic [${report.niche}]: ${status} (${hardCount} hard, ${softCount} soft)`,
  ];
  for (const i of report.issues) {
    lines.push(`  - [${i.severity}] ${i.rule}: ${i.detail}`);
  }
  return lines.join("\n");
}
