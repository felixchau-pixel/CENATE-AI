/**
 * Website generation prompt — produces a real multi-file project artifact.
 *
 * files[] is the SINGLE source of truth. Both code mode and the runtime
 * preview render from these files. There is no separate PREVIEW_HTML.
 *
 * Design and runtime rules are loaded from the TypeUI-backed design skill at
 * `.agents/skills/design-system/SKILL.md`. Update the skill (via `typeui.sh
 * pull` or direct edit) to change how generated sites look and behave — do
 * NOT duplicate design rules inline in this file.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { buildWebsiteProjectPrompt as composeNicheAwarePrompt } from "./website/build-prompt";
import { resolveCenateDesignSpecForNiche } from "@/lib/design-md/cenate";
import {
  UI_PRIMITIVES_PROMPT,
  SECTION_PATTERNS_PROMPT,
} from "./website/scaffold-files";
import {
  resolveProjectImagePlan,
  renderProjectImagePlan,
  type ProjectImagePlan,
} from "./website/generated-images";
import type { Niche } from "./website/niche-router";
import { detectNiche } from "./website/niche-router";
import {
  planWebsiteVariant,
  renderVariantPlanPrompt,
  selectDesignFamily,
  type WebsiteVariantPlan,
} from "./website/design-families";
import {
  selectStyleSkill,
  getCoreContract,
} from "./website/skill-router";

export const websiteDetectionKeywords = [
  "website",
  "landing page",
  "homepage",
  "web page",
  "site",
  "portfolio",
  "restaurant",
  "store",
  "shop",
  "agency",
  "startup",
  "saas",
  "blog",
  "business",
  "company",
  "brand",
  "app landing",
  "product page",
  "marketing",
];

export function isWebsiteRequest(title: string): boolean {
  const lower = title.toLowerCase();
  return websiteDetectionKeywords.some((kw) => lower.includes(kw));
}

/**
 * Loads the legacy design-system skill markdown as a fallback.
 * Only used when the routed style skill system fails to select a skill.
 */
function loadLegacyDesignSkill(): string {
  try {
    const skillPath = path.join(
      process.cwd(),
      ".agents",
      "skills",
      "design-system",
      "SKILL.md"
    );
    return readFileSync(skillPath, "utf8");
  } catch {
    try {
      const fallback = path.join(
        process.cwd(),
        ".claude",
        "skills",
        "design-system",
        "SKILL.md"
      );
      return readFileSync(fallback, "utf8");
    } catch {
      return "";
    }
  }
}

const legacyDesignSkill = loadLegacyDesignSkill();
const coreContract = getCoreContract();

type ResolvedDesignSkill = {
  designSkillContent: string;
  selectedStyleId: string | null;
  designSpecBlock: string;
  designSpecId: string | null;
  variantPlan: WebsiteVariantPlan;
  variantPlanBlock: string;
  imagePlan: ProjectImagePlan;
  imagePlanBlock: string;
  paletteDirection: string | null;
  paletteLabel: string | null;
  palettePrimaryCss: string | null;
  heroVariant: 1 | 2 | null;
  pageArchetypeName: string | null;
  pageArchetypeDesc: string | null;
  pageArchetypeOpeningSection: string | null;
  choreographyEmphasis: "proof-first" | "story-first" | null;
  choreographyEmphasisDesc: string | null;
};

/**
 * Resolves the design skill content for a generation request.
 * Uses the routed style skill system (core contract + selected style).
 * Also returns pre-selected palette direction and hero archetype variant
 * so the prompt can inject them as binding constraints.
 * Falls back to the legacy single design-system SKILL.md if routing fails.
 */
function resolveDesignSkill(
  brief: string,
  niche: Niche,
  uploadedImageUrls?: string[]
): ResolvedDesignSkill {
  const selected = selectStyleSkill(brief, niche);
  const fallbackFamily = selectDesignFamily(niche, brief);
  const selectedDesignSpecId = (selected?.meta.id ?? fallbackFamily) as
    | "editorial_luxury"
    | "modern_minimal"
    | "bold_commercial"
    | "warm_artisan";
  const variantPlan = planWebsiteVariant({
    brief,
    niche,
    designFamily: selectedDesignSpecId,
    uploadedImageUrls,
  });
  const variantPlanBlock = renderVariantPlanPrompt(variantPlan);
  const imagePlan = resolveProjectImagePlan({
    brief,
    niche,
    family: selectedDesignSpecId,
    uploadedImageUrls,
  });
  const imagePlanBlock = renderProjectImagePlan(imagePlan);

  let designSpecBlock = "";
  let designSpecId: string | null = selectedDesignSpecId;

  try {
    const spec = resolveCenateDesignSpecForNiche(selectedDesignSpecId, niche);
    if (spec.report.summary.errors === 0) {
      designSpecBlock = spec.promptBlock;
    } else {
      console.warn(
        `[prompts-website] DESIGN.md spec ${selectedDesignSpecId} has lint errors; continuing without design-spec prompt block`
      );
      designSpecId = null;
    }
  } catch (error) {
    console.warn(
      `[prompts-website] Failed to resolve DESIGN.md spec ${selectedDesignSpecId}: ${String(error)}`
    );
    designSpecId = null;
  }

  if (selected) {
    const parts: string[] = [];
    if (coreContract) parts.push(coreContract);
    parts.push(selected.content);
    return {
      designSkillContent: parts.join("\n\n---\n\n"),
      selectedStyleId: selected.meta.id,
      designSpecBlock,
      designSpecId,
      variantPlan,
      variantPlanBlock,
      imagePlan,
      imagePlanBlock,
      paletteDirection: selected.paletteDirection,
      paletteLabel: selected.paletteLabel,
      palettePrimaryCss: selected.palettePrimaryCss,
      heroVariant: selected.heroVariant,
      pageArchetypeName: selected.pageArchetypeName,
      pageArchetypeDesc: selected.pageArchetypeDesc,
      pageArchetypeOpeningSection: selected.pageArchetypeOpeningSection,
      choreographyEmphasis: selected.choreographyEmphasis,
      choreographyEmphasisDesc: selected.choreographyEmphasisDesc,
    };
  }

  console.warn("[prompts-website] Style skill routing failed, using legacy design skill");
  return {
    designSkillContent: legacyDesignSkill,
    selectedStyleId: null,
    designSpecBlock,
    designSpecId,
    variantPlan,
    variantPlanBlock,
    imagePlan,
    imagePlanBlock,
    paletteDirection: null,
    paletteLabel: null,
    palettePrimaryCss: null,
    heroVariant: null,
    pageArchetypeName: null,
    pageArchetypeDesc: null,
    pageArchetypeOpeningSection: null,
    choreographyEmphasis: null,
    choreographyEmphasisDesc: null,
  };
}

const outputFormat = `=== OUTPUT FORMAT ===

You must output in this EXACT delimited format. No other text, no markdown fences, no explanations outside the format.

IMPORTANT: The Lovable-style scaffold is PRE-INJECTED automatically. That includes root config files, public assets, src/main.tsx, src/index.css, src/App.css, src/vite-env.d.ts, src/lib/utils.ts, src/hooks/use-mobile.ts, src/pages/Home.tsx, src/test/*, and all src/components/ui/*.tsx primitives. Do NOT generate them.
The generated image module is also injected automatically at src/assets/generated-images.ts. Use projectImages.* from that module for all site imagery.

You generate ONLY: the manifest, App.tsx, and section component files.

===PROJECT_MANIFEST===
{
  "type": "project",
  "framework": "vite-react-ts",
  "title": "<project title>",
  "entryFile": "src/main.tsx",
  "previewEntryFile": "src/App.tsx",
  "siteType": "<restaurant|saas|portfolio|agency|ecommerce|blog|corporate|other>",
  "designFamily": "<editorial_luxury|modern_minimal|bold_commercial|warm_artisan>",
  "designDirection": "<one-sentence design direction restated from the plan>",
  "colorStrategy": "<palette + light/dark + accent role>",
  "typography": "<display font + body font>",
  "sectionOrder": ["<section-1>", "<section-2>", "..."],
  "assets": [
    { "path": "generated/hero.png", "kind": "image", "source": "generated", "url": "<local generated data URL injected by the pipeline>", "prompt": "<what this image shows>" }
  ]
}
===END_MANIFEST===
===FILE:src/App.tsx===
<imports and composes all section components in sectionOrder>
===END_FILE===
===FILE:src/components/Navbar.tsx===
<Navbar component — imports from @/components/ui/ primitives>
===END_FILE===
===FILE:src/components/Hero.tsx===
<Hero component — imports from @/components/ui/ primitives>
===END_FILE===
<... more section component files as needed ...>
===FILE:src/components/Footer.tsx===
<Footer component — imports from @/components/ui/ primitives>
===END_FILE===

DO NOT output config files, public assets, src/index.css, src/App.css, main.tsx, hook/lib/test scaffold files, src/assets/generated-images.ts, or UI primitive files — they are pre-injected.
DO NOT output a PREVIEW_HTML section. The preview is built directly from files[].`;

const planningStep = `=== MANDATORY DESIGN-PLANNING STEP ===

Before emitting any files, silently execute this EXACT planning sequence. The answers must be reflected in the PROJECT_MANIFEST fields AND must visibly shape the generated code. Do NOT output the checklist - only its results via manifest and code.

PHASE 1 - DESIGN SYSTEM LOCK-IN:
  1. Site type - which category does the brief fall into? Lock it.
  2. DESIGN.md contract - read the DESIGN.MD CONTROL SPEC first. Lock in its required role order, hero/CTA/footer/proof/services/gallery blueprint contracts, and token rules. These are binding on the first pass.
  3. Design family - read the DESIGN FAMILY (BINDING) block above as supporting visual grammar only where it does NOT conflict with the DESIGN.md contract.
  4. Design direction - one concrete sentence (e.g., "dark editorial luxury with serif display and high-contrast photography"). This goes into the manifest.
  5. Color strategy - define 3-4 specific semantic token roles: background, surface, text, muted, accent. These must appear as real semantic Tailwind classes in code, not as raw hex/rgb/hsl literals.
  6. Typography pairing - display font + body font + weight scale. These must be visible through font-heading and font-body usage in generated Heading/text elements.
  7. Spacing plan - assign different py-N values to each section: hero (py-24 to py-32), content (py-16 to py-24), accent (py-12 to py-16), CTA (py-20 to py-28). At least 3 distinct values.
  8. Surface plan - assign different background treatments across sections. At least 2 visible surface shifts (e.g., bg-background - bg-card - bg-muted - bg-zinc-950).

PHASE 2 - STRUCTURE DEFINITION:
  9. Section order - exact list in render order, matching the DESIGN.md required role order first, then the layout slot assignment above.
  10. Layout assignment - read the LAYOUT SLOT ASSIGNMENT block. Each body section has a pre-assigned layout type. Confirm your planned sections match without violating the DESIGN.md role order.
  11. Component breakdown - list of src/components/*.tsx files you will emit. The scaffold, configs, public assets, image module, main.tsx, and UI primitives are pre-injected - do NOT list them.
  12. Image plan - map projectImages.hero / support / gallery1 / gallery2 / gallery3 / detail1 to the sections that need media.

PHASE 3 - COMPONENT PLANNING:
  13. UI primitive plan - for each section, list which primitives it imports:
      MANDATORY for ALL sections: Section, Container, Heading
      Required where applicable: Button (CTAs), Card (cards), Input/Textarea (forms), Badge (labels), Accordion (FAQ), Tabs (toggles), Gallery (images), StatsBand (metrics), Testimonial (quotes), MobileNav (navbar mobile)
      The critic REJECTS sections that rebuild primitives inline.
  14. Hero/CTA contract check - verify Hero and CTA satisfy the DESIGN.md required blueprint items before writing code. Treat that as a pre-emit gate, not a suggestion.
  15. Composition map - which section is the hero focal point, which carries the media story, which provides typographic contrast, which is the rhythm break.
  16. Site-type mode - apply the SITE-TYPE COMPOSITION MODES contract. Restaurant/SaaS/Portfolio each have mandatory structural differences.

PHASE 4 - VERIFICATION (before emitting):
  17. Verify: no two consecutive sections share the same layout type.
  18. Verify: no layout type repeats more than once across all body sections.
  19. Verify: at least one section breaks the dominant page rhythm (asymmetry, surface shift, alignment change).
  20. Verify: every import in every file resolves to either "react", a pre-injected UI primitive (@/components/ui/, @/lib/utils, @/assets/generated-images), or another file you emit.
  21. Verify: manifest.sectionOrder matches the exact render order in App.tsx, Hero is second, Footer is last, and the order still preserves the DESIGN.md required role sequence.
  22. Verify: no raw hex/rgb/hsl color literals appear in section component code.

Only after completing ALL phases above, begin emitting the manifest and files.`;

function buildRulesForEachSection(routedStyleActive: boolean): string {
  const appTsxBodySectionRule = routedStyleActive
    ? "- MUST render a real page shell: Navbar, Hero, exactly 3 body sections, Footer - do NOT add a 4th or 5th"
    : "- MUST render a real page shell: Navbar, Hero, 3-5 body sections, Footer";

  return `=== RULES FOR EACH SECTION ===

PROJECT_MANIFEST:
- Must be valid JSON
- assets[] lists every image used and every asset must use source "generated" with a local generated path
- sectionOrder MUST exactly mirror the order of components imported and rendered by src/App.tsx
- sectionOrder MUST preserve the DESIGN.MD CONTROL SPEC required role order. Hero is second. Footer is last.
- siteType MUST drive real composition differences in Hero, Footer, and at least two middle sections
- designFamily MUST match the selected family exactly
- typography MUST be expressed in the emitted code using the pre-injected scaffold and real class usage. Do not rely on generating extra global stylesheet files.
- colorStrategy MUST be visibly present in semantic Tailwind classes. Describe only colors that show up in the code.
- raw hex/rgb/hsl color literals in section code are banned.

PRE-INJECTED FILES (do NOT generate these - they exist automatically):
- package.json, bun.lock, index.html, vite.config.ts, tailwind.config.ts, postcss.config.js, eslint.config.js, tsconfig.json, tsconfig.app.json, tsconfig.node.json, components.json, README.md, .gitignore, vitest.config.ts
- public/robots.txt, public/placeholder.svg, public/favicon.ico
- src/main.tsx, src/index.css, src/App.css, src/vite-env.d.ts
- src/assets/.gitkeep, src/assets/generated-images.ts, src/hooks/use-mobile.ts, src/pages/Home.tsx, src/test/setup.ts, src/test/App.test.tsx
- src/lib/utils.ts
- src/components/ui/button.tsx, input.tsx, textarea.tsx, badge.tsx, card.tsx, section.tsx, container.tsx, heading.tsx, separator.tsx, accordion.tsx, tabs.tsx, dialog.tsx, sheet.tsx, aspect-ratio.tsx, testimonial.tsx, stats-band.tsx, gallery.tsx, mobile-nav.tsx

src/App.tsx (YOU generate this):
- Import ALL section component files
- Compose them in the exact order from manifest.sectionOrder
- ${appTsxBodySectionRule}
- MUST return a <main role="main" className="min-h-screen bg-background text-foreground"> wrapper, not a bare fragment or null shell
- MUST keep Hero second and Footer last even when body sections are merged
- Default export

src/components/*.tsx (YOU generate these - section components):
- Each component is a default export function
- MANDATORY: import and use UI primitives from @/components/ui/. Every section MUST use at minimum:
    - Section (wrapper) from "@/components/ui/section"
    - Container (max-width wrapper) from "@/components/ui/container"
    - Heading (typography) from "@/components/ui/heading"
  And where applicable: Button, Input, Textarea, Card, Badge, Separator, Accordion, Tabs, Dialog, Sheet, MobileNav, AspectRatio, Testimonial, StatsBand, Gallery from @/components/ui/
- Navbars MUST import MobileNav from "@/components/ui/mobile-nav" for responsive mobile menus
- Media sections MUST import projectImages from "@/assets/generated-images" and use those local assets instead of remote image URLs
- Navbars with a primary action MUST use Button from "@/components/ui/button" for the CTA, not a raw styled anchor/button
- FAQ sections MUST use Accordion from "@/components/ui/accordion" - no custom toggle/disclosure
- Quote/testimonial content SHOULD use Testimonial from "@/components/ui/testimonial"
- Stats/metrics bands SHOULD use StatsBand from "@/components/ui/stats-band"
- Image galleries SHOULD use Gallery from "@/components/ui/gallery"
- Use cn() from @/lib/utils for conditional classes
- Use Tailwind utility classes via className for all styling and colors
- Reference images only from projectImages.* in "@/assets/generated-images"
- Icons are inline <svg> - never from an icon library
- Build sections by composing: Section > Container > content with Heading, Button, Card, etc.
- Primary CTAs and conversion actions SHOULD use Button from "@/components/ui/button" instead of raw styled <a> or <button>
- Hero sections MUST include a secondary support structure beyond headline/body/button, such as a trust row, stats rail, supporting meta panel, or structured media treatment
- CTA/Conversion/Reservation/Contact sections MUST include a real form OR real contact information plus a framed surface; centered headline + two buttons only is banned
- Footer sections MUST include brand identity, real contact details, and at least one non-link element; four-column sitemap fallback is banned
- Media blocks MUST reserve space intentionally with aspect ratio, explicit height, or grid framing - no collapsed image regions
- Do NOT define your own Button, Card, Section, Container, or Heading components inside section files
- Do NOT rebuild primitives inline - the critic will reject sections that do not import from @/components/ui/
- Avoid repeated "centered heading + paragraph + card grid" sections`;
}

const qualityBar = `=== PREMIUM COMPOSITION BAR ===

The output must feel closer to a confident design tool mock than a starter template. These are the quality signals that separate "generated" from "designed."

LAYOUT QUALITY:
- Do NOT reuse the same section layout more than once on the page.
- Use at most one plain uniform card grid section in the entire site.
- Each section must use a DIFFERENT dominant layout type from the layout slot assignment.
- At least one section must deliberately break the page rhythm with asymmetry, surface shift, or alignment change.

CONTENT QUALITY:
- Headlines must be specific and compelling, not generic ("Welcome to Our Website" is banned).
- Each section headline should tell a story: what value it provides, what problem it solves, or what experience it offers.
- Body text must have real substance — not lorem ipsum, not "We offer the best services."
- For restaurant: use evocative food/dining language. For SaaS: use product-specific language. For portfolio: use authored personal voice.

VISUAL QUALITY:
- For restaurant and portfolio briefs, the page must be visibly image-led across multiple sections.
- For SaaS briefs, vary density, alignment, and section structure across features, pricing, and testimonials.
- Navigation and footer must read like real product/brand surfaces, not placeholders.
- Use the design family's motif system consistently (ruled dividers, eyebrow labels, frame panels, etc.)
- Vary Button variants across the page: primary for main CTAs, outline for secondary, ghost for tertiary, link for navigation.

SPACING QUALITY:
- Sections must have DIFFERENT py-N values based on purpose. hero ≥ py-24, content py-16–py-24, accent py-12–py-16, CTA py-20–py-28.
- Body text must use max-w-2xl or max-w-3xl for line-length control.
- Card grids must have gap-6 or larger, never cramped.
- Use generous whitespace in heroes and CTAs. Use tighter spacing in navigation and stats bands.

TYPOGRAPHY QUALITY:
- Hero headline: text-4xl to text-6xl, font-heading, font-bold or font-semibold.
- Section headings: text-2xl to text-4xl, clearly smaller than hero.
- Body: text-base to text-lg, comfortable reading line-height.
- Captions/labels: text-xs to text-sm, often uppercase tracking-wide in primary color.
- The eyebrow class is available: use it for section labels above headings.
- Use font-heading for all display/heading text. Use font-body for all body text. Never use font-serif/font-sans directly.

DESIGN SYSTEM BINDING:
- All colors must use semantic tokens: bg-background, bg-card, bg-muted, text-foreground, text-muted-foreground, text-primary, border-border.
- No raw hex colors (#fff, #000, #334155) in className or style props.
- All spacing must use Tailwind scale: py-12 through py-32 for sections, gap-4/6/8 for internal.
- The design family's CSS theme defines all tokens — use them, do not override with arbitrary values.

IMAGE SYSTEM:
- All images must come from projectImages.* (imported from "@/assets/generated-images").
- Every <img> must have object-cover and be wrapped in a sized container (aspect ratio, height, or grid framing).
- No Unsplash URLs, no external image URLs, no placeholder.svg in section components.
- Decorative browser-window panels, fake dashboards, empty framed rectangles, pulse-dot cards, and abstract illustration slabs do NOT count as successful image content.
- For non-SaaS briefs, do NOT use browser-window or dashboard mock panels as hero art.
- For SaaS briefs, one product-surface hero is acceptable, but at least one supporting section must still use real generated imagery or a materially different non-placeholder composition.
- Hero uses projectImages.hero. Gallery uses projectImages.gallery1/gallery2/gallery3. Story uses projectImages.support.

SECTION IDENTITY:
- Every section must differ from its neighbors in at least 3 of: alignment, density, visual weight, surface, composition.
- No card shell (same bg + border + radius + padding) may repeat in more than 2 sections.
- At least 2 body sections must use left-aligned or asymmetric openings (not all centered).`;

const siteTypeModes = `=== SITE-TYPE COMPOSITION MODES (HARD CONTRACTS) ===

These override generic premium instincts. The site-type mode chosen in the manifest MUST visibly shape the emitted code. If the output could be dropped into any of the three site types unchanged, the mode is not binding and the page is wrong.

RESTAURANT MODE (preserve round-3 gains):
Required choreography: cinematic hero → chef/atmosphere story → editorial menu treatment → asymmetric gallery → critic/press proof → booking surface → location → venue footer.
Hard requirements:
- Hero: split composition with offset secondary column (stats, awards, credentials) OR layered editorial framing. No centered food wallpaper.
- Menu: editorial list (name + description + price on ruled lines) or narrative tasting menu. At least one signature highlight with media. NEVER a 3-card grid.
- Gallery: asymmetric multi-column (e.g. 8/4 split with one large + stacked secondaries). NEVER equal 3-column.
- Proof: named critic pull-quotes with publication attribution. NEVER avatar testimonial cards.
- Reservation: booking-surface framing (time slots, private dining note, dress ritual, or real form). NEVER a centered CTA stripe.
- Footer: venue identity — address, hours, reservation line, private events, dress note. NEVER a utility sitemap.

SAAS MODE (must improve over round 3):
Required choreography: product-framed hero → product/workflow demonstration → non-uniform capability section → distinct proof section → distinct pricing/adoption section → structural conversion section → product-grade footer.
Hard requirements:
- Hero: the actual product surface must be visible as primary content (inset product window with visible controls, edge-bleeding product screen, or an equal-weight split). NEVER a blurred photo inside a gradient card with a pulse dot.
- A non-card information section MUST exist between hero and pricing (typographic manifesto, product teardown with callouts, metrics rail, full-bleed product band, or quote-led block).
- Features, testimonials, and pricing MUST each use visually distinct composition language — different density, alignment, backgrounds, and card shape. They cannot all be the same rounded-card shell.
- Pricing: NEVER three uniform equal cards in md:grid-cols-3 / lg:grid-cols-3. Use a comparison table, a 2+1 asymmetric highlight, a single-plan hero with tier toggle, or a stacked tier ladder.
- Testimonials: NEVER the same card language as features. Use a large editorial pull-quote band, a horizontal logo/quote rail, or a stacked long-form quote with portrait.
- Conversion/CTA: NEVER centered eyebrow + headline + two buttons on a gradient mesh. Use a split panel, an inset bordered band with left-aligned copy, or a product-anchored CTA with structural framing.
- Footer: NEVER a four-column link-only sitemap. Include brand statement / closing line, trust or status signal, and one non-link element (newsletter, status badge, changelog link with surface).
- Premium feel MUST come from structure and typographic hierarchy, NOT from gradient meshes, blurred blobs, glow rings, pulse dots, or float animations.

PORTFOLIO MODE (must improve over round 3):
Required choreography: authored hero → primary showcase → structurally distinct secondary showcase/story → perspective/about/method → selective proof → authored contact/invitation → designed signature footer.
Hard requirements:
- Hero: must establish authorship and point of view, not just polish. Options: large authored statement with credential rail, full-bleed portrait with displaced wordmark, typographic manifesto with media anchor, or a mixed collage with overlapping planes. NEVER a moody photo + bg-black/60 overlay + left-center floating copy as the only treatment.
- Selected Work: NEVER a repeated alternating 7/4 or 12-col flip rail for every project. Use a stacked editorial case-study, an asymmetric project index, an offset overlap grid, a horizontal scroll rail, or a single hero project + secondary strip.
- Media must persist across at least THREE sections beyond the hero. Portfolio briefs without sustained imagery are broken.
- About/perspective: NEVER "50+ projects / 12 awards" stat chips with 2-col text + expertise list. Use a first-person long-form statement, a typographic manifesto, an interview Q&A, or a timeline of practice.
- Process (if present): NEVER four numbered cards 01/02/03/04. Use narrative with inline numbered markers, a vertical timeline with asymmetric media anchors, or a single-column method statement. Prefer omitting process entirely in favor of a deeper case study.
- Contact: NEVER centered eyebrow + "Let's create" headline + two rounded-full buttons. Use a typographic invitation spanning the viewport, a letter-format contact statement, or a left-aligned contact block with real email, studio address, and availability.
- Footer: a designed signature with a final typographic statement, real locations, studio contact, and social anchors composed into the page — not a utility strip.
`;

function buildHardPriorityDirectives(routedStyleActive: boolean): string {
  const pageCompositionRule = routedStyleActive
    ? `1. HARD PAGE COMPOSITION RULES.
   - src/App.tsx MUST render exactly this structure: Navbar → Hero → 3 body sections → Footer.
   - Total body sections MUST be exactly 3. The active style skill requires exactly 3. Do NOT generate 4 or 5 sections.
   - If the niche profile's choreography lists more sections, merge their content into 3 body section files — do NOT create separate files for each choreography step.
   - App must return a real <main role="main"> page shell. Never return null, an empty fragment, or a thin wrapper.`
    : `1. HARD PAGE COMPOSITION RULES.
   - src/App.tsx MUST render exactly this structure: Navbar → Hero → 3 to 5 body sections → Footer.
   - Total body sections must be between 3 and 5. Never exceed 5. If more sections are possible, merge them into fewer sections.
   - App must return a real <main role="main"> page shell. Never return null, an empty fragment, or a thin wrapper.`;

  return `=== PRIORITY DIRECTIVES (READ FIRST, APPLY EVERYWHERE) ===

These directives sit above every other rule in this prompt. They are binding. They are not advisory.

${pageCompositionRule}

2. HARD HERO RULES.
   - Every Hero MUST include all of the following:
     (a) headline
     (b) supporting paragraph
     (c) primary CTA using Button
     (d) exactly one support block chosen from: stats row (3-4 items), trust badges/logos, feature bullets, or a secondary image/media panel
   - A hero without a support block is invalid.

3. HARD CTA RULES.
   - All primary actions MUST use the Button component.
   - Do NOT use styled <a> or styled <button> elements for primary CTAs.
   - This applies to Navbar CTA, Hero CTA, Contact CTA, Conversion CTA, Reservation CTA, and equivalent action surfaces.

4. HARD LAYOUT DIVERSITY RULES.
   - Do not repeat the same layout type across sections.
   - Each section must use a meaningfully different layout type chosen from: grid, split, centered stack, timeline, stats row, gallery, quote band, table/comparison.
   - If two sections share the same dominant layout signature, rebuild one of them with a different structure.

5. SITE-TYPE MODE IS A HARD CONTRACT.
   - Before emitting any files, identify the site type from the brief and set it in the manifest.
   - The site-type composition mode below (RESTAURANT / SAAS / PORTFOLIO) overrides every generic instinct.
   - If a section you are about to emit would look the same across all three site types, it is wrong — rebuild it with the active mode's required structure.

6. THE MANIFEST MUST MATCH THE CODE.
   - manifest.sectionOrder MUST list exactly the components you import in src/App.tsx, in the same order.
   - manifest.sectionOrder MUST preserve the DESIGN.MD CONTROL SPEC role order. Hero is second. Footer is last.
   - manifest.siteType MUST drive real composition differences in Hero, Footer, and at least two middle sections.
   - manifest.typography MUST be reflected by the actual rendered code. Do not declare fonts in metadata without using them in component markup or class names.
   - manifest.colorStrategy MUST be visibly present in semantic token class names - not only described.
   - Declaring a design decision only in metadata and not in code is a generation failure.

6b. DESIGN TOKEN ENFORCEMENT.
   - Use semantic tokens: bg-background, bg-card, bg-muted, text-foreground, text-muted-foreground, text-primary, border-border.
   - Use font-heading for display text and font-body for body copy.
   - Raw hex, rgb(), hsl(), and arbitrary inline color styles inside section components are banned.
   - Do NOT replace Button/Input/Textarea primitives with raw styled elements where the DESIGN.md spec expects component surfaces.

7. OBSERVED DRIFT PATTERNS THAT ARE BANNED.
   These are the exact drift patterns observed in prior rounds. Do NOT emit any of them under any circumstance:

   SaaS bans:
   - Pricing as three uniform md:grid-cols-3 / lg:grid-cols-3 equal cards
   - Any conversion/CTA section that is "text-center with eyebrow pill + headline + two buttons"
   - Four-column link-only footer (product / company / resources / legal) with no brand closure
   - Hero right column that is a photo inside a blurred gradient card with a pulse dot
   - Gradient mesh + floating blurred blobs as the primary hero visual treatment
   - Repeating bg-surface/30 backdrop-blur-xl border border-white/10 rounded-2xl shells across features, testimonials, and pricing
   - Repeating "inline-flex items-center px-4 py-2 rounded-full bg-{color}/10 border border-{color}/20" eyebrow pills on every section

   Portfolio bans:
   - Selected Work as an alternating 7/4 or 12-col flip rail repeated for every project
   - Process section with four numbered steps 01/02/03/04 (Discovery/Strategy/Design/Refinement or synonyms)
   - About with "50+ projects / 12 awards" stat chips
   - Contact/CTA section that is centered eyebrow + serif headline + gold button + outline button
   - Hero as moody photo + bg-black/60 overlay + left-center floating copy with nothing else
   - Footer that is just the name + generic social icon row

8. COMPOSITION DIVERSITY REQUIREMENT.
   - No card shell (same background + border + radius + padding) may be reused across three or more sections.
   - No two consecutive sections may both open with centered eyebrow + centered heading.
   - At least one section on every page MUST deliberately break the dominant rhythm with asymmetry, overlap, or a completely different alignment model.
   - At most ONE uniform card grid per page, unless the site type explicitly requires a second.

9. PRE-EMIT SELF-CHECK.
   Before finalizing each component file, silently verify:
   (a) It does not match any banned shape above.
   (b) It does not reuse the previous section's composition language.
   (c) For SaaS pricing: it is NOT three equal cards.
   (d) For SaaS CTA: it is NOT centered eyebrow + headline + two buttons.
   (e) For SaaS footer: it is NOT a four-column link sitemap.
   (f) For Portfolio Selected Work: it is NOT an alternating rail.
   (g) For Portfolio Process: it is NOT four numbered agency-boilerplate steps.
   (h) For Portfolio Contact: it is NOT a centered eyebrow + headline + two buttons.
   (i) For Portfolio About: it does NOT use "50+ / 12" stat chips.
   (j) For Restaurant Menu: it is NOT a 3-card grid.
   (k) For Restaurant Gallery: it is NOT a uniform 3-column image grid.

   If any check fails, rebuild that section with a different composition before emitting.

10. PREMIUM FEEL COMES FROM STRUCTURE, NOT EFFECTS.
   Gradients, blurs, glow, pulse dots, and float animations are accents only. They must never be the primary source of visual identity. Hierarchy, typography, density shifts, asymmetric composition, and real media are the primary sources of premium feel.
`;}

const choreographyBar = `=== SECTION CHOREOGRAPHY RULES ===

- Do not let every section open with centered eyebrow + heading + paragraph.
- Only one uniform card-grid section is allowed unless the site type clearly demands another.
- Alternate among: media-heavy section, typography-led section, structured content section, proof section.
- Change spacing and density by section purpose.
- Include at least one deliberate rhythm break: asymmetry, overlap, inset panel, offset captioning, or a different alignment model.
- Navigation and footer should feel like part of the composition sequence, not utility wrappers.
`;

// NOTE: The old `websiteProjectPrompt` constant has been removed. All website
// generation now goes through `buildWebsiteProjectPrompt()` which composes the
// full layered control stack. No code imports the old constant.

/**
 * Niche-aware builder. Composes the layered control stack (priority
 * directives → niche profile → asset plan → short-prompt defaults →
 * site-type modes → design skill → planning + output rules) and returns
 * both the final prompt and the detected niche so callers can wire the
 * critic loop.
 *
 * Style skill routing: detects niche early, selects exactly one Markdown
 * style skill via skill-router, and injects it as the design skill layer.
 * Falls back to the legacy design-system SKILL.md if routing fails.
 */
export function buildWebsiteProjectPrompt(
  brief: string,
  options?: { uploadedImageUrls?: string[] }
): {
  prompt: string;
  niche: Niche;
  designFamily: string;
  selectedStyleId: string | null;
  variantPlan: WebsiteVariantPlan;
  imagePlan: ProjectImagePlan;
  paletteDirection: string | null;
  heroVariant: number | null;
  pageArchetypeName: string | null;
} {
  // Pre-detect niche so we can route the style skill before prompt assembly.
  // build-prompt.ts will also call detectNiche — this is intentionally
  // redundant (cheap regex call) to avoid restructuring the full pipeline.
  const preNiche = detectNiche(brief);
  const {
    designSkillContent,
    selectedStyleId,
    designSpecBlock,
    designSpecId,
    variantPlan,
    variantPlanBlock,
    imagePlan,
    imagePlanBlock,
    paletteDirection,
    paletteLabel,
    palettePrimaryCss,
    heroVariant,
    pageArchetypeName,
    pageArchetypeDesc,
    pageArchetypeOpeningSection,
    choreographyEmphasis,
    choreographyEmphasisDesc,
  } = resolveDesignSkill(brief, preNiche, options?.uploadedImageUrls);
  const routedStyle = selectedStyleId !== null;

  if (selectedStyleId) {
    console.log(`[prompts-website] Routed style skill: ${selectedStyleId} for niche: ${preNiche}`);
  }

  const composed = composeNicheAwarePrompt(brief, {
    hardPriorityDirectives: buildHardPriorityDirectives(routedStyle),
    siteTypeModes,
    designSkill: designSkillContent,
    planningStep,
    outputFormat,
    rulesForEachSection: buildRulesForEachSection(routedStyle),
    qualityBar,
    choreographyBar,
    uiPrimitivesReference: UI_PRIMITIVES_PROMPT,
    sectionPatterns: SECTION_PATTERNS_PROMPT,
    designSpecBlock,
    designSpecId,
    variantPlan,
    variantPlanBlock,
    imagePlanBlock,
    routedStyleActive: routedStyle,
    selectedStyleId,
    paletteDirection,
    paletteLabel,
    palettePrimaryCss,
    heroVariant,
    pageArchetypeName,
    pageArchetypeDesc,
    pageArchetypeOpeningSection,
    choreographyEmphasis,
    choreographyEmphasisDesc,
  });
  return {
    ...composed,
    variantPlan,
    imagePlan,
    paletteDirection: paletteDirection ?? null,
    heroVariant: heroVariant ?? null,
    pageArchetypeName: pageArchetypeName ?? null,
  };
}

export const websiteUpdatePrompt = (currentContent: string) =>
  `You are updating an existing multi-file website project. The current project is in delimited format below.

Apply the requested changes and output the COMPLETE updated project in the same delimited format (===PROJECT_MANIFEST===, ===FILE:...===).

DO NOT output a PREVIEW_HTML section — the preview is built directly from files[] at runtime.

You must output ALL files, not just the changed ones. All rules from the Cenate Design System Skill still apply: no external libraries, every import must resolve to a file you output, inline SVGs only, images must use local generated assets from "@/assets/generated-images", Tailwind utilities only, no @apply.

=== CENATE DESIGN SYSTEM SKILL (AUTHORITATIVE) ===

${legacyDesignSkill}

=== END DESIGN SYSTEM SKILL ===

Current project:
${currentContent}`;
