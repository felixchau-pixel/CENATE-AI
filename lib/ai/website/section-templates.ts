/**
 * Niche section templates — real React component code the generator can
 * use as structural starting points.
 *
 * These are NOT injected as files. They are included in the prompt as
 * code reference so the LLM can see exactly how sections should be
 * structured using the pre-injected UI primitives.
 *
 * Each template:
 *  - Imports and uses UI primitives (Section, Container, Heading, Button, etc.)
 *  - Uses cn() from @/lib/utils
 *  - Uses only Tailwind utilities
 *  - Is self-contained (no external deps)
 *
 * The generator should adapt these to the brief's specific content,
 * colors, and copy — not copy them verbatim.
 */

import type { Niche } from "./niche-router";

export type SectionTemplate = {
  name: string;
  role: string;
  code: string;
};

export type NicheTemplateSet = {
  niche: Niche;
  label: string;
  templates: SectionTemplate[];
};

// ─────────────────────────────────────────────
// RESTAURANT TEMPLATES
// ─────────────────────────────────────────────

const RESTAURANT_TEMPLATES: SectionTemplate[] = [
  {
    name: "HeroEditorialDining",
    role: "hero",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";

export default function Hero() {
  return (
    <Section className="min-h-[90vh] flex items-center bg-zinc-950 text-white relative overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=1000&fit=crop&q=80"
              alt="Fine dining atmosphere"
              className="rounded-2xl object-cover w-full aspect-[3/4] lg:aspect-[4/5]"
            />
          </div>
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-medium mb-4">
              Est. 2018 &middot; Michelin Starred
            </p>
            <Heading as="h1" size="display" className="text-white font-serif">
              An Intimate Culinary Journey
            </Heading>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-md">
              Seasonal tasting menus rooted in local terroir and classical technique.
            </p>
            <div className="mt-8 flex gap-4">
              <Button size="lg" className="bg-amber-600 text-white hover:bg-amber-700">
                Reserve a Table
              </Button>
              <Button size="lg" className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800">
                View Menu
              </Button>
            </div>
            <div className="mt-12 flex gap-8 text-sm text-zinc-500">
              <span>Dinner: Tue–Sat</span>
              <span>6:00 PM – 10:00 PM</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ChefStorySplit",
    role: "story",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ChefStory() {
  return (
    <Section className="bg-stone-950 text-white py-24">
      <Container>
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <img
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=800&fit=crop&q=80"
              alt="Chef at work"
              className="rounded-xl object-cover w-full aspect-[3/4]"
            />
            <p className="mt-3 text-xs text-zinc-500 uppercase tracking-widest">
              Chef Marie Laurent &middot; Executive Chef
            </p>
          </div>
          <div className="lg:col-span-3 lg:pt-12">
            <Heading as="h2" size="h2" eyebrow="Our Philosophy" className="text-white font-serif">
              Rooted in Tradition, Driven by Curiosity
            </Heading>
            <p className="mt-6 text-zinc-400 leading-relaxed text-lg max-w-xl">
              Every dish begins with a conversation with our farmers and foragers.
              We believe the best cuisine emerges when technique serves ingredient,
              not the other way around.
            </p>
            <blockquote className="mt-8 border-l-2 border-amber-600 pl-6 text-xl font-serif italic text-zinc-300 max-w-lg">
              "Cooking is listening — to the season, to the soil, to the silence
              before the first course arrives."
            </blockquote>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "MenuFeatureEditorial",
    role: "menu",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const menuItems = [
  { name: "Hamachi Crudo", desc: "Yuzu kosho, finger lime, shiso", price: "24" },
  { name: "Foie Gras Torchon", desc: "Sauternes gelée, brioche, fig compote", price: "32" },
  { name: "Dry-Aged Duck Breast", desc: "Black garlic, turnip, elderberry jus", price: "48" },
  { name: "Wagyu Striploin", desc: "Bone marrow, charred leek, périgueux", price: "72" },
];

export default function MenuHighlights() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container size="lg">
        <Heading as="h2" size="h2" eyebrow="The Menu" className="text-white font-serif mb-12">
          Seasonal Highlights
        </Heading>
        <div className="divide-y divide-zinc-700/50">
          {menuItems.map((item) => (
            <div key={item.name} className="flex items-baseline justify-between py-5 gap-4">
              <div className="flex-1">
                <p className="text-lg font-serif text-zinc-100">{item.name}</p>
                <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
              </div>
              <p className="text-lg text-amber-400 font-medium tabular-nums">\${item.price}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ReservationPanel",
    role: "cta",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function Reservation() {
  return (
    <Section className="bg-stone-950 text-white py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <Heading as="h2" size="h2" className="text-white font-serif">
              Reserve Your Table
            </Heading>
            <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">
              For parties of six or more, please call us directly.
            </p>
            <div className="mt-8 space-y-3 text-sm text-zinc-500">
              <p>Dinner: Tuesday – Saturday, 6:00 PM – 10:00 PM</p>
              <p>Private Dining available for up to 12 guests</p>
              <p>Smart casual attire requested</p>
            </div>
          </div>
          <Card className="bg-zinc-900 border border-zinc-800 p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date" type="date" className="bg-zinc-800 border-zinc-700 text-white" />
                <Input label="Time" type="time" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <Input label="Party Size" type="number" placeholder="2" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
              <Input label="Name" placeholder="Your name" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
              <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
              <Button size="lg" className="w-full bg-amber-600 text-white hover:bg-amber-700 mt-2">
                Request Reservation
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FooterVenue",
    role: "footer",
    code: `import React from "react";
import Container from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 py-16">
      <Container>
        <div className="text-center mb-8">
          <p className="text-2xl font-serif text-white">Restaurant Name</p>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500 mt-2">A Culinary Journey Since 2018</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-sm text-center md:text-left">
          <div>
            <p className="text-white font-medium mb-2">Location</p>
            <p>123 Main Street</p>
            <p>New York, NY 10001</p>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Hours</p>
            <p>Dinner: Tue–Sat 6–10 PM</p>
            <p>Closed Sun & Mon</p>
          </div>
          <div>
            <p className="text-white font-medium mb-2">Reservations</p>
            <p>(212) 555-0100</p>
            <p>reservations@restaurant.com</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-600 text-center">
          <p>&copy; {new Date().getFullYear()} Restaurant Name. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}`,
  },
  {
    name: "PressProofBand",
    role: "proof",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Separator from "@/components/ui/separator";

export default function PressProof() {
  const quotes = [
    { text: "A masterclass in restraint and flavor — every dish tells a story.", source: "The New York Times" },
    { text: "The most exciting opening this city has seen in a decade.", source: "Eater" },
    { text: "An unforgettable dining experience from start to finish.", source: "Bon Appétit" },
  ];
  return (
    <Section className="bg-zinc-950 text-white py-20">
      <Container size="lg">
        <div className="space-y-12">
          {quotes.map((q, i) => (
            <div key={i}>
              <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed text-zinc-200 max-w-3xl">
                "{q.text}"
              </blockquote>
              <p className="mt-4 text-sm uppercase tracking-widest text-zinc-500">{q.source}</p>
              {i < quotes.length - 1 && <Separator className="mt-12 opacity-5" />}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FAQDining",
    role: "faq",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQ() {
  const items = [
    { q: "Do you accommodate dietary restrictions?", a: "Absolutely. Our kitchen prepares dedicated menus for vegetarian, vegan, gluten-free, and allergy-specific needs. Please inform us when booking." },
    { q: "What is the dress code?", a: "We maintain a smart-casual dress code. Jackets are appreciated but not required. We ask that guests refrain from athletic wear and open-toed sandals." },
    { q: "Do you offer private dining?", a: "Yes. Our private dining room seats up to 16 guests and features a bespoke tasting menu crafted by the chef for your event." },
    { q: "How far in advance should I book?", a: "We recommend booking 2-3 weeks in advance for weekday dining and 4-6 weeks for weekends and holidays." },
  ];
  return (
    <Section className="bg-zinc-900 text-white">
      <Container size="md">
        <Heading as="h2" size="h2" eyebrow="Common Questions" className="text-white mb-12">
          Frequently Asked
        </Heading>
        <Accordion type="single" defaultValue="item-0" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={"item-" + i} className="border-zinc-800">
              <AccordionTrigger className="text-left text-white hover:text-zinc-300">{item.q}</AccordionTrigger>
              <AccordionContent className="text-zinc-400">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "GalleryAsymmetric",
    role: "gallery",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Gallery from "@/components/ui/gallery";

export default function GallerySection() {
  const images = [
    { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80", alt: "Dining room interior", span: "wide" as const },
    { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=500&fit=crop&q=80", alt: "Signature dish plating", span: "normal" as const },
    { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=700&fit=crop&q=80", alt: "Bar and lounge area", span: "tall" as const },
    { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&h=500&fit=crop&q=80", alt: "Dessert presentation", span: "normal" as const },
    { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=500&fit=crop&q=80", alt: "Kitchen action", span: "normal" as const },
  ];
  return (
    <Section className="bg-zinc-950 text-white py-20">
      <Container>
        <Heading as="h2" size="h2" eyebrow="The Space" className="text-white font-serif mb-10">
          Atmosphere &amp; Craft
        </Heading>
        <Gallery images={images} />
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TestimonialEditorial",
    role: "testimonial",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Testimonial from "@/components/ui/testimonial";
import Separator from "@/components/ui/separator";

export default function TestimonialSection() {
  const reviews = [
    { quote: "An unforgettable evening — every course told a story of its own.", author: "James W.", role: "via Google Reviews" },
    { quote: "The tasting menu was a revelation. We have already booked our return.", author: "Sarah M.", role: "via OpenTable" },
  ];
  return (
    <Section className="bg-stone-950 text-white py-20">
      <Container size="md">
        <div className="space-y-10">
          {reviews.map((r, i) => (
            <div key={i}>
              <Testimonial quote={r.quote} author={r.author} role={r.role} className="text-zinc-200" />
              {i < reviews.length - 1 && <Separator className="mt-10 opacity-5" />}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "NavbarDining",
    role: "navbar",
    code: `import React from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import MobileNav from "@/components/ui/mobile-nav";

const links = [
  { label: "Menu", href: "#menu" },
  { label: "Story", href: "#story" },
  { label: "Gallery", href: "#gallery" },
  { label: "Press", href: "#press" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/50">
      <Container>
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-lg font-serif text-white">Restaurant Name</a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{l.label}</a>
            ))}
            <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-700">Reserve</Button>
          </nav>
          <MobileNav links={links} brandName="Restaurant Name" ctaLabel="Reserve" ctaHref="#reservation" />
        </div>
      </Container>
    </header>
  );
}`,
  },
  {
    name: "LocationMap",
    role: "location",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Location() {
  return (
    <Section className="bg-zinc-900 text-white py-20">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Heading as="h2" size="h2" eyebrow="Visit Us" className="text-white font-serif">
              Find Your Way
            </Heading>
            <div className="mt-6 space-y-4 text-zinc-400">
              <p className="text-lg text-white">123 Main Street, New York, NY 10001</p>
              <p>Nestled in the heart of the West Village, two blocks from the Christopher Street station.</p>
              <div className="pt-4 space-y-2 text-sm">
                <p>Valet parking available Tuesday through Saturday</p>
                <p>Private entrance on Commerce Street for events</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80"
              alt="Restaurant exterior at night"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "PrivateDining",
    role: "feature",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";

export default function PrivateDining() {
  return (
    <Section className="bg-zinc-950 text-white py-24">
      <Container>
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=600&fit=crop&q=80"
              alt="Private dining room"
              className="rounded-2xl w-full aspect-[3/2] object-cover"
            />
          </div>
          <div className="lg:col-span-2">
            <Heading as="h2" size="h2" eyebrow="Private Events" className="text-white font-serif">
              The Cellar Room
            </Heading>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Our private dining room seats up to 16 guests and features a bespoke tasting menu crafted
              by the chef for your occasion.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-500">
              <li>Seats 8 to 16 guests</li>
              <li>Custom menu consultation included</li>
              <li>Dedicated sommelier service</li>
              <li>AV equipment available</li>
            </ul>
            <Button size="lg" className="mt-8 bg-amber-600 text-white hover:bg-amber-700">
              Inquire About Events
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
];

// ─────────────────────────────────────────────
// CONSTRUCTION TEMPLATES
// ─────────────────────────────────────────────

const CONSTRUCTION_TEMPLATES: SectionTemplate[] = [
  {
    name: "HeroIndustrial",
    role: "hero",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";

export default function Hero() {
  return (
    <Section className="relative min-h-[85vh] flex items-center bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop&q=80"
          alt="Construction project"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>
      <Container className="relative z-10">
        <div className="max-w-2xl">
          <Heading as="h1" size="display" className="text-white font-bold">
            Built to Last
          </Heading>
          <p className="mt-6 text-lg text-zinc-300 max-w-xl leading-relaxed">
            Premier general contractor serving the tri-state area for over 27 years.
            Residential, commercial, and renovation.
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold">
              Request Free Estimate
            </Button>
          </div>
        </div>
      </Container>
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-sm border-t border-zinc-700/50">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm">
            <span className="text-zinc-400">License #CC-2847561</span>
            <span className="text-amber-400 font-medium">27+ Years Experience</span>
            <span className="text-zinc-400">Fully Insured & Bonded</span>
            <span className="text-zinc-400">BBB A+ Rated</span>
          </div>
        </Container>
      </div>
    </Section>
  );
}`,
  },
  {
    name: "CapabilityGridIndustrial",
    role: "services",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Card from "@/components/ui/card";

const services = [
  {
    title: "Residential",
    desc: "Custom homes, additions, full renovations. From foundation to finish.",
    items: ["Custom Builds", "Home Additions", "Kitchen & Bath"],
    featured: true,
  },
  {
    title: "Commercial",
    desc: "Office build-outs, retail spaces, warehouse construction.",
    items: ["Office Interiors", "Retail Spaces", "Warehouses"],
    featured: false,
  },
  {
    title: "Renovation",
    desc: "Historic restoration, structural repair, modernization projects.",
    items: ["Historic Restoration", "Structural Repair", "Modernization"],
    featured: false,
  },
];

export default function Services() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Our Services" className="text-white mb-12">
          What We Build
        </Heading>
        <div className="grid lg:grid-cols-5 gap-6">
          <Card className={\`lg:col-span-3 bg-zinc-800 border border-zinc-700 p-8\`}>
            <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-3">{services[0].title}</p>
            <p className="text-xl font-semibold text-white mb-3">{services[0].desc}</p>
            <ul className="space-y-2 text-zinc-400 text-sm">
              {services[0].items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <div className="lg:col-span-2 space-y-6">
            {services.slice(1).map((s) => (
              <Card key={s.title} className="bg-zinc-800 border border-zinc-700 p-6">
                <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-2">{s.title}</p>
                <p className="text-sm text-zinc-300 mb-2">{s.desc}</p>
                <ul className="space-y-1 text-zinc-400 text-xs">
                  {s.items.map((item) => (
                    <li key={item}>&bull; {item}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TrustMetricsBand",
    role: "proof",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";

const metrics = [
  { value: "27+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "$50M+", label: "Total Value Built" },
  { value: "100%", label: "Licensed & Insured" },
];

export default function Credentials() {
  return (
    <Section className="bg-zinc-950 text-white py-16">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-4xl md:text-5xl font-bold text-amber-400">{m.value}</p>
              <p className="text-sm text-zinc-500 mt-2 uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "InquiryPanel",
    role: "cta",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

export default function EstimateForm() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <Heading as="h2" size="h2" className="text-white">
              Request a Free Estimate
            </Heading>
            <p className="mt-4 text-zinc-400 max-w-md">
              Tell us about your project and we will get back to you within 24 hours.
            </p>
            <div className="mt-8 space-y-4 text-zinc-300">
              <p className="text-2xl font-bold">(555) 123-4567</p>
              <p className="text-sm text-zinc-500">Mon–Fri 7 AM – 5 PM</p>
              <p className="text-sm text-zinc-500">Serving the tri-state area</p>
            </div>
          </div>
          <Card className="bg-zinc-800 border border-zinc-700 p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input label="Name" placeholder="Your name" className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Input label="Phone" type="tel" placeholder="(555) 000-0000" className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Input label="Email" type="email" placeholder="you@email.com" className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Textarea label="Project Description" placeholder="Describe your project, scope, and timeline..." className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Button size="lg" className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold">
                Submit Request
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FooterIndustrial",
    role: "footer",
    code: `import React from "react";
import Container from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800 py-16">
      <Container>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-xl font-bold text-white">Company Name</p>
            <p className="text-sm mt-2">General Contractor &middot; Est. 1997</p>
            <p className="text-xs text-zinc-600 mt-4">License #CC-2847561 &middot; Fully Insured & Bonded</p>
          </div>
          <div className="text-sm space-y-2 md:text-right">
            <p className="text-white font-medium">123 Industrial Blvd, Suite 100</p>
            <p>Mon–Fri 7:00 AM – 5:00 PM</p>
            <p>(555) 123-4567</p>
            <p>info@company.com</p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-zinc-800 text-xs text-zinc-600 text-center">
          &copy; {new Date().getFullYear()} Company Name Construction. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}`,
  },
  {
    name: "ProjectShowcaseMosaic",
    role: "showcase",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function ProjectShowcase() {
  const projects = [
    { title: "Harbor District Tower", category: "Commercial", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop&q=80", sqft: "45,000", value: "$12M" },
    { title: "Westfield Residence", category: "Residential", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=500&fit=crop&q=80", sqft: "8,200", value: "$2.4M" },
    { title: "Central Park Medical", category: "Healthcare", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=500&fit=crop&q=80", sqft: "22,000", value: "$7.8M" },
    { title: "Riverside Commerce Hub", category: "Mixed-Use", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80", sqft: "60,000", value: "$18M" },
  ];
  return (
    <Section className="bg-zinc-900 text-white">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Our Work" className="text-white mb-12">
          Featured Projects
        </Heading>
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <div key={i} className={i === 0 || i === 3 ? "md:col-span-2 md:row-span-1" : ""}>
              <div className="group relative overflow-hidden rounded-xl aspect-[16/9]">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs uppercase tracking-widest text-amber-400 mb-1">{p.category}</p>
                  <p className="text-xl font-semibold text-white">{p.title}</p>
                  <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                    <span>{p.sqft} sq ft</span>
                    <span>{p.value}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TestimonialConstruction",
    role: "testimonial",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Testimonial from "@/components/ui/testimonial";

export default function TestimonialSection() {
  const reviews = [
    { quote: "They finished our home addition two weeks ahead of schedule and under budget. The crew was professional every single day.", author: "Mark & Lisa R.", role: "Residential Client, 2024" },
    { quote: "Our office build-out was handled with zero downtime to our business. Exceptional project management.", author: "David Chen", role: "CEO, Meridian Tech" },
  ];
  return (
    <Section className="bg-zinc-800 text-white py-24">
      <Container size="lg">
        <Heading as="h2" size="h2" eyebrow="Client Testimonials" className="text-white mb-12">
          What Our Clients Say
        </Heading>
        <div className="grid md:grid-cols-2 gap-12">
          {reviews.map((r, i) => (
            <Testimonial key={i} quote={r.quote} author={r.author} role={r.role} className="text-zinc-200" />
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "NavbarConstruction",
    role: "navbar",
    code: `import React from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import MobileNav from "@/components/ui/mobile-nav";

const links = [
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/50">
      <Container>
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-lg font-bold text-white">Company Name</a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{l.label}</a>
            ))}
            <Button size="sm" className="bg-amber-500 text-zinc-950 hover:bg-amber-400 font-semibold">Free Estimate</Button>
          </nav>
          <MobileNav links={links} brandName="Company Name" ctaLabel="Free Estimate" ctaHref="#contact" />
        </div>
      </Container>
    </header>
  );
}`,
  },
  {
    name: "ProcessTimelineConstruction",
    role: "process",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const steps = [
  { num: "01", title: "Consultation", desc: "Free on-site assessment. We review scope, constraints, and budget." },
  { num: "02", title: "Design & Permits", desc: "Architectural plans, engineering review, and all municipal permits handled." },
  { num: "03", title: "Construction", desc: "Dedicated project manager, weekly progress reports, transparent scheduling." },
  { num: "04", title: "Final Walkthrough", desc: "Punch-list review, quality inspection, warranty documentation." },
];

export default function ProcessTimeline() {
  return (
    <Section className="bg-zinc-950 text-white py-24">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Our Process" className="text-white mb-16">
          How We Work
        </Heading>
        <div className="relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-zinc-700" />
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-lg mb-4 relative z-10">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ServiceAreaMap",
    role: "location",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Badge from "@/components/ui/badge";

const areas = [
  "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island",
  "Westchester", "Nassau County", "Northern New Jersey",
];

export default function ServiceArea() {
  return (
    <Section className="bg-zinc-900 text-white py-20">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Heading as="h2" size="h2" eyebrow="Service Area" className="text-white">
              Where We Build
            </Heading>
            <p className="mt-4 text-zinc-400 max-w-md">
              Serving the greater tri-state area with fully licensed and insured crews.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {areas.map((a) => (
                <Badge key={a} size="lg" className="bg-zinc-800 text-zinc-300 border border-zinc-700">{a}</Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80"
              alt="City skyline construction"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FAQConstruction",
    role: "faq",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQ() {
  const items = [
    { q: "How long does a typical renovation take?", a: "Timelines vary by scope. A kitchen renovation typically takes 6-8 weeks, while a full home addition can take 3-6 months. We provide a detailed schedule during the estimation phase." },
    { q: "Are you licensed and insured?", a: "Yes. We maintain full general contractor licensing, liability insurance, and workers compensation coverage. Our license number and insurance certificates are available upon request." },
    { q: "Do you handle permits?", a: "Absolutely. We manage the entire permitting process including architectural drawings, engineering review, and municipal submissions. This is included in our scope of work." },
    { q: "What is your payment structure?", a: "We typically work with a deposit, followed by milestone-based payments tied to project phases. No final payment is due until you are satisfied with the completed work." },
  ];
  return (
    <Section className="bg-zinc-950 text-white">
      <Container size="md">
        <Heading as="h2" size="h2" eyebrow="Common Questions" className="text-white mb-12">
          Frequently Asked
        </Heading>
        <Accordion type="single" defaultValue="item-0" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={"item-" + i} className="border-zinc-800">
              <AccordionTrigger className="text-left text-white hover:text-zinc-300">{item.q}</AccordionTrigger>
              <AccordionContent className="text-zinc-400">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "AboutConstruction",
    role: "about",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import StatsBand from "@/components/ui/stats-band";

export default function About() {
  return (
    <>
      <Section className="bg-zinc-900 text-white py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Heading as="h2" size="h2" eyebrow="About Us" className="text-white">
                Building Trust Since 1997
              </Heading>
              <p className="mt-6 text-zinc-400 leading-relaxed text-lg max-w-xl">
                Founded by a third-generation tradesman, our company has grown from a two-person crew
                to a full-service general contractor serving residential, commercial, and institutional clients.
              </p>
              <p className="mt-4 text-zinc-400 leading-relaxed max-w-xl">
                We believe that great construction is invisible — when we do our job right, you simply
                enjoy the space without thinking about how it got there.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&h=500&fit=crop&q=80"
                alt="Construction team on site"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>
      <StatsBand
        stats={[
          { value: "27+", label: "Years Experience" },
          { value: "500+", label: "Projects Completed" },
          { value: "$50M+", label: "Total Value Built" },
          { value: "100%", label: "Licensed & Insured" },
        ]}
        className="bg-zinc-950 text-white"
      />
    </>
  );
}`,
  },
];

// ─────────────────────────────────────────────
// AGENCY / PORTFOLIO TEMPLATES
// ─────────────────────────────────────────────

const AGENCY_TEMPLATES: SectionTemplate[] = [
  {
    name: "HeroAuthored",
    role: "hero",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";

export default function Hero() {
  return (
    <Section className="min-h-[90vh] flex items-center bg-zinc-950 text-white">
      <Container>
        <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-medium mb-6">
            Brand &middot; Digital &middot; Campaign &middot; Est. 2015
          </p>
          <Heading as="h1" size="display" className="text-white font-serif leading-[1.05]">
            We design brands that refuse to whisper.
          </Heading>
          <p className="mt-8 text-xl text-zinc-400 max-w-2xl leading-relaxed">
            A creative studio for companies that need to be seen, remembered,
            and chosen.
          </p>
          <div className="mt-10">
            <Button size="lg" className="bg-white text-zinc-950 hover:bg-zinc-200 font-medium">
              See Our Work
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ShowcaseMosaic",
    role: "showcase",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const projects = [
  { title: "Aura Skincare", client: "Aura Beauty", year: "2024", discipline: "Brand Identity", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&q=80", large: true },
  { title: "Meridian Finance", client: "Meridian Group", year: "2023", discipline: "Digital Design", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=500&fit=crop&q=80", large: false },
  { title: "Verdant Hospitality", client: "Verdant Hotels", year: "2024", discipline: "Campaign", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=500&fit=crop&q=80", large: false },
];

export default function SelectedWork() {
  return (
    <Section className="bg-zinc-950 text-white py-24">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Selected Work" className="text-white font-serif mb-16">
          Recent Projects
        </Heading>
        <div className="space-y-16">
          <div className="group cursor-pointer">
            <img src={projects[0].img} alt={projects[0].title} className="rounded-xl w-full aspect-[16/9] object-cover" />
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-xl font-serif text-white">{projects[0].title}</p>
                <p className="text-sm text-zinc-500 mt-1">{projects[0].client} &middot; {projects[0].discipline}</p>
              </div>
              <p className="text-sm text-zinc-600">{projects[0].year}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.slice(1).map((p) => (
              <div key={p.title} className="group cursor-pointer">
                <img src={p.img} alt={p.title} className="rounded-xl w-full aspect-[4/3] object-cover" />
                <div className="mt-3">
                  <p className="text-lg font-serif text-white">{p.title}</p>
                  <p className="text-sm text-zinc-500 mt-1">{p.client} &middot; {p.discipline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "StudioPerspective",
    role: "about",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function StudioPerspective() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container size="lg">
        <Heading as="h2" size="h2" eyebrow="Studio" className="text-white font-serif mb-10">
          How We Think
        </Heading>
        <div className="max-w-3xl">
          <p className="text-lg text-zinc-300 leading-relaxed">
            We start every engagement by understanding what you cannot say yet.
            The gap between where a brand is and where it needs to be is not a
            brief — it is a creative territory.
          </p>
          <blockquote className="mt-8 border-l-2 border-white pl-6 text-2xl font-serif italic text-zinc-200 max-w-2xl">
            "Strategy without craft is a slide deck. Craft without strategy is decoration."
          </blockquote>
          <p className="mt-8 text-lg text-zinc-300 leading-relaxed">
            Our team of 12 works across brand identity, digital product, and campaign
            — always with the constraint that nothing leaves the studio unless it would
            survive on a billboard and in a browser tab.
          </p>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ContactInvitation",
    role: "cta",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

export default function Contact() {
  return (
    <Section className="bg-zinc-950 text-white py-32">
      <Container>
        <Heading as="h2" size="display" className="text-white font-serif max-w-3xl">
          Let's make something worth talking about.
        </Heading>
        <div className="mt-12 flex flex-col md:flex-row gap-8 text-zinc-400">
          <a href="mailto:hello@studio.com" className="text-white underline underline-offset-4 hover:text-zinc-300">hello@studio.com</a>
          <span>New York &middot; London</span>
          <span>Available for Q3 2026</span>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FooterSignature",
    role: "footer",
    code: `import React from "react";
import Container from "@/components/ui/container";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-500 border-t border-zinc-800 py-16">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <p className="text-lg font-serif text-white">Studio Name</p>
            <p className="text-sm mt-2">Brand &middot; Digital &middot; Campaign</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-zinc-800 text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Studio Name. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}`,
  },
  {
    name: "CaseStudySplit",
    role: "case-study",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Badge from "@/components/ui/badge";
import Separator from "@/components/ui/separator";

export default function CaseStudy() {
  const studies = [
    {
      client: "Meridian Capital",
      discipline: "Brand Identity",
      year: "2024",
      description: "A complete visual overhaul for a fintech disruptor — from wordmark to motion system to investor deck. The result: 340% increase in brand recall within their target market.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80",
    },
    {
      client: "Volta Architecture",
      discipline: "Digital Experience",
      year: "2024",
      description: "An editorial portfolio site that treats each project as a story, not a slide. Photography-led with typographic restraint and intentional white space.",
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&q=80",
    },
  ];
  return (
    <Section className="bg-white text-zinc-900">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Selected Work" className="mb-16">
          Case Studies
        </Heading>
        <div className="space-y-24">
          {studies.map((s, i) => (
            <div key={i} className={"grid lg:grid-cols-2 gap-12 items-center" + (i % 2 === 1 ? " lg:direction-rtl" : "")}>
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <img src={s.image} alt={s.client} className="rounded-2xl w-full aspect-[4/3] object-cover" />
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-zinc-100 text-zinc-700">{s.discipline}</Badge>
                  <span className="text-sm text-zinc-400">{s.year}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-4">{s.client}</h3>
                <p className="text-zinc-600 leading-relaxed max-w-lg">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ClientLogoBand",
    role: "proof",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";

const clients = [
  "Meridian Capital", "Volta Architecture", "Aura Beauty",
  "Verdant Hotels", "Carve Studio", "Nomad Health",
];

export default function ClientLogos() {
  return (
    <Section className="bg-zinc-900 text-white py-16 border-y border-zinc-800">
      <Container>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 text-center mb-8">Selected Clients</p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
          {clients.map((c) => (
            <span key={c} className="text-lg font-medium text-zinc-400 hover:text-white transition-colors">{c}</span>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TestimonialAgency",
    role: "testimonial",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Testimonial from "@/components/ui/testimonial";

export default function TestimonialSection() {
  return (
    <Section className="bg-zinc-950 text-white py-24">
      <Container size="md">
        <Testimonial
          quote="They did not just redesign our brand — they gave us a language we did not know we needed. Every touchpoint now feels like it belongs to the same family."
          author="Elena Torres"
          role="CMO, Meridian Capital"
          className="text-zinc-200 text-center"
        />
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "NavbarAgency",
    role: "navbar",
    code: `import React from "react";
import Container from "@/components/ui/container";
import MobileNav from "@/components/ui/mobile-nav";

const links = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-sm">
      <Container>
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-lg font-serif text-white">Studio Name</a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{l.label}</a>
            ))}
          </nav>
          <MobileNav links={links} brandName="Studio Name" />
        </div>
      </Container>
    </header>
  );
}`,
  },
  {
    name: "ServicesAgency",
    role: "services",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Separator from "@/components/ui/separator";

const capabilities = [
  { name: "Brand Identity", scope: "Strategy, visual identity, brand guidelines, naming" },
  { name: "Digital Product", scope: "Web design, product design, design systems, prototyping" },
  { name: "Campaign & Content", scope: "Art direction, photography, motion, social systems" },
];

export default function Services() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container size="lg">
        <Heading as="h2" size="h2" eyebrow="Capabilities" className="text-white font-serif mb-16">
          What We Do
        </Heading>
        <div className="space-y-0">
          {capabilities.map((cap, i) => (
            <div key={cap.name}>
              <div className="flex flex-col md:flex-row md:items-baseline justify-between py-8 gap-4">
                <h3 className="text-2xl font-serif text-white">{cap.name}</h3>
                <p className="text-sm text-zinc-500 md:text-right max-w-sm">{cap.scope}</p>
              </div>
              {i < capabilities.length - 1 && <Separator className="opacity-10" />}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FAQAgency",
    role: "faq",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQ() {
  const items = [
    { q: "What is your typical engagement timeline?", a: "Brand identity projects run 8-12 weeks. Digital products run 10-16 weeks. We scope each project individually during our discovery phase." },
    { q: "Do you work with startups?", a: "Yes. We work with companies at every stage — from pre-launch startups to established enterprises. What matters is ambition, not size." },
    { q: "How do you price projects?", a: "We work on a project-fee basis, not hourly. After a discovery call, we provide a fixed scope and fee. No surprises." },
    { q: "Can we start with a smaller engagement?", a: "Absolutely. A brand audit or design sprint is a great way to test the fit before committing to a full engagement." },
  ];
  return (
    <Section className="bg-zinc-950 text-white">
      <Container size="md">
        <Heading as="h2" size="h2" className="text-white font-serif mb-12">
          Common Questions
        </Heading>
        <Accordion type="single" defaultValue="item-0" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={"item-" + i} className="border-zinc-800">
              <AccordionTrigger className="text-left text-white hover:text-zinc-300">{item.q}</AccordionTrigger>
              <AccordionContent className="text-zinc-400">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TeamAgency",
    role: "about",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const team = [
  { name: "Alex Rivera", role: "Founder & Creative Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80" },
  { name: "Sam Chen", role: "Design Director", img: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&q=80" },
  { name: "Jordan Lee", role: "Strategy Lead", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80" },
];

export default function Team() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container>
        <Heading as="h2" size="h2" eyebrow="The Team" className="text-white font-serif mb-16">
          Who We Are
        </Heading>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((m) => (
            <div key={m.name}>
              <img src={m.img} alt={m.name} className="rounded-xl w-full aspect-[3/4] object-cover mb-4" />
              <p className="text-lg font-serif text-white">{m.name}</p>
              <p className="text-sm text-zinc-500 mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
];

// ─────────────────────────────────────────────
// SAAS TEMPLATES
// ─────────────────────────────────────────────

const SAAS_TEMPLATES: SectionTemplate[] = [
  {
    name: "HeroProductDemo",
    role: "hero",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";

export default function Hero() {
  return (
    <Section className="min-h-[90vh] flex items-center bg-[#0a0a0a] text-white overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <Heading as="h1" size="display" className="text-white">
              Ship faster with less noise.
            </Heading>
            <p className="mt-6 text-lg text-zinc-400 max-w-md leading-relaxed">
              The workflow platform that replaces your standup, your board,
              and your status spreadsheet.
            </p>
            <div className="mt-8 flex gap-4 items-center">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Start Free Trial
              </Button>
              <span className="text-sm text-zinc-500">No credit card required</span>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-zinc-500">
              <span>10,000+ teams</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>99.99% uptime</span>
            </div>
          </div>
          <div className="relative">
            <div className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <div className="flex-1 mx-4 h-5 rounded bg-zinc-700" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-40 h-64 bg-zinc-800 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-zinc-800 rounded-lg w-3/4" />
                    <div className="h-24 bg-zinc-800 rounded-lg" />
                    <div className="h-32 bg-zinc-800 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "WorkflowShowcase",
    role: "features",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const capabilities = [
  { title: "Automated Workflows", desc: "Define triggers and actions that run without intervention. Replace manual status updates.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { title: "Real-Time Sync", desc: "Every change propagates instantly. No refresh, no stale data, no merge conflicts.", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { title: "Deep Integrations", desc: "Connect to GitHub, Slack, Linear, and 500+ tools. Data flows where it needs to.", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" },
];

export default function Capabilities() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container>
        <Heading as="h2" size="h2" eyebrow="Capabilities" className="text-white mb-16">
          Everything your team needs to move fast
        </Heading>
        <div className="space-y-0 divide-y divide-zinc-700/50">
          {capabilities.map((cap) => (
            <div key={cap.title} className="flex items-start gap-6 py-8">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={cap.icon} />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{cap.title}</p>
                <p className="text-zinc-400 mt-1 max-w-lg">{cap.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "ProofBand",
    role: "proof",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";

const metrics = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "50ms", label: "Avg Response" },
  { value: "10K+", label: "Teams Active" },
  { value: "SOC 2", label: "Certified" },
];

export default function Metrics() {
  return (
    <Section className="bg-[#0a0a0a] text-white py-16 border-y border-zinc-800">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-4xl md:text-5xl font-bold text-blue-400">{m.value}</p>
              <p className="text-sm text-zinc-500 mt-2">{m.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "PricingPanel",
    role: "pricing",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";

const tiers = [
  { name: "Essentials", price: "29", features: ["Up to 10 users", "5 projects", "Basic integrations", "Email support"], highlight: false },
  { name: "Pro", price: "79", features: ["Unlimited users", "Unlimited projects", "All integrations", "Priority support", "Custom workflows", "Advanced analytics"], highlight: true },
];

export default function Pricing() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container size="lg">
        <div className="text-center mb-16">
          <Heading as="h2" size="h2" className="text-white">
            Simple, transparent pricing
          </Heading>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">Start free. Scale when you are ready.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {tiers.map((tier) => (
            <div key={tier.name} className={\`rounded-2xl p-8 \${tier.highlight ? "bg-blue-600/10 border-2 border-blue-500/40 ring-1 ring-blue-500/20" : "bg-zinc-800 border border-zinc-700"}\`}>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-lg font-semibold text-white">{tier.name}</p>
                {tier.highlight && <Badge className="bg-blue-500/20 text-blue-300">Popular</Badge>}
              </div>
              <p className="text-4xl font-bold text-white">\${tier.price}<span className="text-lg font-normal text-zinc-500">/mo</span></p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button size="lg" className={\`w-full mt-8 \${tier.highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-zinc-700 text-white hover:bg-zinc-600"}\`}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-zinc-500 text-sm">Need enterprise? <a href="#contact" className="text-blue-400 underline underline-offset-2">Contact sales</a></p>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FooterProduct",
    role: "footer",
    code: `import React from "react";
import Container from "@/components/ui/container";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-zinc-400 border-t border-zinc-800 py-16">
      <Container>
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <p className="text-lg font-semibold text-white">ProductName</p>
            <p className="text-sm mt-2 max-w-xs">Built for teams that ship. The workflow platform that replaces noise with signal.</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400">All systems operational</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-white font-medium mb-1">Product</p>
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <div>
            <p className="text-white font-medium mb-3">Product updates</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="your@email.com" type="email" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 text-sm flex-1" />
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-zinc-800 text-xs text-zinc-600 text-center">
          &copy; {new Date().getFullYear()} ProductName Inc. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}`,
  },
  {
    name: "FAQProduct",
    role: "faq",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function FAQ() {
  const items = [
    { q: "How does the free trial work?", a: "Start with 14 days of full access. No credit card required. When your trial ends, choose a plan that fits your team or continue on the free tier with limited features." },
    { q: "Can I switch plans later?", a: "Yes. Upgrade, downgrade, or cancel anytime. Changes take effect at the start of your next billing cycle. No lock-in contracts." },
    { q: "Is my data secure?", a: "We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party audits. Your data is yours — we never sell or share it." },
    { q: "Do you offer team pricing?", a: "Teams of 5+ get volume discounts. Contact our sales team for a custom quote tailored to your organization." },
    { q: "What integrations do you support?", a: "We integrate with Slack, GitHub, Jira, Linear, Notion, and 50+ other tools. Our API is open for custom integrations." },
  ];
  return (
    <Section className="bg-white text-zinc-900">
      <Container size="md">
        <div className="text-center mb-12">
          <Heading as="h2" size="h2" eyebrow="FAQ">
            Common Questions
          </Heading>
        </div>
        <Accordion type="single" defaultValue="item-0" className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={"item-" + i} className="border-zinc-200">
              <AccordionTrigger className="text-left text-zinc-900 hover:text-zinc-600">{item.q}</AccordionTrigger>
              <AccordionContent className="text-zinc-600">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "PricingWithTabs",
    role: "pricing",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Pricing() {
  const plans = [
    { name: "Starter", monthly: 19, annual: 15, features: ["5 projects", "10GB storage", "Basic analytics", "Email support"], cta: "Start Free Trial" },
    { name: "Pro", monthly: 49, annual: 39, features: ["Unlimited projects", "100GB storage", "Advanced analytics", "Priority support", "API access", "Team collaboration"], highlight: true, cta: "Start Free Trial" },
    { name: "Enterprise", monthly: 99, annual: 79, features: ["Everything in Pro", "Unlimited storage", "Custom integrations", "Dedicated account manager", "SLA guarantee", "SSO / SAML"], cta: "Contact Sales" },
  ];
  return (
    <Section className="bg-zinc-50 text-zinc-900">
      <Container size="lg">
        <div className="text-center mb-12">
          <Heading as="h2" size="h2" eyebrow="Pricing">
            Plans for every stage
          </Heading>
          <p className="mt-4 text-zinc-500 max-w-lg mx-auto">Start free. Scale when you are ready. No hidden fees.</p>
        </div>
        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="bg-zinc-200/60">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-white">Monthly</TabsTrigger>
              <TabsTrigger value="annual" className="data-[state=active]:bg-white">
                Annual <Badge size="sm" className="ml-2 bg-green-100 text-green-700">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          {["monthly", "annual"].map((period) => (
            <TabsContent key={period} value={period}>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.name} className={"bg-white border " + (plan.highlight ? "border-blue-500 ring-1 ring-blue-500 relative" : "border-zinc-200")}>
                    {plan.highlight && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">Most Popular</Badge>}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{period === "monthly" ? plan.monthly : plan.annual}</span>
                        <span className="text-zinc-500 text-sm">/mo</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-zinc-600">
                          <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className={"w-full " + (plan.highlight ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-zinc-900 text-white hover:bg-zinc-800")}>{plan.cta}</Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "TestimonialSaaS",
    role: "testimonial",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Testimonial from "@/components/ui/testimonial";
import Separator from "@/components/ui/separator";

export default function TestimonialSection() {
  const reviews = [
    { quote: "We cut our standup time by 70% in the first week. The team actually ships now instead of reporting.", author: "Sarah Kim", role: "VP Engineering, TechCorp", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&q=80" },
    { quote: "Finally a tool that understands how engineering teams actually work. No more context-switching between five apps.", author: "Marcus Rodriguez", role: "CTO, ScaleUp", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" },
  ];
  return (
    <Section className="bg-[#0a0a0a] text-white py-24">
      <Container size="lg">
        <Heading as="h2" size="h2" eyebrow="Testimonials" className="text-white mb-16">
          Loved by engineering teams
        </Heading>
        <div className="space-y-12">
          {reviews.map((r, i) => (
            <div key={i}>
              <Testimonial quote={r.quote} author={r.author} role={r.role} avatar={r.avatar} className="text-zinc-200 max-w-2xl" />
              {i < reviews.length - 1 && <Separator className="mt-12 opacity-5" />}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "NavbarSaaS",
    role: "navbar",
    code: `import React from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import MobileNav from "@/components/ui/mobile-nav";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-zinc-800/50">
      <Container>
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-lg font-semibold text-white">ProductName</a>
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{l.label}</a>
            ))}
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Start Free Trial</Button>
          </nav>
          <MobileNav links={links} brandName="ProductName" ctaLabel="Start Free Trial" ctaHref="#pricing" />
        </div>
      </Container>
    </header>
  );
}`,
  },
  {
    name: "IntegrationBand",
    role: "integrations",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";

const integrations = [
  { name: "GitHub", desc: "Auto-sync PRs and commits" },
  { name: "Slack", desc: "Real-time notifications" },
  { name: "Linear", desc: "Two-way issue sync" },
  { name: "Jira", desc: "Import and export" },
  { name: "Notion", desc: "Embedded docs" },
  { name: "Figma", desc: "Design handoff" },
];

export default function Integrations() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container>
        <div className="text-center mb-16">
          <Heading as="h2" size="h2" className="text-white">
            Connects to your stack
          </Heading>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">Plug into the tools your team already uses. No migration required.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {integrations.map((int) => (
            <div key={int.name} className="rounded-xl bg-zinc-800 border border-zinc-700 p-6 hover:border-zinc-600 transition-colors">
              <p className="font-semibold text-white">{int.name}</p>
              <p className="text-sm text-zinc-500 mt-1">{int.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "CTASaaS",
    role: "cta",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

export default function CTA() {
  return (
    <Section className="bg-zinc-900 text-white py-24">
      <Container size="lg">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Heading as="h2" size="h2" className="text-white">
              Ready to ship faster?
            </Heading>
            <p className="mt-4 text-zinc-400 max-w-md">
              Join 10,000+ teams already using ProductName. Free 14-day trial, no credit card required.
            </p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <Input label="Work email" type="email" placeholder="you@company.com" className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Input label="Team size" type="number" placeholder="e.g. 10" className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400" />
              <Button size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700">Start Free Trial</Button>
              <p className="text-xs text-zinc-500 text-center">No credit card required</p>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
  {
    name: "FeatureDetailSaaS",
    role: "feature-detail",
    code: `import React from "react";
import Section from "@/components/ui/section";
import Container from "@/components/ui/container";
import Heading from "@/components/ui/heading";
import Badge from "@/components/ui/badge";

export default function FeatureDetail() {
  return (
    <Section className="bg-[#0a0a0a] text-white py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">New</Badge>
            <Heading as="h2" size="h2" className="text-white">
              AI-powered workflow automation
            </Heading>
            <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">
              Define triggers and let the system route, assign, and update tasks automatically.
              Your team focuses on building — the busywork handles itself.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Automatic status transitions based on PR merges
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Smart assignment based on team capacity
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Custom webhook triggers for any event
              </li>
            </ul>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-zinc-300">PR #847 merged → task auto-closed</span>
                <span className="text-xs text-zinc-600 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-zinc-300">Sprint review → auto-assigned to QA</span>
                <span className="text-xs text-zinc-600 ml-auto">15m ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm text-zinc-300">Blocker detected → team notified</span>
                <span className="text-xs text-zinc-600 ml-auto">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}`,
  },
];

// ─────────────────────────────────────────────
// TEMPLATE MAP + PUBLIC API
// ─────────────────────────────────────────────

const TEMPLATE_SETS: Partial<Record<Niche, NicheTemplateSet>> = {
  restaurant: { niche: "restaurant", label: "Restaurant / Fine Dining", templates: RESTAURANT_TEMPLATES },
  construction: { niche: "construction", label: "Construction / Contractor", templates: CONSTRUCTION_TEMPLATES },
  agency: { niche: "agency", label: "Creative Agency / Studio", templates: AGENCY_TEMPLATES },
  portfolio: { niche: "portfolio", label: "Creative Portfolio", templates: AGENCY_TEMPLATES },
  saas: { niche: "saas", label: "SaaS / Product", templates: SAAS_TEMPLATES },
};

/**
 * Get the template set for a niche. Returns null for unsupported niches.
 */
export function getTemplateSet(niche: Niche): NicheTemplateSet | null {
  return TEMPLATE_SETS[niche] ?? null;
}

/**
 * Render a template set as a prompt-ready block with actual component code.
 */
export function renderTemplateSetPrompt(set: NicheTemplateSet): string {
  const templateBlocks = set.templates.map((t) =>
    `--- TEMPLATE: ${t.name} (${t.role}) ---
${t.code}
--- END TEMPLATE ---`
  ).join("\n\n");

  return `=== SECTION TEMPLATES: ${set.label.toUpperCase()} ===

These are real, working section components for this niche. Use them as structural starting points.
Adapt content, colors, and copy to the brief — do NOT copy them verbatim. But DO preserve:
- The import pattern (importing from @/components/ui/)
- The composition structure (Section > Container > content)
- The primitive usage (Button, Input, Card, Heading, Badge, Section, Container, Accordion, Tabs, Separator)

${templateBlocks}

=== END SECTION TEMPLATES ===`;
}
