import { parseProjectContent, type ProjectMeta } from "@/lib/project-manifest";
import {
  checkCenateDesignConformance,
  type DesignConformanceReport,
} from "@/lib/design-md/cenate";
import {
  getDesignFamily,
  type WebsiteVariantPlan,
  type DesignFamilyId,
  selectDesignFamily,
} from "./design-families";
import {
  buildGeneratedImagesModule,
  generateProjectImages,
  type ProjectImagePlan,
} from "./generated-images";
import type { Niche } from "./niche-router";
import { injectScaffoldFiles } from "./scaffold-files";
import { getSpacingProfile } from "./design-intelligence/spacing-rules";
import {
  getSectionFamilyRule,
  getVariantComponentTree,
  type VariantComponentEntry,
} from "./starter-bases";

function removeFileBlock(raw: string, filePath: string): string {
  const startMarker = `===FILE:${filePath}===`;
  const endMarker = "===END_FILE===";
  const startIdx = raw.indexOf(startMarker);
  if (startIdx === -1) return raw;
  const endIdx = raw.indexOf(endMarker, startIdx);
  if (endIdx === -1) return raw;
  const removeEnd = endIdx + endMarker.length;
  const afterEnd = raw[removeEnd] === "\n" ? removeEnd + 1 : removeEnd;
  return raw.slice(0, startIdx) + raw.slice(afterEnd);
}

function upsertFileBlock(raw: string, filePath: string, content: string): string {
  const without = removeFileBlock(raw, filePath);
  const block = `===FILE:${filePath}===\n${content}\n===END_FILE===`;
  const manifestEndMarker = "===END_MANIFEST===";
  const manifestEnd = without.indexOf(manifestEndMarker);

  if (manifestEnd !== -1) {
    const insertPoint = manifestEnd + manifestEndMarker.length;
    return (
      without.slice(0, insertPoint) + "\n" + block + without.slice(insertPoint)
    );
  }

  return `${block}\n${without}`;
}

function replaceManifest(raw: string, meta: Record<string, unknown>): string {
  return raw.replace(
    /===PROJECT_MANIFEST===\n[\s\S]*?===END_MANIFEST===/,
    `===PROJECT_MANIFEST===\n${JSON.stringify(meta, null, 2)}\n===END_MANIFEST===`
  );
}

function extractAppRenderOrder(content: string): string[] {
  const bodyMatch = content.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/);
  const source = bodyMatch?.[1] ?? content;

  return Array.from(source.matchAll(/<([A-Z][A-Za-z0-9]*)\b[^>]*\/?>/g)).map(
    (match) => match[1]
  );
}

function collectSectionFiles(raw: string): string[] {
  return parseProjectContent(raw).files
    .filter(
      (file) =>
        file.path.startsWith("src/components/") &&
        !file.path.startsWith("src/components/ui/") &&
        file.path.endsWith(".tsx")
    )
    .map((file) => file.path);
}

function buildVariantAppFile(entries: VariantComponentEntry[]): string {
  const importLines = entries.map(
    (entry) =>
      `import ${entry.componentName} from './components/${entry.componentName}'`
  );
  const renderLines = entries.map((entry) => `      <${entry.componentName} />`);

  return `import React from 'react'
${importLines.join("\n")}

function App() {
  return (
    <main role="main" className="min-h-screen bg-background text-foreground">
${renderLines.join("\n")}
    </main>
  )
}

export default App`;
}

function componentNameFromPath(filePath: string): string {
  return filePath.replace(/^src\/components\//, "").replace(/\.tsx$/, "");
}

function titleCaseWords(value: string): string {
  return value
    .replace(/[^\w\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function decodeText(value: string): string {
  return value
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function defaultHeroCopy(
  brief: string,
  niche: Niche
): { eyebrow: string; heading: string; body: string; cta: string } {
  const title = titleCaseWords(brief);
  switch (niche) {
    case "saas":
      return {
        eyebrow: "Workflow platform",
        heading: title || "Automate the work between every team handoff.",
        body: "Make approvals, routing, and reporting feel like one connected operating surface instead of a stack of manual checkpoints.",
        cta: "Start free",
      };
    case "construction":
      return {
        eyebrow: "Commercial delivery",
        heading: title || "Build with schedule control and real field confidence.",
        body: "From preconstruction through closeout, every milestone stays visible, accountable, and ready for the next trade.",
        cta: "Request an estimate",
      };
    case "restaurant":
      return {
        eyebrow: "Seasonal service",
        heading: title || "A composed dining experience shaped by rhythm and craft.",
        body: "The room, the pacing, and the course sequence are designed to feel deliberate from the first pour to the final plate.",
        cta: "Reserve a table",
      };
    default:
      return {
        eyebrow: "Refined hospitality",
        heading: title || "A more considered first impression starts above the fold.",
        body: "The hero now binds the selected visual family directly into the rendered layout instead of drifting toward the same generic shell.",
        cta: "Plan your stay",
      };
  }
}

function extractHeroCopy(
  content: string,
  brief: string,
  niche: Niche
): { eyebrow: string; heading: string; body: string; cta: string } {
  const fallback = defaultHeroCopy(brief, niche);
  const headingMatch =
    content.match(/<Heading[^>]*>([\s\S]*?)<\/Heading>/) ??
    content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const paragraphMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const buttonMatch = content.match(/<Button[^>]*>([\s\S]*?)<\/Button>/);
  const eyebrowMatch =
    content.match(/eyebrow="([^"]+)"/) ??
    content.match(/tracking-\[0\.2em\][^>]*>([\s\S]*?)<\/[^>]+>/);

  return {
    eyebrow: decodeText(eyebrowMatch?.[1] ?? "") || fallback.eyebrow,
    heading: decodeText(headingMatch?.[1] ?? "") || fallback.heading,
    body: decodeText(paragraphMatch?.[1] ?? "") || fallback.body,
    cta: decodeText(buttonMatch?.[1] ?? "") || fallback.cta,
  };
}

function heroSupportStats(
  niche: Niche,
  plan: WebsiteVariantPlan
): Array<{ value: string; label: string }> {
  if (niche === "saas") {
    return [
      { value: "12K+", label: "Active teams" },
      { value: "99.9%", label: "Uptime" },
      { value: "3 min", label: "Fastest setup" },
    ];
  }
  if (niche === "construction") {
    return [
      { value: "500+", label: "Projects delivered" },
      { value: "25+", label: "Years on site" },
      { value: "24/7", label: "Field response" },
    ];
  }
  if (niche === "restaurant") {
    return [
      { value: "Nightly", label: "Service cadence" },
      { value: "Seasonal", label: "Tasting rhythm" },
      { value: "Private", label: "Dining inquiries" },
    ];
  }
  return [
    { value: plan.contrastMode === "high" ? "Bold" : "Calm", label: "Surface mode" },
    { value: "Editorial", label: "Image framing" },
    { value: "Direct", label: "Booking path" },
  ];
}

function heroSupportGrid(stats: Array<{ value: string; label: string }>): string {
  return `<div className="mt-8 grid gap-3 sm:grid-cols-3">
          ${stats
            .map(
              (item) => `<div className="rounded-[calc(var(--radius)+6px)] border bg-card/80 px-4 py-3">
            <p className="font-heading text-lg text-foreground">${item.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">${item.label}</p>
          </div>`
            )
            .join("\n")}
        </div>`;
}

function heroMediaCaption(niche: Niche): string {
  switch (niche) {
    case "saas":
      return "Live product context";
    case "construction":
      return "Active project context";
    case "restaurant":
      return "Dining atmosphere";
    default:
      return "Art-directed hero visual";
  }
}

function buildVariantHeroSection(params: {
  existingContent: string;
  brief: string;
  niche: Niche;
  variantPlan: WebsiteVariantPlan;
}): string {
  const copy = extractHeroCopy(params.existingContent, params.brief, params.niche);
  const stats = heroSupportStats(params.niche, params.variantPlan);
  const supportGrid = heroSupportGrid(stats);
  const caption = heroMediaCaption(params.niche);
  const buttonLabel = copy.cta;

  const splitProductHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-20 md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-xl text-left">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary">${copy.eyebrow}</p>
            <Heading as="h1" size="display" className="mt-5 max-w-lg font-heading text-left">
              ${copy.heading}
            </Heading>
            <p className="mt-6 max-w-xl font-body text-lg leading-8 text-muted-foreground">
              ${copy.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg">${buttonLabel}</Button>
              <Button size="lg" variant="outline">See the workflow</Button>
            </div>
            ${supportGrid}
          </div>
          <div className="relative lg:justify-self-end">
            <div className="overflow-hidden rounded-[calc(var(--radius)+14px)] border bg-card shadow-[var(--shadow-card)]">
              <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[380px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 left-6 max-w-xs rounded-[calc(var(--radius)+6px)] border bg-background/92 p-4 shadow-[var(--shadow-card)] backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Workflow visibility</p>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">One product canvas, one approval lane, one operational source of truth.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;

  const centeredRailHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">${copy.eyebrow}</p>
          <Heading as="h1" size="display" className="mt-5 font-heading text-center">
            ${copy.heading}
          </Heading>
          <p className="mx-auto mt-6 max-w-2xl font-body text-lg leading-8 text-muted-foreground">
            ${copy.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg">${buttonLabel}</Button>
            <Button size="lg" variant="outline">View proof</Button>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          ${stats
            .map(
              (item) => `<div className="rounded-[calc(var(--radius)+6px)] border bg-card px-5 py-4 text-left">
            <p className="font-heading text-xl text-foreground">${item.value}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">${item.label}</p>
          </div>`
            )
            .join("\n")}
        </div>
        <div className="mt-8 overflow-hidden rounded-[calc(var(--radius)+14px)] border bg-card shadow-[var(--shadow-card)]">
          <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[320px] w-full object-cover" />
        </div>
      </Container>
    </Section>
  );
}`;

  const commercialHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-18 md:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div className="max-w-xl text-left">
            <div className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
              ${copy.eyebrow}
            </div>
            <Heading as="h1" size="display" className="mt-6 max-w-lg font-heading text-left">
              ${copy.heading}
            </Heading>
            <p className="mt-5 max-w-lg font-body text-lg leading-8 text-muted-foreground">
              ${copy.body}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Button size="lg">${buttonLabel}</Button>
              <Button size="lg" variant="outline">Review capabilities</Button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[calc(var(--radius)+8px)] border bg-card p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Field proof</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  ${stats
                    .map(
                      (item) => `<div>
                    <p className="font-heading text-2xl text-foreground">${item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">${item.label}</p>
                  </div>`
                    )
                    .join("\n")}
                </div>
              </div>
              <div className="overflow-hidden rounded-[calc(var(--radius)+8px)] border bg-card shadow-[var(--shadow-card)]">
                <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[340px] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;

  const editorialImageLeftHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-20 md:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="overflow-hidden rounded-[calc(var(--radius)+14px)] border bg-card shadow-[var(--shadow-card)]">
            <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[420px] w-full object-cover" />
          </div>
          <div className="max-w-xl text-left">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">${copy.eyebrow}</p>
            <Heading as="h1" size="display" className="mt-6 font-heading text-left">
              ${copy.heading}
            </Heading>
            <p className="mt-6 font-body text-lg leading-8 text-muted-foreground">
              ${copy.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg">${buttonLabel}</Button>
              <Button size="lg" variant="outline">View the experience</Button>
            </div>
            <div className="mt-8 border-t border-border pt-6">
              ${supportGrid}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;

  const editorialSplitHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-22 md:py-30">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-lg text-left">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">${copy.eyebrow}</p>
            <Heading as="h1" size="display" className="mt-5 font-heading text-left">
              ${copy.heading}
            </Heading>
            <p className="mt-6 max-w-md font-body text-lg leading-8 text-muted-foreground">
              ${copy.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg">${buttonLabel}</Button>
              <Button size="lg" variant="outline">Explore the details</Button>
            </div>
            <div className="mt-10 max-w-sm rounded-[calc(var(--radius)+6px)] border bg-card p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Arrival note</p>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">A quieter support panel keeps the hero grounded without collapsing into a generic centered shell.</p>
            </div>
          </div>
          <div className="relative lg:pt-8">
            <div className="overflow-hidden rounded-[calc(var(--radius)+16px)] border bg-card shadow-[var(--shadow-card)]">
              <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[440px] w-full object-cover" />
            </div>
            <div className="absolute -bottom-8 right-6 max-w-xs rounded-[calc(var(--radius)+6px)] border bg-background/90 p-4 shadow-[var(--shadow-card)] backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Stay profile</p>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Hero media remains the dominant surface while the support card carries booking or experience context.</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;

  const cinematicOffsetHero = `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Hero() {
  return (
    <Section className="bg-background py-16 md:py-22">
      <Container>
        <div className="relative overflow-hidden rounded-[calc(var(--radius)+18px)] border bg-card shadow-[var(--shadow-card)]">
          <img src={projectImages.hero} alt="${caption}" className="h-full min-h-[520px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-transparent" />
          <div className="relative grid min-h-[520px] gap-8 p-8 md:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="self-end max-w-lg text-left">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary">${copy.eyebrow}</p>
              <Heading as="h1" size="display" className="mt-5 font-heading text-left">
                ${copy.heading}
              </Heading>
              <p className="mt-5 font-body text-lg leading-8 text-muted-foreground">
                ${copy.body}
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Button size="lg">${buttonLabel}</Button>
                <Button size="lg" variant="outline">View the menu</Button>
              </div>
            </div>
            <div className="self-start justify-self-end max-w-xs rounded-[calc(var(--radius)+6px)] border bg-background/85 p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Support rail</p>
              <div className="mt-4 space-y-3">
                ${stats
                  .map(
                    (item) => `<div className="border-b border-border/60 pb-3 last:border-b-0">
                  <p className="font-heading text-xl text-foreground">${item.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">${item.label}</p>
                </div>`
                  )
                  .join("\n")}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;

  switch (params.variantPlan.heroVariant) {
    case "product-ui-split":
    case "workflow-window":
      return splitProductHero;
    case "centered-launch-rail":
    case "centered-premium-statement":
      return centeredRailHero;
    case "proof-led-split":
    case "crew-and-project-split":
    case "metric-anchored-hero":
      return commercialHero;
    case "image-left-copy-right":
      return editorialImageLeftHero;
    case "editorial-split":
      return editorialSplitHero;
    case "cinematic-offset":
      return cinematicOffsetHero;
    default:
      return editorialSplitHero;
  }
}

function genericCandidateNamesForRole(
  role: VariantComponentEntry["role"]
): string[] {
  switch (role) {
    case "story":
      return ["Story", "About", "Narrative", "Process"];
    case "services":
      return ["Services", "Features", "Capabilities", "Offerings"];
    case "gallery":
      return ["Gallery", "Showcase", "SelectedWork"];
    case "proof":
      return ["Proof", "Testimonial", "Testimonials", "Metrics"];
    case "cta":
      return ["Conversion", "Contact", "Inquiry", "Cta", "Reservation"];
    case "footer":
      return ["Footer"];
    default:
      return [];
  }
}

function contentLooksLikeRole(
  role: VariantComponentEntry["role"],
  content: string
): boolean {
  switch (role) {
    case "story":
      return /(our story|about|process|why|workflow|team|approach)/i.test(content);
    case "services":
      return /(service|feature|workflow|capabilit|program|menu|scope|offer)/i.test(content);
    case "gallery":
      return /projectImages\.gallery|<img\b|Gallery\b|showcase/i.test(content);
    case "proof":
      return /(metric|trusted|clients|teams|quote|testimonial|proof|credential|case study|award)/i.test(content);
    case "cta":
      return /<Button\b|email|phone|address|hours|<form\b|<Input\b|<Textarea\b/i.test(content);
    case "footer":
      return /footer|email|phone|address|hours|newsletter|status/i.test(content);
    default:
      return false;
  }
}

function candidateMatchesRule(
  role: VariantComponentEntry["role"],
  componentName: string,
  content: string,
  niche: Niche,
  variantPlan: WebsiteVariantPlan
): boolean {
  const rule = getSectionFamilyRule(niche, variantPlan, role);

  if (rule.disallowedComponentNames.includes(componentName)) {
    return false;
  }
  if (rule.allowedComponentNames.includes(componentName)) {
    return true;
  }
  return (
    genericCandidateNamesForRole(role).includes(componentName) &&
    contentLooksLikeRole(role, content)
  );
}

function pickVariantCandidate(
  target: VariantComponentEntry,
  niche: Niche,
  variantPlan: WebsiteVariantPlan,
  fileMap: Map<string, string>,
  availablePaths: string[],
  usedPaths: Set<string>,
  appOrder: string[]
): string | null {
  if (availablePaths.includes(target.filePath)) {
    usedPaths.add(target.filePath);
    return target.filePath;
  }

  for (const path of availablePaths) {
    if (usedPaths.has(path)) continue;
    const componentName = componentNameFromPath(path);
    const content = fileMap.get(path) ?? "";
    if (candidateMatchesRule(target.role, componentName, content, niche, variantPlan)) {
      usedPaths.add(path);
      return path;
    }
  }

  for (const componentName of appOrder) {
    const path = `src/components/${componentName}.tsx`;
    if (!availablePaths.includes(path) || usedPaths.has(path)) continue;
    if (componentName === "Navbar" || componentName === "Hero") continue;
    const content = fileMap.get(path) ?? "";
    if (!candidateMatchesRule(target.role, componentName, content, niche, variantPlan)) {
      continue;
    }
    usedPaths.add(path);
    return path;
  }

  return null;
}

function fallbackNarrative(niche: Niche): {
  eyebrow: string;
  heading: string;
  body: string;
  support: string;
} {
  switch (niche) {
    case "saas":
      return {
        eyebrow: "Workflow clarity",
        heading: "See the system behind every handoff.",
        body: "Turn approvals, routing, and reporting into a single operating rhythm with visible ownership across the workflow.",
        support: "The page keeps product language in product sections instead of drifting into service-company scaffolds.",
      };
    case "construction":
      return {
        eyebrow: "Field process",
        heading: "Preconstruction discipline meets on-site execution.",
        body: "Scope review, schedule control, and trade coordination stay visible from kickoff through closeout.",
        support: "Commercial proof, service lanes, and estimate flow now stay in the construction family.",
      };
    case "restaurant":
      return {
        eyebrow: "Atmosphere",
        heading: "A service story built around rhythm, craft, and timing.",
        body: "The room, the pacing, and the course sequence are designed to feel considered from the first pour to the final course.",
        support: "Editorial hospitality language replaces generic product or service scaffolds.",
      };
    default:
      return {
        eyebrow: "Point of view",
        heading: "The selected family now controls this section again.",
        body: "When the generated section drifted into the wrong family, finalize rebuilt the structure around the chosen plan.",
        support: "The final page keeps distinct section families instead of collapsing into one safe closure pattern.",
      };
  }
}

function buildVariantFallbackSection(
  target: VariantComponentEntry,
  niche: Niche,
  variantPlan: WebsiteVariantPlan
): string {
  const componentName = target.componentName;
  const narrative = fallbackNarrative(niche);

  if (target.role === "story") {
    return `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-background">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <Heading eyebrow="${narrative.eyebrow}" size="h2" className="font-heading text-left">
              ${narrative.heading}
            </Heading>
            <p className="mt-5 max-w-xl font-body text-base leading-7 text-muted-foreground">
              ${narrative.body}
            </p>
            <p className="mt-4 max-w-lg font-body text-sm leading-6 text-muted-foreground">
              ${narrative.support}
            </p>
          </div>
          <div className="overflow-hidden rounded-[calc(var(--radius)+10px)] border bg-card shadow-sm">
            <img src={projectImages.support} alt="${narrative.eyebrow}" className="h-full min-h-[320px] w-full object-cover" />
          </div>
        </div>
      </Container>
    </Section>
  );
}`;
  }

  if (target.role === "services") {
    const isTimeline = /Timeline|Rows|Lanes|StorySections/.test(componentName);
    const isGrid = /Grid|Cards|Matrix/.test(componentName);
    const body = isTimeline
      ? `
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["01", "Plan", "Clarify the first operational move and remove ambiguity."],
            ["02", "Align", "Sequence the work into a confident, visible handoff structure."],
            ["03", "Deliver", "Close with a measurable outcome and next action surface."],
          ].map(([step, title, copy]) => (
            <div key={step} className="rounded-[calc(var(--radius)+6px)] border bg-card p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{step}</p>
              <h3 className="mt-3 font-heading text-xl text-foreground">{title}</h3>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>`
      : isGrid
        ? `
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[calc(var(--radius)+8px)] border bg-card p-7">
            <h3 className="font-heading text-2xl text-foreground">Primary capability</h3>
            <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">One dominant offer anchors the section instead of three identical cards.</p>
          </div>
          <div className="space-y-6">
            <div className="rounded-[calc(var(--radius)+6px)] border bg-muted p-6">
              <h4 className="font-heading text-lg text-foreground">Secondary lane</h4>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Supporting depth sits beside the anchor block.</p>
            </div>
            <div className="rounded-[calc(var(--radius)+6px)] border bg-card p-6">
              <h4 className="font-heading text-lg text-foreground">Proof-backed detail</h4>
              <p className="mt-2 font-body text-sm leading-6 text-muted-foreground">Use one tighter block to avoid a repeated equal-card rhythm.</p>
            </div>
          </div>
        </div>`
        : `
        <div className="space-y-5">
          {[
            ["Anchor offer", "Lead with one stronger lane rather than equal cards."],
            ["Support lane", "Vary width, spacing, and emphasis between rows."],
            ["Closing lane", "Use one highlighted detail or media-backed lane."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-[calc(var(--radius)+6px)] border bg-card p-6">
              <h3 className="font-heading text-xl text-foreground">{title}</h3>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>`;

    return `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-muted/40">
      <Container>
        <Heading eyebrow="Section family" size="h2" className="font-heading text-left">
          Structured capability language for this ${niche} page.
        </Heading>
        <p className="mt-4 max-w-2xl font-body text-base leading-7 text-muted-foreground">
          This section is rebuilt from the selected ${variantPlan.featureVariant} family so it does not inherit the wrong scaffold from another niche.
        </p>
        <div className="mt-8">
${body}
        </div>
      </Container>
    </Section>
  );
}`;
  }

  if (target.role === "gallery") {
    return `import React from "react";
import { projectImages } from "@/assets/generated-images";
import Gallery from "@/components/ui/gallery";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-background">
      <Container>
        <Heading eyebrow="Visual proof" size="h2" className="font-heading text-left">
          Real imagery carries this section instead of a generic card wall.
        </Heading>
        <p className="mt-4 max-w-2xl font-body text-base leading-7 text-muted-foreground">
          The gallery stays asymmetric and image-led so the page does not flatten into another centered template.
        </p>
        <div className="mt-8">
          <Gallery
            images={[
              { src: projectImages.gallery1, alt: "Primary showcase image", span: "wide" },
              { src: projectImages.gallery2, alt: "Supporting showcase image" },
              { src: projectImages.gallery3, alt: "Additional showcase image", span: "tall" },
            ]}
          />
        </div>
      </Container>
    </Section>
  );
}`;
  }

  if (target.role === "proof") {
    if (variantPlan.proofVariant.includes("metric")) {
      return `import React from "react";
import StatsBand from "@/components/ui/stats-band";

export default function ${componentName}() {
  return (
    <StatsBand
      className="bg-card"
      stats={[
        { value: "24/7", label: "Operational visibility" },
        { value: "99.9%", label: "Execution confidence" },
        { value: "3x", label: "Faster handoff clarity" },
      ]}
    />
  );
}`;
    }

    return `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-card">
      <Container size="lg">
        <div className="rounded-[calc(var(--radius)+8px)] border p-8">
          <Heading eyebrow="Proof" size="h3" className="font-heading text-left">
            Evidence presented in the correct ${variantPlan.proofVariant} family.
          </Heading>
          <blockquote className="mt-5 max-w-3xl font-heading text-2xl leading-tight text-foreground">
            “The page now preserves the selected proof structure instead of defaulting to a generic testimonial pattern.”
          </blockquote>
          <p className="mt-4 font-body text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Named attribution • grounded evidence • distinct surface treatment
          </p>
        </div>
      </Container>
    </Section>
  );
}`;
  }

  if (target.role === "cta") {
    const intro =
      niche === "saas"
        ? "Start with a product-led conversion surface."
        : niche === "construction"
          ? "Start with a scoped contact or estimate surface."
          : niche === "restaurant"
            ? "Start with a reservation-led action surface."
            : "Start with a direct framed conversion surface.";

    return `import React from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-card">
      <Container>
        <div className="grid gap-10 rounded-[calc(var(--radius)+10px)] border bg-background p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-xl">
            <Heading eyebrow="Next step" size="h2" className="font-heading text-left">
              ${intro}
            </Heading>
            <p className="mt-4 font-body text-base leading-7 text-muted-foreground">
              This CTA is rebuilt from the selected ${variantPlan.ctaVariant} family so the page closes with the right conversion structure.
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>Direct contact, framed surface, and real input fields remain visible.</p>
              <p>No centered headline-plus-buttons fallback survives finalize.</p>
            </div>
          </div>
          <form className="space-y-4 rounded-[calc(var(--radius)+6px)] border bg-card p-6">
            <Input label="Name" placeholder="Your name" />
            <Input label="Email" type="email" placeholder="name@company.com" />
            <Textarea label="Project details" placeholder="Tell us what you need." />
            <Button className="w-full">Send request</Button>
          </form>
        </div>
      </Container>
    </Section>
  );
}`;
  }

  return `import React from "react";
import Button from "@/components/ui/button";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ${componentName}() {
  return (
    <Section className="bg-muted/30 py-16">
      <Container>
        <div className="grid gap-10 border-t border-border pt-10 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div>
            <Heading size="h3" className="font-heading text-left">
              ${variantPlan.footerVariant}
            </Heading>
            <p className="mt-4 max-w-sm font-body text-sm leading-6 text-muted-foreground">
              Real contact details and a branded closing surface keep the footer in the right family.
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>info@example.com</p>
            <p>+1 (555) 014-2036</p>
            <p>Open daily for inquiries</p>
          </div>
          <div className="lg:justify-self-end">
            <Button variant="outline">Primary contact</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}`;
}

function applyVariantExecutionPlan(
  raw: string,
  brief: string,
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): string {
  if (!variantPlan) return raw;

  const parsed = parseProjectContent(raw);
  const tree = getVariantComponentTree(niche, variantPlan);
  const appFile = parsed.files.find((file) => file.path === "src/App.tsx");
  const appOrder = appFile ? extractAppRenderOrder(appFile.content) : [];
  const availablePaths = collectSectionFiles(raw);
  const fileMap = new Map(parsed.files.map((file) => [file.path, file.content]));
  const usedPaths = new Set<string>([
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
  ]);

  let result = raw;
  const existingHeroContent = parsed.files.find(
    (file) => file.path === "src/components/Hero.tsx"
  )?.content ?? "";

  result = upsertFileBlock(
    result,
    "src/components/Hero.tsx",
    buildVariantHeroSection({
      existingContent: existingHeroContent,
      brief,
      niche,
      variantPlan,
    })
  );

  for (const target of tree) {
    if (target.role === "navbar" || target.role === "hero") continue;
    const candidatePath = pickVariantCandidate(
      target,
      niche,
      variantPlan,
      fileMap,
      availablePaths,
      usedPaths,
      appOrder
    );
    if (!candidatePath) {
      result = upsertFileBlock(
        result,
        target.filePath,
        buildVariantFallbackSection(target, niche, variantPlan)
      );
      continue;
    }
    if (candidatePath === target.filePath) continue;

    const candidateFile = parsed.files.find((file) => file.path === candidatePath);
    if (!candidateFile) {
      result = upsertFileBlock(
        result,
        target.filePath,
        buildVariantFallbackSection(target, niche, variantPlan)
      );
      continue;
    }
    result = upsertFileBlock(result, target.filePath, candidateFile.content);
  }

  const refreshed = parseProjectContent(result);
  const refreshedMeta = (refreshed.meta ?? {}) as ProjectMeta & {
    sectionOrder?: string[];
  };
  const nextMeta: Record<string, unknown> = {
    ...refreshedMeta,
    sectionOrder: tree.map((entry) => entry.componentName),
  };

  result = replaceManifest(result, nextMeta);
  result = upsertFileBlock(result, "src/App.tsx", buildVariantAppFile(tree));

  return result;
}

function addImportIfMissing(content: string): string {
  const hasImport =
    content.includes('from "@/assets/generated-images"') ||
    content.includes("from '@/assets/generated-images'");

  if (hasImport || !/projectImages\./.test(content)) {
    return content;
  }

  const lines = content.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length && /^\s*import\s/.test(lines[insertAt])) {
    insertAt += 1;
  }

  return [
    ...lines.slice(0, insertAt),
    'import { projectImages } from "@/assets/generated-images";',
    ...lines.slice(insertAt),
  ].join("\n");
}

function rewriteImageLiterals(filePath: string, content: string): string {
  if (
    !filePath.startsWith("src/components/") ||
    filePath.startsWith("src/components/ui/") ||
    !filePath.endsWith(".tsx")
  ) {
    return content;
  }

  const lowerPath = filePath.toLowerCase();
  const preferredKeys =
    lowerPath.includes("hero")
      ? ["hero", "support", "gallery1"]
      : lowerPath.includes("gallery")
        ? ["gallery1", "gallery2", "gallery3", "detail1"]
        : lowerPath.includes("story") || lowerPath.includes("about")
          ? ["support", "detail1", "gallery1"]
          : lowerPath.includes("menu") ||
              lowerPath.includes("services") ||
              lowerPath.includes("feature") ||
              lowerPath.includes("product")
            ? ["detail1", "gallery1", "gallery2", "support"]
            : ["support", "gallery1", "gallery2", "detail1"];

  let keyIndex = 0;
  const nextKey = () => preferredKeys[Math.min(keyIndex++, preferredKeys.length - 1)];

  let rewritten = content;

  rewritten = rewritten.replace(
    /(src|image|img|avatar|photo):\s*"https?:\/\/[^"]+"/g,
    (_match, prop: string) => `${prop}: projectImages.${nextKey()}`
  );

  rewritten = rewritten.replace(
    /(src|poster)=["']https?:\/\/[^"']+["']/g,
    (_match, prop: string) => `${prop}={projectImages.${nextKey()}}`
  );

  rewritten = rewritten.replace(
    /["']https?:\/\/images\.unsplash\.com[^"']+["']/g,
    () => `projectImages.${nextKey()}`
  );

  // Catch /placeholder.svg, ./placeholder.svg, or bare placeholder.svg
  // references (causes ERR_TOO_MANY_REDIRECTS in sandboxed srcdoc iframe).
  rewritten = rewritten.replace(
    /(src|image|img|avatar|photo):\s*["'](?:\.?\/)?placeholder\.svg["']/g,
    (_match, prop: string) => `${prop}: projectImages.${nextKey()}`
  );

  rewritten = rewritten.replace(
    /(src|poster)=["'](?:\.?\/)?placeholder\.svg["']/g,
    (_match, prop: string) => `${prop}={projectImages.${nextKey()}}`
  );

  rewritten = rewritten.replace(
    /["'](?:\.?\/)?placeholder\.svg["']/g,
    () => `projectImages.${nextKey()}`
  );

  if (rewritten !== content) {
    rewritten = addImportIfMissing(rewritten);
  }

  return rewritten;
}

function ensureButtonImport(content: string): string {
  if (
    content.includes('from "@/components/ui/button"') ||
    content.includes("from '@/components/ui/button'")
  ) {
    return content;
  }

  const lines = content.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length && /^\s*import\s/.test(lines[insertAt])) {
    insertAt += 1;
  }

  return [
    ...lines.slice(0, insertAt),
    'import Button from "@/components/ui/button";',
    ...lines.slice(insertAt),
  ].join("\n");
}

function normalizePrimaryCtas(content: string): string {
  let rewritten = content;

  rewritten = rewritten.replace(
    /<a([^>]*className="[^"]*(?:bg-|rounded|border|px-\d|py-\d)[^"]*"[^>]*)href=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/g,
    (_match, before, _quote, href, after, inner) =>
      `<Button asChild${before}${after}><a href="${href}">${inner}</a></Button>`
  );

  rewritten = rewritten.replace(
    /<button([^>]*className="[^"]*(?:bg-|rounded|border|px-\d|py-\d)[^"]*"[^>]*)>([\s\S]*?)<\/button>/g,
    (_match, attrs, inner) => `<Button${attrs}>${inner}</Button>`
  );

  if (rewritten !== content) {
    rewritten = ensureButtonImport(rewritten);
  }

  return rewritten;
}

function buildHeroSupportBlock(family: DesignFamilyId): string {
  const familyMeta = getDesignFamily(family);
  const values =
    family === "editorial_luxury"
      ? [
          { value: "Seasonal", label: "Tasting cadence" },
          { value: "Awarded", label: "Press recognition" },
          { value: "Nightly", label: "Reservations" },
        ]
      : family === "bold_commercial"
        ? [
            { value: "25+", label: "Years delivered" },
            { value: "500+", label: "Projects built" },
            { value: "24/7", label: "Crew response" },
          ]
        : family === "warm_artisan"
          ? [
              { value: "Local", label: "Ingredient sourcing" },
              { value: "Handmade", label: "Craft standard" },
              { value: "Seasonal", label: "Small-batch rhythm" },
            ]
          : [
              { value: "12K+", label: "Teams onboarded" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" },
            ];

  return `
      <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        ${values
          .map(
            (item) => `<div className="surface-card rounded-[calc(var(--radius)+4px)] border px-4 py-3">
          <p className="text-lg font-semibold">${item.value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">${item.label}</p>
        </div>`
          )
          .join("\n")}
      </div>
      <div className="family-divider mt-6 max-w-2xl"></div>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">${familyMeta.cta}</p>`;
}

function normalizeHeroSupport(
  content: string,
  family: DesignFamilyId
): string {
  const hasSupportStructure =
    /(Projects shipped|Uptime|Support|Reservations|Tasting cadence|Years delivered|Ingredient sourcing|Awarded)/.test(
      content
    ) || /StatsBand|grid-cols-3[\s\S]{0,320}text-muted-foreground/.test(content);

  if (hasSupportStructure) {
    return content;
  }

  const supportBlock = buildHeroSupportBlock(family);

  if (/<\/Container>/.test(content)) {
    return content.replace(/<\/Container>/, `${supportBlock}\n      </Container>`);
  }

  return content.replace(/<\/Section>/, `${supportBlock}\n    </Section>`);
}

function ensureGeneratedImagesImport(content: string): string {
  const hasImport =
    content.includes('from "@/assets/generated-images"') ||
    content.includes("from '@/assets/generated-images'");

  if (hasImport) {
    return content;
  }

  const lines = content.split("\n");
  let insertAt = 0;
  while (insertAt < lines.length && /^\s*import\s/.test(lines[insertAt])) {
    insertAt += 1;
  }

  return [
    ...lines.slice(0, insertAt),
    'import { projectImages } from "@/assets/generated-images";',
    ...lines.slice(insertAt),
  ].join("\n");
}

function mediaKeyForSection(
  filePath: string,
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): "hero" | "support" | "gallery1" | "gallery2" | "gallery3" | "detail1" {
  const lowerPath = filePath.toLowerCase();
  if (lowerPath.includes("hero")) return "hero";
  if (lowerPath.includes("proof") || lowerPath.includes("testimonial")) {
    return variantPlan?.proofVariant.includes("metric") ? "detail1" : "gallery3";
  }
  if (
    lowerPath.includes("conversion") ||
    lowerPath.includes("booking") ||
    lowerPath.includes("reservation") ||
    lowerPath.includes("contact") ||
    lowerPath.includes("estimate") ||
    lowerPath.includes("signup")
  ) {
    return variantPlan?.ctaVariant.includes("form") ? "detail1" : "gallery3";
  }
  if (lowerPath.includes("gallery") || lowerPath.includes("showcase") || lowerPath.includes("selectedwork")) return "gallery1";
  if (lowerPath.includes("project")) return niche === "saas" ? "gallery2" : "gallery1";
  if (lowerPath.includes("story") || lowerPath.includes("about") || lowerPath.includes("chef")) return "support";
  if (lowerPath.includes("service") || lowerPath.includes("capabil") || lowerPath.includes("process")) return "gallery2";
  if (lowerPath.includes("pricing") || lowerPath.includes("invitation")) return "gallery3";
  return "support";
}

function buildFallbackMediaBlock(
  filePath: string,
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): string {
  const key = mediaKeyForSection(filePath, niche, variantPlan);
  const lowerPath = filePath.toLowerCase();
  const isHero = lowerPath.includes("hero");
  const isSaas = niche === "saas";
  const shellClass = isHero
    ? "relative overflow-hidden rounded-[calc(var(--radius)+10px)] border bg-card/70 shadow-[var(--shadow-card)]"
    : "relative overflow-hidden rounded-[calc(var(--radius)+8px)] border bg-card/70 shadow-[var(--shadow-card)]";
  const wrapperClass = isHero
    ? "lg:justify-self-end"
    : "mt-10";
  const imageHeight = isHero ? "aspect-[16/10] min-h-[320px]" : "aspect-[4/3] min-h-[260px]";
  const caption = isSaas
    ? "Live product visual"
    : "Art-directed supporting visual";

  return `
      <div className="${wrapperClass}">
        <div className="${shellClass}">
          <img
            src={projectImages.${key}}
            alt="${caption}"
            className="h-full w-full ${imageHeight} object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 via-background/15 to-transparent p-5">
            <div className="inline-flex rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              ${caption}
            </div>
          </div>
        </div>
      </div>`;
}

function enforceSectionMedia(
  filePath: string,
  content: string,
  niche: Niche,
  variantPlan?: WebsiteVariantPlan
): string {
  if (
    !filePath.startsWith("src/components/") ||
    filePath.startsWith("src/components/ui/") ||
    !filePath.endsWith(".tsx")
  ) {
    return content;
  }

  const lowerPath = filePath.toLowerCase();
  const isImageBearing =
    /(hero|story|about|chef|gallery|showcase|selectedwork|project|service|capabil|process|proof|testimonial|pricing|conversion|estimate|contact|invitation)/.test(
      lowerPath
    );

  if (!isImageBearing) {
    return content;
  }

  const hasRealMedia =
    /<img\b/.test(content) ||
    /projectImages\./.test(content);

  const hasPlaceholderPanel =
    niche !== "saas" &&
    /(dashboard|workflow|analytics|browser|window|chrome)/i.test(content) &&
    !/<img\b/.test(content);

  if (hasRealMedia && !hasPlaceholderPanel) {
    return content;
  }

  let rewritten = ensureGeneratedImagesImport(content);
  const mediaBlock = buildFallbackMediaBlock(filePath, niche, variantPlan);

  if (lowerPath.includes("hero")) {
    if (/<div className="grid[^"]*lg:grid-cols-2[^"]*">/.test(rewritten)) {
      rewritten = rewritten.replace(
        /(<div className="grid[^"]*lg:grid-cols-2[^"]*">[\s\S]*?)(\n\s*<\/div>\n\s*<\/Container>)/,
        `$1${mediaBlock}$2`
      );
    } else if (/<\/Container>/.test(rewritten)) {
      rewritten = rewritten.replace(/<\/Container>/, `${mediaBlock}\n      </Container>`);
    }
    return rewritten;
  }

  if (/<\/Container>/.test(rewritten)) {
    return rewritten.replace(/<\/Container>/, `${mediaBlock}\n      </Container>`);
  }

  return rewritten;
}

function getLayoutSignature(content: string): string {
  if (/Gallery|grid-cols-3[\s\S]{0,200}<img|aspect-\[/.test(content) && /<img/.test(content)) {
    return "gallery";
  }
  if (/timeline|border-l|space-y-8[\s\S]{0,200}(?:01|02|03|04|step)/i.test(content)) {
    return "timeline";
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

function diversifyDuplicateLayout(
  _filePath: string,
  content: string,
  signature: string
): string {
  switch (signature) {
    case "centered-stack":
      return content.replace(/\btext-center\b/g, "text-left");
    case "grid":
      return content
        .replace(/\bmd:grid-cols-3\b/g, "md:grid-cols-2")
        .replace(/\blg:grid-cols-3\b/g, "lg:grid-cols-2")
        .replace(/\bmd:grid-cols-4\b/g, "md:grid-cols-2")
        .replace(/\blg:grid-cols-4\b/g, "lg:grid-cols-2");
    case "gallery":
      return content
        .replace(/\bgrid-cols-12\b/g, "grid-cols-1 lg:grid-cols-2")
        .replace(/\bmd:grid-cols-3\b/g, "md:grid-cols-2")
        .replace(/\blg:grid-cols-3\b/g, "lg:grid-cols-2")
        .replace(/\blg:grid-cols-4\b/g, "lg:grid-cols-2")
        .replace(/\bgrid-cols-2\b/g, "grid-cols-1 sm:grid-cols-2")
        .replace(/\b(?:md|lg):col-span-\d+\b/g, "")
        .replace(/\baspect-\[[^\]]+\]/g, "min-h-[260px]");
    case "split":
      return content
        .replace(/\blg:grid-cols-\[[^\]]+\]\b/g, "grid-cols-1")
        .replace(/\bmd:grid-cols-2\b/g, "grid-cols-1")
        .replace(/\blg:grid-cols-2\b/g, "grid-cols-1")
        .replace(/\bitems-center\b/g, "items-start");
    case "timeline":
      return content
        .replace(/\bborder-l\b/g, "border-t")
        .replace(/\bspace-y-8\b/g, "grid gap-6 md:grid-cols-3")
        .replace(/\bspace-y-10\b/g, "grid gap-6 md:grid-cols-3")
        .replace(/\bspace-y-12\b/g, "grid gap-6 md:grid-cols-3");
    default:
      return content;
  }
}

function rewriteProjectFiles(raw: string, family: DesignFamilyId): string {
  const seenSignatures = new Map<string, number>();
  return raw.replace(
    /===FILE:(.*?)===\n([\s\S]*?)===END_FILE===/g,
    (_match, filePath: string, content: string) => {
      const normalizedPath = filePath.trim();
      let rewritten = rewriteImageLiterals(normalizedPath, content.trimEnd());
      if (
        normalizedPath.startsWith("src/components/") &&
        !normalizedPath.startsWith("src/components/ui/") &&
        normalizedPath.endsWith(".tsx")
      ) {
        rewritten = normalizePrimaryCtas(rewritten);
        if (/\/Hero\.tsx$/.test(normalizedPath)) {
          rewritten = normalizeHeroSupport(rewritten, family);
        }
        const signature = getLayoutSignature(rewritten);
        const seenCount = seenSignatures.get(signature) ?? 0;
        if (signature !== "other" && seenCount >= 1) {
          rewritten = diversifyDuplicateLayout(normalizedPath, rewritten, signature);
        }
        seenSignatures.set(signature, seenCount + 1);
      }
      return `===FILE:${normalizedPath}===\n${rewritten}\n===END_FILE===`;
    }
  );
}

// ─── Design Pass ────────────────────────────────────────────────
// Single deterministic post-processing pass for spacing, typography,
// CTA visibility, and section transitions. Runs on the full raw output.

function applyDesignPass(
  raw: string,
  family: DesignFamilyId,
  niche?: Niche,
  variantPlan?: WebsiteVariantPlan
): string {
  let result = raw;

  // Pass 1: Clamp oversized typography (text-8xl, text-9xl → text-6xl)
  result = result.replace(/\btext-8xl\b/g, "text-6xl");
  result = result.replace(/\btext-9xl\b/g, "text-6xl");

  // Pass 2: Ensure images have object-cover
  result = result.replace(
    /===FILE:(src\/components\/(?!ui\/)[^=]+\.tsx)===\n([\s\S]*?)===END_FILE===/g,
    (_match, filePath: string, content: string) => {
      let patched = niche
        ? enforceSectionMedia(filePath, content, niche, variantPlan)
        : content;

      // Add object-cover to img tags that lack it
      patched = patched.replace(
        /<img\b([^>]*?)className="([^"]*)"([^>]*?)\/>/g,
        (_m, before: string, classes: string, after: string) => {
          if (!/object-cover|object-contain/.test(classes)) {
            return `<img${before}className="${classes} object-cover"${after}/>`;
          }
          return `<img${before}className="${classes}"${after}/>`;
        }
      );

      return `===FILE:${filePath}===\n${patched}===END_FILE===`;
    }
  );

  // Pass 3: Ensure varied py spacing — if all sections share same py-N,
  // diversify using family-specific spacing profiles
  const sectionBlocks = Array.from(
    result.matchAll(/===FILE:(src\/components\/(?!ui\/)[^=]+\.tsx)===\n([\s\S]*?)===END_FILE===/g)
  );
  const pyValues = new Set<string>();
  for (const block of sectionBlocks) {
    const matches = block[2].match(/\bpy-(\d+)\b/g);
    if (matches) for (const m of matches) pyValues.add(m);
  }
  if (pyValues.size <= 1 && sectionBlocks.length >= 3) {
    // Build family-aware spacing cycle from spacing profile
    const spacingProfile = getSpacingProfile(family);
    const profilePaddings = Object.values(spacingProfile.sectionPadding)
      .map((p) => p.split(" ")[0]); // Take mobile-first value (e.g. "py-24" from "py-24 md:py-32")
    // Dedupe and use as cycle — guarantees variety per family personality
    const spacingCycle = [...new Set(profilePaddings)].filter((p) => p !== "py-3" && p !== "py-4"); // exclude navbar-tiny values
    let idx = 0;
    result = result.replace(
      /===FILE:(src\/components\/(?!ui\/)[^=]+\.tsx)===\n([\s\S]*?)===END_FILE===/g,
      (_match, filePath: string, content: string) => {
        const currentPy = content.match(/\bpy-(\d+)\b/);
        if (currentPy) {
          const replacement = spacingCycle[idx % spacingCycle.length];
          idx++;
          const patched = content.replace(
            new RegExp(`\\bpy-${currentPy[1]}\\b`),
            replacement
          );
          return `===FILE:${filePath}===\n${patched}===END_FILE===`;
        }
        return `===FILE:${filePath}===\n${content}===END_FILE===`;
      }
    );
  }

  // Pass 4: Ensure CTA/Contact sections have a surface shift
  // If a CTA section has no distinct background, add bg-card
  result = result.replace(
    /===FILE:(src\/components\/(?:CTA|Contact|Conversion|Reservation|Booking|Inquiry)[^=]*\.tsx)===\n([\s\S]*?)===END_FILE===/g,
    (_match, filePath: string, content: string) => {
      const hasSurfaceShift = /bg-(?:card|muted|secondary|zinc-|slate-|neutral-|stone-|primary|accent)/.test(content);
      if (!hasSurfaceShift) {
        // Add bg-card to the Section wrapper if present
        const patched = content.replace(
          /<Section\b([^>]*)className="([^"]*)"/,
          (_m, before: string, classes: string) =>
            `<Section${before}className="${classes} bg-card"`
        );
        if (patched !== content) {
          return `===FILE:${filePath}===\n${patched}===END_FILE===`;
        }
      }
      return `===FILE:${filePath}===\n${content}===END_FILE===`;
    }
  );

  // Pass 5: Normalize font tokens — replace raw font-serif/font-sans with design system tokens
  result = result.replace(
    /===FILE:(src\/components\/(?!ui\/)[^=]+\.tsx)===\n([\s\S]*?)===END_FILE===/g,
    (_match, filePath: string, content: string) => {
      let patched = content;
      // Replace font-serif in className with font-heading
      patched = patched.replace(
        /(\bclassName="[^"]*)\bfont-serif\b/g,
        "$1font-heading"
      );
      // Replace font-sans in className with font-body (only in body-text contexts, not in tailwind config)
      patched = patched.replace(
        /(\bclassName="[^"]*)\bfont-sans\b/g,
        "$1font-body"
      );
      return `===FILE:${filePath}===\n${patched}===END_FILE===`;
    }
  );

  return result;
}

function buildContrastOverrideBlock(
  family: DesignFamilyId,
  variantPlan?: WebsiteVariantPlan
): string {
  if (!variantPlan) return "";

  const isLightFamily =
    family === "modern_minimal" || family === "warm_artisan";

  if (variantPlan.contrastMode === "balanced") {
    return `/* cenate-variant-contrast: balanced */`;
  }

  if (variantPlan.contrastMode === "high") {
    return isLightFamily
      ? `/* cenate-variant-contrast: high */
@layer base {
  :root {
    --background: 210 40% 99%;
    --card: 0 0% 100%;
    --foreground: 222 47% 8%;
    --muted: 210 30% 95%;
    --border: 214 24% 86%;
  }
}`
      : `/* cenate-variant-contrast: high */
@layer base {
  :root {
    --background: 222 34% 6%;
    --card: 222 29% 10%;
    --foreground: 210 40% 98%;
    --muted: 222 24% 14%;
    --border: 217 24% 18%;
  }
}`;
  }

  return isLightFamily
    ? `/* cenate-variant-contrast: soft */
@layer base {
  :root {
    --background: 36 38% 97%;
    --card: 36 30% 95%;
    --foreground: 24 18% 20%;
    --muted: 36 28% 92%;
    --border: 32 18% 88%;
  }
}`
    : `/* cenate-variant-contrast: soft */
@layer base {
  :root {
    --background: 20 12% 10%;
    --card: 20 10% 14%;
    --foreground: 40 20% 92%;
    --muted: 20 8% 18%;
    --border: 20 8% 24%;
  }
}`;
}

function applyVariantThemePlan(
  raw: string,
  family: DesignFamilyId,
  variantPlan?: WebsiteVariantPlan
): string {
  if (!variantPlan) return raw;

  const overrideBlock = buildContrastOverrideBlock(family, variantPlan);
  if (!overrideBlock) return raw;

  return raw.replace(
    /===FILE:src\/index\.css===\n([\s\S]*?)===END_FILE===/,
    (_match, content: string) =>
      `===FILE:src/index.css===\n${content.trimEnd()}\n\n${overrideBlock}\n===END_FILE===`
  );
}

function normalizeMeta(
  parsedMeta: (ProjectMeta & {
    typography?: string;
    sectionOrder?: string[];
  }) | null,
  family: DesignFamilyId
): Record<string, unknown> {
  return {
    type: "project",
    framework: parsedMeta?.framework ?? "vite-react-ts",
    title: parsedMeta?.title ?? "Cenate Website",
    summary: parsedMeta?.summary,
    entryFile: "src/main.tsx",
    previewEntryFile: "src/App.tsx",
    siteType: parsedMeta?.siteType ?? "other",
    designFamily: family,
    designDirection: parsedMeta?.designDirection,
    colorStrategy: parsedMeta?.colorStrategy,
    typography: parsedMeta?.typography,
    sectionOrder: parsedMeta?.sectionOrder ?? [],
    assets: [],
  };
}

export type FinalizedWebsiteProject = {
  content: string;
  conformance: DesignConformanceReport;
};

/**
 * Light finalize: scaffold injection + file rewriting (no image generation).
 * Fast and deterministic — safe to call inside a repair loop.
 */
export function lightFinalizeWebsiteProjectWithConformance(params: {
  raw: string;
  brief: string;
  niche: Niche;
  designFamily?: DesignFamilyId;
  variantPlan?: WebsiteVariantPlan;
}): FinalizedWebsiteProject {
  let result = injectScaffoldFiles(params.raw);
  const parsed = parseProjectContent(result);
  const metaRecord = parsed.meta as (ProjectMeta & {
    designFamily?: string;
    sectionOrder?: string[];
  }) | null;
  const family =
    params.designFamily ??
    (metaRecord?.designFamily as DesignFamilyId | undefined) ??
    selectDesignFamily(params.niche, params.brief);

  const meta = normalizeMeta(metaRecord, family);
  result = replaceManifest(result, meta);
  result = rewriteProjectFiles(result, family);
  result = applyDesignPass(result, family, params.niche, params.variantPlan);
  result = applyVariantExecutionPlan(result, params.brief, params.niche, params.variantPlan);
  result = injectScaffoldFiles(result);
  result = applyVariantThemePlan(result, family, params.variantPlan);

  return {
    content: result,
    conformance: checkCenateDesignConformance({
      raw: result,
      specId: family,
      niche: params.niche,
      designFamily: family,
      variantPlan: params.variantPlan,
    }),
  };
}

export function lightFinalizeWebsiteProject(params: {
  raw: string;
  brief: string;
  niche: Niche;
  designFamily?: DesignFamilyId;
  variantPlan?: WebsiteVariantPlan;
}): string {
  return lightFinalizeWebsiteProjectWithConformance(params).content;
}

/**
 * Full finalize: light finalize + async image generation + image injection.
 * Expensive — call ONCE after the repair loop has chosen the final candidate.
 */
export async function finalizeWebsiteProjectWithConformance(params: {
  raw: string;
  brief: string;
  niche: Niche;
  designFamily?: DesignFamilyId;
  uploadedImageUrls?: string[];
  variantPlan?: WebsiteVariantPlan;
  imagePlan?: ProjectImagePlan;
}): Promise<FinalizedWebsiteProject> {
  let result = injectScaffoldFiles(params.raw);
  const parsed = parseProjectContent(result);
  const metaRecord = parsed.meta as (ProjectMeta & {
    designFamily?: string;
    sectionOrder?: string[];
  }) | null;
  const family =
    params.designFamily ??
    (metaRecord?.designFamily as DesignFamilyId | undefined) ??
    selectDesignFamily(params.niche, params.brief);

  const images = await generateProjectImages({
    brief: params.brief,
    niche: params.niche,
    family,
    uploadedImageUrls: params.uploadedImageUrls,
    imagePlan: params.imagePlan,
  });

  const meta = normalizeMeta(metaRecord, family);
  meta.assets = images.map((image) => ({
    path: image.path,
    kind: "image",
    source:
      image.source === "generated" || image.source === "uploaded" || image.source === "curated"
        ? "generated"
        : "fallback",
    url: image.dataUrl,
    prompt: image.prompt,
  }));

  result = replaceManifest(result, meta);
  for (const image of images) {
    result = upsertFileBlock(result, image.path, image.dataUrl);
  }
  result = upsertFileBlock(
    result,
    "src/assets/generated-images.ts",
    buildGeneratedImagesModule(images)
  );
  result = rewriteProjectFiles(result, family);
  result = applyDesignPass(result, family, params.niche, params.variantPlan);
  result = applyVariantExecutionPlan(result, params.brief, params.niche, params.variantPlan);
  result = injectScaffoldFiles(result);
  result = applyVariantThemePlan(result, family, params.variantPlan);

  return {
    content: result,
    conformance: checkCenateDesignConformance({
      raw: result,
      specId: family,
      niche: params.niche,
      designFamily: family,
      variantPlan: params.variantPlan,
    }),
  };
}

export async function finalizeWebsiteProject(params: {
  raw: string;
  brief: string;
  niche: Niche;
  designFamily?: DesignFamilyId;
  uploadedImageUrls?: string[];
  variantPlan?: WebsiteVariantPlan;
  imagePlan?: ProjectImagePlan;
}): Promise<string> {
  return (await finalizeWebsiteProjectWithConformance(params)).content;
}

export default finalizeWebsiteProject;
