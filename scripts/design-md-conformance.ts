import { checkCenateDesignConformance, renderDesignConformanceReport, type CenateDesignSpecId } from "../lib/design-md/cenate";
import type { Niche } from "../lib/ai/website/niche-router";
import { readFileSync } from "node:fs";
import path from "node:path";

type CliArgs = {
  specId: CenateDesignSpecId;
  niche: Niche;
  inputPath?: string;
};

function parseArgs(argv: string[]): CliArgs {
  let specId: CenateDesignSpecId = "modern_minimal";
  let niche: Niche = "saas";
  let inputPath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--spec" && argv[i + 1]) {
      specId = argv[i + 1] as CenateDesignSpecId;
      i += 1;
      continue;
    }
    if (arg === "--niche" && argv[i + 1]) {
      niche = argv[i + 1] as Niche;
      i += 1;
      continue;
    }
    if (arg === "--input" && argv[i + 1]) {
      inputPath = path.resolve(argv[i + 1]);
      i += 1;
    }
  }

  return { specId, niche, inputPath };
}

function buildPassFixture(): string {
  return `===PROJECT_MANIFEST===
{
  "type": "project",
  "framework": "vite-react-ts",
  "title": "Pass Fixture",
  "entryFile": "src/main.tsx",
  "previewEntryFile": "src/App.tsx",
  "siteType": "saas",
  "designFamily": "modern_minimal",
  "designDirection": "Crisp modern minimal product surface",
  "colorStrategy": "light canvas with blue primary",
  "typography": "Inter + Inter",
  "sectionOrder": ["Navbar", "Hero", "ProductDemo", "Metrics", "Conversion", "Footer"],
  "assets": []
}
===END_MANIFEST===
===FILE:src/App.tsx===
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductDemo from "@/components/ProductDemo";
import Metrics from "@/components/Metrics";
import Conversion from "@/components/Conversion";
import Footer from "@/components/Footer";

export default function App() {
  return (
    <main role="main" className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <ProductDemo />
      <Metrics />
      <Conversion />
      <Footer />
    </main>
  );
}
===END_FILE===
===FILE:src/components/Navbar.tsx===
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Section } from "@/components/ui/section";

export default function Navbar() {
  return (
    <Section className="border-border bg-background py-4">
      <Container className="flex items-center justify-between">
        <div className="font-heading text-foreground">Orbit</div>
        <MobileNav />
        <Button className="rounded-md bg-primary text-white">Book demo</Button>
      </Container>
    </Section>
  );
}
===END_FILE===
===FILE:src/components/Hero.tsx===
import { projectImages } from "@/assets/generated-images";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export default function Hero() {
  return (
    <Section className="bg-background py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <p className="font-body text-sm uppercase tracking-[0.18em] text-primary">Workflow automation</p>
          <Heading className="font-heading text-5xl text-foreground">Ship operating clarity without noisy dashboards.</Heading>
          <p className="max-w-2xl font-body text-lg text-muted-foreground">Orbit turns fragmented approvals, tasks, and weekly reporting into one calm operating surface.</p>
          <Button className="rounded-md bg-primary text-white">Start trial</Button>
          <ul className="space-y-3 font-body text-sm text-muted-foreground">
            <li>99.99% uptime</li>
            <li>50ms response</li>
            <li>SOC 2 certified</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <img src={projectImages.hero} alt="Orbit product" className="h-full w-full rounded-lg object-cover" />
        </div>
      </Container>
    </Section>
  );
}
===END_FILE===
===FILE:src/components/ProductDemo.tsx===
import { projectImages } from "@/assets/generated-images";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export default function ProductDemo() {
  return (
    <Section className="bg-card py-16">
      <Container className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border bg-background p-6">
          <img src={projectImages.gallery1} alt="Product demo" className="w-full rounded-lg object-cover" />
        </div>
        <div className="space-y-4">
          <Heading className="font-heading text-3xl text-foreground">One workflow, fully annotated.</Heading>
          <p className="font-body text-base text-muted-foreground">Turn reviews, blockers, and approvals into one visible operating rhythm.</p>
        </div>
      </Container>
    </Section>
  );
}
===END_FILE===
===FILE:src/components/Metrics.tsx===
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export default function Metrics() {
  return (
    <Section className="bg-muted py-20">
      <Container className="space-y-6">
        <Heading className="font-heading text-3xl text-foreground">Proof that stays product-grade.</Heading>
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="font-heading text-4xl text-foreground">10k+</p>
            <p className="font-body text-sm text-muted-foreground">teams</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="font-heading text-4xl text-foreground">99.99%</p>
            <p className="font-body text-sm text-muted-foreground">uptime</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="font-heading text-4xl text-foreground">500+</p>
            <p className="font-body text-sm text-muted-foreground">integrations</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-6">
            <p className="font-heading text-4xl text-foreground">SOC 2</p>
            <p className="font-body text-sm text-muted-foreground">certified</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
===END_FILE===
===FILE:src/components/Conversion.tsx===
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/section";

export default function Conversion() {
  return (
    <Section className="bg-background py-24">
      <Container className="grid gap-8 rounded-lg border border-border bg-card p-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Heading className="font-heading text-3xl text-foreground">See your next launch in one operating surface.</Heading>
          <p className="font-body text-base text-muted-foreground">No credit card required. Setup takes three minutes.</p>
          <p className="font-body text-sm text-primary">support@orbit.test</p>
        </div>
        <form className="space-y-4">
          <Input className="rounded-sm" placeholder="Email" />
          <Input className="rounded-sm" placeholder="Company" />
          <Button className="rounded-md bg-primary text-white">Start trial</Button>
        </form>
      </Container>
    </Section>
  );
}
===END_FILE===
===FILE:src/components/Footer.tsx===
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export default function Footer() {
  return (
    <Section className="border-border bg-card py-12">
      <Container className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-heading text-foreground">Orbit</p>
          <p className="font-body text-sm text-muted-foreground">Built for teams that ship.</p>
        </div>
        <div className="space-y-2 font-body text-sm text-muted-foreground">
          <p>support@orbit.test</p>
          <p>+1 415 555 0199</p>
          <Button className="rounded-md bg-primary text-white">Get product updates</Button>
        </div>
      </Container>
    </Section>
  );
}
===END_FILE===`;
}

function buildFailFixture(): string {
  return `===PROJECT_MANIFEST===
{
  "type": "project",
  "framework": "vite-react-ts",
  "title": "Fail Fixture",
  "entryFile": "src/main.tsx",
  "previewEntryFile": "src/App.tsx",
  "siteType": "saas",
  "designFamily": "modern_minimal",
  "designDirection": "minimal product site",
  "colorStrategy": "blue",
  "typography": "Inter",
  "sectionOrder": ["Navbar", "Hero", "Footer", "Conversion"],
  "assets": []
}
===END_MANIFEST===
===FILE:src/App.tsx===
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Conversion from "@/components/Conversion";

export default function App() {
  return (
    <main role="main">
      <Navbar />
      <Hero />
      <Footer />
      <Conversion />
    </main>
  );
}
===END_FILE===
===FILE:src/components/Navbar.tsx===
export default function Navbar() {
  return <div className="bg-white">Nav</div>;
}
===END_FILE===
===FILE:src/components/Hero.tsx===
export default function Hero() {
  return (
    <section className="bg-[#ffffff] py-[37px]">
      <h1 className="text-8xl">Generic product hero</h1>
      <p>Some copy</p>
      <a className="rounded-full bg-blue-500 px-6 py-3 text-white">Start</a>
    </section>
  );
}
===END_FILE===
===FILE:src/components/Conversion.tsx===
export default function Conversion() {
  return (
    <section className="text-center">
      <p className="inline-flex rounded-full border px-4 py-2">CTA</p>
      <h2>Ready?</h2>
      <div>
        <a className="rounded-full bg-blue-500 px-6 py-3 text-white">Try now</a>
        <a className="rounded-full border px-6 py-3">Learn more</a>
      </div>
    </section>
  );
}
===END_FILE===
===FILE:src/components/Footer.tsx===
export default function Footer() {
  return (
    <footer className="grid grid-cols-4 gap-4">
      <a href="/">Product</a>
      <a href="/">Company</a>
      <a href="/">Resources</a>
      <a href="/">Legal</a>
      <a href="/">Docs</a>
      <a href="/">Blog</a>
      <a href="/">Support</a>
      <a href="/">Status</a>
    </footer>
  );
}
===END_FILE===`;
}

function runFixture(label: string, raw: string, specId: CenateDesignSpecId, niche: Niche) {
  const report = checkCenateDesignConformance({ raw, specId, niche });
  console.log(`\n=== ${label.toUpperCase()} ===`);
  console.log(renderDesignConformanceReport(report));
  console.log(JSON.stringify(report, null, 2));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.inputPath) {
    const raw = readFileSync(args.inputPath, "utf8");
    runFixture("input", raw, args.specId, args.niche);
    return;
  }

  runFixture("pass-fixture", buildPassFixture(), "modern_minimal", "saas");
  runFixture("fail-fixture", buildFailFixture(), "modern_minimal", "saas");
}

main();
