/**
 * Niche profiles — consolidated structural / pattern / motion / asset
 * defaults per niche. This is the data layer the niche-aware prompt
 * builder reads to specialize generation for short prompts.
 *
 * Each profile contains:
 *  - tone, palettes, typography pairings (Phase 3 + 5 inputs)
 *  - choreography: required section order (Phase 3)
 *  - patternVocabulary: curated component shapes per slot (Phase 4)
 *  - bannedLayouts: shapes the critic must reject (Phase 6)
 *  - allowedImages / bannedImages: asset planner inputs (Phase 2)
 *  - motion: per-niche polish defaults (Phase 5)
 *
 * The data is intentionally opinionated — short prompts should produce
 * confident, niche-correct sites without further user steering.
 */

import type { Niche } from "./niche-router";

export type MotionProfile = {
  intensity: "minimal" | "restrained" | "moderate" | "expressive";
  heroEntrance: string;
  sectionReveal: string;
  interactionHover: string;
  guidance: string;
};

export type PatternVocabulary = {
  hero: string[];
  showcase: string[];
  proof: string[];
  cta: string[];
  footer: string[];
};

export type LayoutRecipe = {
  name: string;
  description: string;
  sections: string[];
};

export type ImageRole =
  | "hero-focal"
  | "editorial-narrative"
  | "proof-portrait"
  | "ambient-atmosphere"
  | "project-showcase"
  | "product-surface"
  | "team-portrait"
  | "process-documentary"
  | "venue-context";

export type ImageRoleRule = {
  role: ImageRole;
  sectionHint: string;
  compositionRule: string;
  fallbackBehavior: string;
};

export type NicheProfile = {
  niche: Niche;
  label: string;
  tone: string;
  palettes: string[];
  typography: { display: string; body: string };
  choreography: string[];
  ctaStyle: string;
  footerStyle: string;
  proofStyle: string;
  bannedLayouts: string[];
  allowedImages: string[];
  bannedImages: string[];
  motion: MotionProfile;
  patternVocabulary: PatternVocabulary;
  layoutRecipes: LayoutRecipe[];
  imageRoles: ImageRoleRule[];
  shortPromptDefaults: {
    designDirection: string;
    titleHint: string;
  };
};

const motionMinimal: MotionProfile = {
  intensity: "minimal",
  heroEntrance: "static, no entrance animation",
  sectionReveal: "instant on scroll, no fade or slide",
  interactionHover: "color or underline only, no transform",
  guidance:
    "Motion is OFF. The site must feel weighty and editorial. Do not add fade-ins, slide-ups, scroll reveals, or float loops. Hover states are limited to color and underline.",
};

const motionRestrained: MotionProfile = {
  intensity: "restrained",
  heroEntrance: "single fade-up on hero copy with 600ms ease",
  sectionReveal: "single fade-up per section, no stagger chains",
  interactionHover: "subtle color shift + 1px translate on links and CTAs",
  guidance:
    "Motion is restrained. One entrance per section, never stacked. Never use float loops, pulse dots, or gradient mesh animation.",
};

const motionModerate: MotionProfile = {
  intensity: "moderate",
  heroEntrance: "staggered fade-up on hero headline, sub, CTA",
  sectionReveal: "fade-up with 80ms stagger on section primary elements",
  interactionHover: "scale 1.02 + shadow shift on cards, 200ms ease",
  guidance:
    "Motion is moderate. Use stagger sparingly on hero and key reveals. Card hover may scale and shadow. Avoid float loops and pulse rings as primary effects.",
};

const motionExpressive: MotionProfile = {
  intensity: "expressive",
  heroEntrance: "kinetic display headline with split-letter or mask reveal",
  sectionReveal: "directional reveals, asymmetric stagger, parallax media",
  interactionHover: "scale, shadow, image zoom, color shifts",
  guidance:
    "Motion is expressive. Reveal text with kinetic mask or letter staggers, use scroll-driven parallax on hero media, and lean into image hover zooms. Never default to generic float blobs.",
};

export const NICHE_PROFILES: Record<Niche, NicheProfile> = {
  construction: {
    niche: "construction",
    label: "Construction / Contractor",
    tone: "trustworthy, industrial-confident, real-projects-first",
    palettes: [
      "deep slate (#0f172a) bg, steel surface (#1e293b), safety amber (#f59e0b) accent, off-white text",
      "warm concrete (#1c1917) bg, sand surface (#292524), high-vis orange (#ea580c) accent, cream text",
    ],
    typography: {
      display: "Archivo or Bebas Neue or Oswald — condensed industrial sans",
      body: "Inter or IBM Plex Sans",
    },
    choreography: [
      "Hero (project hero photo + license/years credential bar)",
      "ServicesByTrade (residential / commercial / renovation lanes)",
      "ProjectGallery (real builds, before/after or process)",
      "ProcessTimeline (consult → permits → build → handover)",
      "CredentialsBand (license, insurance, years, certifications)",
      "ClientProof (named clients + project quotes)",
      "EstimateRequest (real form: project type, scope, timeline, contact)",
      "Footer (office address, phone, license number, service area)",
    ],
    ctaStyle: "request a real estimate form, not a 'get started' button",
    footerStyle:
      "office address + phone + license number + service area map + hours",
    proofStyle: "named project + named client + dollar value or square footage",
    bannedLayouts: [
      "saas-style hero with gradient mesh",
      "three uniform feature cards with rounded icons",
      "centered eyebrow + heading + two buttons CTA",
      "stock-photo hero with no project context",
      "abstract isometric illustrations",
    ],
    allowedImages: [
      "real construction sites and crews",
      "completed buildings (residential and commercial)",
      "blueprints, hardhats, machinery in context",
      "before/after pairs of renovations",
    ],
    bannedImages: [
      "corporate handshake stock photos",
      "abstract 3d render shapes",
      "smiling office workers at laptops",
      "generic city skylines",
    ],
    motion: motionRestrained,
    patternVocabulary: {
      hero: [
        "full-bleed project photo with diagonal credential strip overlay",
        "split hero: project photo left, license/years/insured rail right",
        "headline over project photo with embedded estimate-request anchor",
      ],
      showcase: [
        "trade lanes (residential / commercial / renovation) with project thumbnails per lane",
        "project index with location, scope, year metadata",
        "before/after slider rail",
        "process timeline with site photos at each stage",
      ],
      proof: [
        "named-client quote band with project name and value",
        "credential strip: license number, years, insurance, certifications",
        "logo wall of past clients (commercial)",
      ],
      cta: [
        "embedded estimate request form with project type / scope / timeline fields",
        "split panel: phone number left, form right",
        "site-visit booking surface with service area map",
      ],
      footer: [
        "office identity: address + phone + license + insurance + service area",
        "trade lanes recap + office identity + hours",
      ],
    },
    layoutRecipes: [
      {
        name: "industrial-split",
        description: "Industrial split hero with framed metrics bar + layered estimate request panel. Dark sectional contrast. Credential strip overlaps hero/services boundary.",
        sections: [
          "Hero: full-bleed project photo with overlapping credential bar (license, years, insured) at bottom edge. Headline left-aligned over darkened photo with condensed display type. Estimate CTA anchored in hero.",
          "ServicesByTrade: three trade lanes (residential / commercial / renovation) as asymmetric cards — one large featured lane spanning 60% width, two stacked secondary lanes. Each lane has a project thumbnail and scope description.",
          "ProjectGallery: asymmetric grid — one large project image (col-span-2) + three smaller project thumbnails. Each with location + year + scope overlay.",
          "ProcessTimeline: horizontal timeline with site photos at each stage. Four stages connected by a ruled line. Photos offset above/below the line alternating.",
          "CredentialsBand: full-bleed dark band with license number, insurance, years, certifications displayed as large typographic elements — not small chips.",
          "ClientProof: named client quote with project photo, project value, and square footage. Single large testimonial, not a grid.",
          "EstimateRequest: split panel — left side: phone number large + office hours + service area text. Right side: real form with project type dropdown, scope textarea, timeline, contact fields.",
          "Footer: office address + phone + license number + service area + hours. Two-column layout with brand mark left and contact right.",
        ],
      },
      {
        name: "dark-sectional",
        description: "Dark sectional composition with alternating image blocks and service grid accents. Strong contrast between dark and light sections creates visual rhythm.",
        sections: [
          "Hero: split — project photo left (60%), dark credential panel right with company name, tagline, years in business, and primary CTA. Credential panel has subtle border and industrial texture.",
          "ServicesByTrade: light-surface section. Services listed as an editorial directory — each trade is a row with icon left, description center, project count right. Ruled dividers between rows.",
          "ProjectGallery: dark section. Before/after comparison pairs — each pair is a horizontal split showing transformation. Three pairs stacked vertically with project metadata between.",
          "CredentialsBand: amber/orange accent band spanning full width. Large credential numbers (years, projects, sqft) as display type with labels beneath.",
          "ClientProof: light section. Large pull-quote from named client with project name and value. Photo of completed project alongside.",
          "EstimateRequest: dark section with inset bordered form panel. Form fields: project type, budget range, timeline, contact. Split with phone/email contact card left.",
          "Footer: deep dark surface. Office identity with address, license, insurance, hours. Service area text. Brand mark and phone number prominent.",
        ],
      },
      {
        name: "project-led",
        description: "Project-led vertical composition with trust badges and process surface. Hero leads with the strongest project, rest of page builds credibility.",
        sections: [
          "Hero: full-bleed completed project photo with project name, location, and scope as overlay. Company name and credential bar pinned at top of hero.",
          "FeaturedProject: deep-dive into one signature project. Large media (3-4 photos in asymmetric layout) + project narrative + metrics (value, sqft, timeline, team size).",
          "ServicesByTrade: compact — three trade columns with bullet descriptions and starting-at pricing.",
          "ProcessTimeline: vertical timeline down the left margin with stage descriptions right-aligned. Each stage has a small site photo. Lines connect stages.",
          "CredentialsBand: horizontal scroll of trust badges — license, insurance, BBB, industry certifications — as logo-sized marks.",
          "EstimateRequest: full-width form surface with dark bg. Headline: 'Start Your Project'. Form: type, scope, budget, timeline, contact.",
          "Footer: compact footer — address, phone, license, hours in a single dense band.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Full-bleed or 60%+ width project photo. Must show a real build — active site or completed structure. Never stock office or handshake.", fallbackBehavior: "Use a completed residential build exterior at golden hour." },
      { role: "project-showcase", sectionHint: "ProjectGallery", compositionRule: "Real project photos with location context. Mix exterior and interior. Asymmetric sizes.", fallbackBehavior: "Use varied residential/commercial exterior photos." },
      { role: "process-documentary", sectionHint: "ProcessTimeline", compositionRule: "Site photos at distinct build stages — foundation, framing, finish. Documentary style.", fallbackBehavior: "Use construction-stage photos showing visible progress." },
      { role: "team-portrait", sectionHint: "ClientProof", compositionRule: "Optional — named project photo paired with testimonial. Must show the completed work, not the client.", fallbackBehavior: "Omit image and use typographic-only testimonial." },
    ],
    shortPromptDefaults: {
      designDirection:
        "trustworthy industrial confidence with real project photography, condensed display sans, and credential-first hero",
      titleHint: "Premium contractor / construction firm",
    },
  },

  restaurant: {
    niche: "restaurant",
    label: "Restaurant / Fine Dining",
    tone: "editorial, cinematic, sensory, hospitable",
    palettes: [
      "deep black (#0a0a0a) bg, warm surface (#1a1612), gold accent (#d4af37), warm white (#faf8f5) text",
      "espresso (#1c1410) bg, cream surface (#f8f3ec), brass accent (#b08d5b), ink text",
    ],
    typography: {
      display: "Playfair Display or Cormorant Garamond — high-contrast serif",
      body: "Inter or Lora",
    },
    choreography: [
      "Hero (cinematic split: photo + offset credential / awards column)",
      "ChefStory (portrait + first-person paragraph + signature)",
      "MenuHighlights (editorial ruled list with descriptions and prices)",
      "Gallery (asymmetric multi-column, one large + stacked secondaries)",
      "PressProof (named critic pull-quotes with publication attribution)",
      "ReservationSurface (booking ritual: time slots, dress note, private dining)",
      "Location (address, hours, transit, private events)",
      "VenueFooter (address, hours, reservation line, dress code)",
    ],
    ctaStyle:
      "reservation booking surface with time slots and private dining note, never a centered CTA stripe",
    footerStyle:
      "venue identity: address, hours, reservation phone, dress note, private events",
    proofStyle:
      "named critic pull-quotes from real publications, never avatar testimonial cards",
    bannedLayouts: [
      "menu as 3-card grid",
      "uniform 3-column equal image gallery",
      "avatar testimonial cards",
      "centered CTA stripe with two buttons",
      "utility sitemap footer",
      "centered hero with food photo wallpaper and no credential rail",
    ],
    allowedImages: [
      "plated signature dishes shot top-down or 45deg",
      "chef portraits in kitchen context",
      "dining room interiors at service",
      "wine cellar / bar / pass-through",
      "ingredient close-ups",
    ],
    bannedImages: [
      "stock 'family eating dinner' photos",
      "abstract food gradients",
      "generic restaurant exterior at dusk",
    ],
    motion: motionRestrained,
    patternVocabulary: {
      hero: [
        "split: signature dish left, awards / Michelin / years / chef name rail right",
        "layered editorial: full-bleed dining room with offset typographic plate",
        "tasting menu typographic hero with media inset",
      ],
      showcase: [
        "editorial menu list (name + description + price on ruled lines)",
        "narrative tasting menu in numbered courses",
        "asymmetric gallery 8/4 split",
      ],
      proof: [
        "named critic pull-quote with publication wordmark",
        "press wall (publication wordmarks + quote excerpts)",
        "awards strip (Michelin, James Beard, World's 50 Best)",
      ],
      cta: [
        "booking surface with time slot grid",
        "private dining inquiry block with dress code note",
        "reservation phone + OpenTable handoff with hours",
      ],
      footer: [
        "venue identity: address + hours + phone + dress + private events",
        "two-column footer: visit / reserve",
      ],
    },
    layoutRecipes: [
      {
        name: "cinematic-image-led",
        description: "Cinematic image-led hero with layered signature dish callout. Strong food photography drives every section. Gallery progression builds atmosphere.",
        sections: [
          "Hero: full-bleed dining room at service with warm low-key lighting. Overlapping panels: left — signature dish photo cropped with offset frame + Michelin/award badges overlapping the edge. Right — restaurant name in large serif, tagline, reservation CTA. The dish image overlaps the hero boundary into the next section.",
          "ChefStory: split — chef portrait left (tall, cropped tight, in kitchen), first-person philosophy paragraph right with pull-quote in large serif. Chef signature as a graphic element at bottom.",
          "MenuHighlights: dark surface. Editorial ruled list — each dish is a row: name (serif, medium) left, description (body, muted) center, price right. One signature dish breaks the list with a large inset photo + story paragraph.",
          "Gallery: asymmetric — one large dining room photo (col-span-2, tall) left, stack of three smaller images right (ingredient close-up, wine service, pass-through). Images have subtle warm overlay.",
          "PressProof: full-bleed dark band. Single large pull-quote from named critic with publication wordmark. Secondary quotes as smaller text below.",
          "ReservationSurface: warm surface shift. Split — left: time slot grid (lunch/dinner with available times), right: private dining inquiry + dress code note + occasion field.",
          "Location: map or exterior photo + address + hours + transit directions. Minimal, elegant.",
          "VenueFooter: deep dark surface. Address + hours + reservation phone + dress note + private events. Brand mark centered with closing line.",
        ],
      },
      {
        name: "editorial-story-menu",
        description: "Editorial story/menu split with atmospheric gallery progression. The menu is the centerpiece. Chef narrative weaves through.",
        sections: [
          "Hero: layered editorial — full-bleed atmospheric dining room, overlaid with large serif headline displaced to bottom-left, and a small credential rail (est. year, Michelin, seasonal) at top-right. No centered copy.",
          "ChefStory: full-bleed chef portrait with overlapping text panel — philosophy as a first-person paragraph with an editorial pull-quote breaking into the image zone.",
          "TastingMenu: centerpiece section. Numbered courses (1-7) as a vertical editorial list. Each course: number, dish name in display serif, description in body, optional wine pairing in muted text. One course highlighted with a full-width dish photo interrupting the list.",
          "Gallery: cinematic strip — three images in a horizontal rail with parallax-like offset. Images bleed edge-to-edge with thin ruled gaps. Caption text overlays the bottom edge of each image.",
          "PressProof: pull-quotes from two publications with wordmarks. Editorial layout — quotes offset left and right, not centered.",
          "ReservationSurface: inset bordered panel on dark bg. Headline + reservation form (date, time, party size, occasion) + private dining note.",
          "VenueFooter: two-column — left: address + hours + transit. Right: reservation phone + dress ritual + private events note. Brand mark above.",
        ],
      },
      {
        name: "luxury-venue-rhythm",
        description: "Luxury venue rhythm with chef section, tasting/menu surface, reservation surface. Every section has atmosphere. Strong surface shifts create rhythm.",
        sections: [
          "Hero: split — left column: restaurant name in large stacked serif, tagline, awards rail (Michelin, year, cuisine). Right column: signature dish photo in offset frame that overlaps into the hero edge. Dark moody background.",
          "AtmosphereStory: full-bleed dining room interior photo with overlapping text block — a short sensory paragraph about the experience. Text block has a semi-transparent warm surface.",
          "ChefStory: warm surface section. Chef portrait (offset, not centered) + long-form philosophy. Pull-quote in large serif breaks the paragraph.",
          "MenuHighlights: return to dark surface. Editorial ruled menu with three categories (starters, mains, desserts). Each has 3-4 items. Signature dish highlighted with photo.",
          "Gallery: asymmetric 8/4 layout. One large atmospheric image + two stacked detail images (ingredients, plating, wine).",
          "ReservationSurface: warm surface band. Split — booking form left (date, time, party, occasion), venue ritual text right (dress note, private dining, seasonal hours).",
          "VenueFooter: deep surface. Venue identity: address, hours, phone, dress, events. Closing line in serif.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Cinematic dining room at service OR signature dish in editorial frame. Warm low-key lighting. Must establish atmosphere, not just show food.", fallbackBehavior: "Use a dining room interior with warm ambient lighting at service." },
      { role: "editorial-narrative", sectionHint: "ChefStory", compositionRule: "Chef portrait in kitchen context — working, plating, or observing. Tight crop, environmental. Not posed stock portrait.", fallbackBehavior: "Use a chef working at the pass in warm kitchen light." },
      { role: "editorial-narrative", sectionHint: "MenuHighlights", compositionRule: "One signature dish in editorial composition — top-down or 45deg, plated, on dark surface. Must feel art-directed, not casual food photo.", fallbackBehavior: "Use an artfully plated dish on dark surface, top-down." },
      { role: "ambient-atmosphere", sectionHint: "Gallery", compositionRule: "Mix of venue spaces: dining room, bar, wine cellar, ingredient detail. Asymmetric sizes. Consistent warm tone.", fallbackBehavior: "Use dining room + bar + ingredient close-up in warm light." },
      { role: "venue-context", sectionHint: "Location", compositionRule: "Optional exterior or neighborhood context. Evening preferred.", fallbackBehavior: "Omit image — use address and map reference only." },
    ],
    shortPromptDefaults: {
      designDirection:
        "dark editorial luxury with serif display, cinematic food photography, and a venue-first reservation surface",
      titleHint: "Premium restaurant / fine dining venue",
    },
  },

  saas: {
    niche: "saas",
    label: "SaaS / Product",
    tone: "modern technical premium, product-surface-first",
    palettes: [
      "deep ink (#0a0a0a) bg, surface (#111111), electric blue (#3B82F6) accent, white text",
      "near-black (#0b0d12) bg, surface (#161a23), violet (#7c3aed) accent, white text",
    ],
    typography: {
      display: "Inter Display or Geist or General Sans — clean modern precision",
      body: "Inter or Geist Mono",
    },
    choreography: [
      "Hero (product surface visible as primary content, not blurred photo)",
      "ProductTeardown (annotated screenshot or workflow with callouts)",
      "CapabilitiesBand (non-uniform, varied density)",
      "MetricsOrManifesto (typographic non-card section)",
      "ProofBand (logo + long-form quote, distinct from features)",
      "PricingSurface (NOT three uniform cards)",
      "ConversionPanel (split panel with real form, NOT centered CTA)",
      "ProductFooter (brand line + status + non-link element)",
    ],
    ctaStyle:
      "split conversion panel with real form (email + use case) or product-anchored CTA, never centered eyebrow + headline + two buttons",
    footerStyle:
      "brand closing line + status badge + changelog/newsletter, never a four-column link sitemap",
    proofStyle:
      "long-form editorial quote band with logo wall, distinct from feature cards",
    bannedLayouts: [
      "pricing as three uniform md:grid-cols-3 cards",
      "centered CTA with eyebrow + headline + two buttons",
      "four-column link-only footer sitemap",
      "hero right column as photo inside blurred gradient card with pulse dot",
      "gradient mesh + floating blobs as primary hero visual",
      "repeating bg-surface/30 backdrop-blur card shells across sections",
      "repeating eyebrow pills in inline-flex rounded-full on every section",
    ],
    allowedImages: [
      "real product UI screenshots (mocked, high-detail)",
      "annotated product screens with callouts",
      "team / workspace context photos (sparingly)",
    ],
    bannedImages: [
      "generic 'business person at laptop' stock photos",
      "abstract gradient blobs as hero media",
      "isometric illustrations as primary hero",
    ],
    motion: motionModerate,
    patternVocabulary: {
      hero: [
        "edge-bleeding product window with visible chrome and controls",
        "equal-weight split: copy left, real product surface right",
        "inset product window with annotated callouts",
        "full-bleed product band with copy overlay below",
      ],
      showcase: [
        "annotated teardown of one workflow step-by-step",
        "metrics rail (4-6 numbers with labels)",
        "typographic manifesto band (no cards)",
        "asymmetric capability blocks (varying spans)",
      ],
      proof: [
        "long-form editorial quote with portrait + role + logo",
        "logo wall + single anchor quote",
        "case study row (logo + metric + quote)",
      ],
      cta: [
        "split panel: copy left, real signup form right",
        "inset bordered band with left-aligned copy and inline form",
        "product-anchored CTA: product preview + flanking conversion",
      ],
      footer: [
        "brand line + status badge + changelog link + newsletter",
        "two-column footer: brand identity / minimal product links + status",
      ],
    },
    layoutRecipes: [
      {
        name: "product-frame-hero",
        description: "Product-frame hero with UI demo surface and credibility rail. Product is the star. Every section reinforces product reality.",
        sections: [
          "Hero: dark bg. Left column (45%): headline in display sans, one-line sub, single primary CTA, credibility rail (logo strip or '10k+ teams'). Right column (55%): edge-bleeding product window with visible browser chrome, toolbar, and real UI content. The product window overlaps the hero boundary slightly.",
          "ProductTeardown: full-width annotated screenshot of one workflow. 4-5 callout labels pointing to specific UI elements, each with a one-line description. Dark surface, subtle grid lines in bg.",
          "CapabilitiesBand: NOT a card grid. Three capability rows — each is a horizontal band with: icon-mark left, capability name in bold, description in muted body, and a small product detail screenshot right. Alternating subtle bg shifts.",
          "MetricsRail: full-bleed dark accent band. 4-5 large metric numbers (users, uptime, integrations, response time) in display type with labels. Horizontal layout.",
          "ProofBand: warm surface shift. Single large quote — portrait left, long-form quote center, company logo + role right. NOT the same card shell as capabilities.",
          "PricingSurface: NOT three equal cards. Two-tier comparison: left column = essentials (compact), right column = pro (expanded, highlighted with accent border). Feature comparison rows beneath. Or: single plan hero with monthly/annual toggle.",
          "ConversionPanel: split — left: copy (headline, 2-line pitch, trust signal), right: real signup form (email, company, use case dropdown, submit). Bordered inset panel, NOT centered.",
          "ProductFooter: brand closing line (serif, confident), minimal product links, status badge (green dot + 'All systems operational'), newsletter email field. NOT a four-column sitemap.",
        ],
      },
      {
        name: "workflow-led",
        description: "Workflow-led layout with alternating product sections and proof band. The product workflow drives the page narrative.",
        sections: [
          "Hero: split 50/50. Left: headline + sub + CTA + '3 min setup' trust note. Right: inset product window showing the starting workflow — visible chrome, real content. Dark bg with subtle grid texture.",
          "WorkflowStep1: full-width product band. Step label at top. Large annotated product screenshot showing step 1 of workflow. Description text overlaid or adjacent.",
          "WorkflowStep2: reverse layout from step 1. Description left, product screenshot right. Different product view than step 1.",
          "WorkflowStep3: full-bleed product screenshot with overlay annotation callouts. The workflow's output/result state.",
          "CapabilitiesGrid: asymmetric — two large capability cards (col-span-2) + three small cards. Each has an icon, title, and one-line desc. NOT uniform.",
          "ProofBand: logo wall + single anchor quote beneath. Logo wall is horizontal strip. Quote is long-form with portrait.",
          "PricingSurface: stacked tier ladder. Each tier is a horizontal row (name left, features center, price + CTA right). Highlighted tier has accent bg.",
          "ConversionPanel: product-anchored — small product preview left, copy + form right.",
          "ProductFooter: brand line + links + status badge + newsletter.",
        ],
      },
      {
        name: "asymmetric-pricing",
        description: "Asymmetric pricing/conversion structure. The page builds toward an opinionated pricing and conversion section.",
        sections: [
          "Hero: full-bleed product band at top, with headline and CTA overlaid at bottom-left. Product surface takes 70%+ of hero viewport. Credential strip beneath hero.",
          "ManifestoSection: no cards. Large display text — a 2-3 sentence product manifesto. Left-aligned on dark bg. Below: a small metrics rail (4 numbers).",
          "ProductShowcase: alternating product screenshots with callout labels. Two rows: first shows input state, second shows output/result.",
          "ProofBand: three case-study rows — each: logo + metric (e.g. '40% faster') + one-line quote. Horizontal layout, not cards.",
          "PricingSurface: 2+1 asymmetric highlight — two standard plans side by side (compact) + one enterprise plan spanning full width below with expanded feature list. Enterprise has accent border.",
          "ConversionPanel: full-width dark band. Left-aligned copy + inline email form. Trust signals below form.",
          "ProductFooter: brand statement + status + minimal links.",
        ],
      },
    ],
    imageRoles: [
      { role: "product-surface", sectionHint: "Hero", compositionRule: "Real product UI screenshot (mocked, high-detail) with visible browser chrome, toolbar, and content. Must look like a real application, not a wireframe or gradient card.", fallbackBehavior: "Use a high-detail dashboard screenshot with charts and data tables visible." },
      { role: "product-surface", sectionHint: "ProductTeardown", compositionRule: "Annotated product screenshot with 4-5 callout labels. Must show a specific workflow, not a generic dashboard.", fallbackBehavior: "Use a workflow/editor screenshot with visible callouts." },
      { role: "proof-portrait", sectionHint: "ProofBand", compositionRule: "Customer portrait — professional headshot paired with company logo. NOT a stock photo.", fallbackBehavior: "Omit portrait — use logo + quote only." },
    ],
    shortPromptDefaults: {
      designDirection:
        "modern technical premium with dark surface, product-first hero, structural pricing, and split conversion",
      titleHint: "Premium AI / SaaS product landing page",
    },
  },

  agency: {
    niche: "agency",
    label: "Creative Agency / Studio",
    tone: "confident editorial authorship with playful structure",
    palettes: [
      "off-white (#f6f4ef) bg, ink text, single bold accent (#ff4d2e or #1d4ed8)",
      "deep ink (#0d0d0d) bg, cream text, electric accent (#a3e635)",
    ],
    typography: {
      display: "GT Sectra or Tiempos or Editorial New — editorial display serif/grotesk",
      body: "Inter or Söhne or General Sans",
    },
    choreography: [
      "Hero (authored manifesto headline with kinetic display type)",
      "SelectedWork (asymmetric case-study index, NOT uniform grid)",
      "Capabilities (typographic list of disciplines, not feature cards)",
      "StudioPerspective (long-form first-person paragraph)",
      "ClientLogos (logo wall with anchor quote)",
      "JournalOrThinking (recent essays / talks / press)",
      "ContactInvitation (typographic invitation with real email + studio address)",
      "SignatureFooter (locations, contact, social, closing line)",
    ],
    ctaStyle:
      "typographic invitation with real studio email, locations, and availability — never a centered CTA stripe",
    footerStyle:
      "designed signature with closing line, real city addresses, studio phone, and social anchors composed in",
    proofStyle:
      "logo wall + single long-form anchor quote OR press strip with publication wordmarks",
    bannedLayouts: [
      "uniform 3-column work grid",
      "saas-style feature cards",
      "centered eyebrow + heading + buttons CTA",
      "stat chips as proof",
      "four-column utility footer sitemap",
    ],
    allowedImages: [
      "real client work in context",
      "studio/process photography",
      "team or principal portraits",
      "moodboard / collage compositions",
    ],
    bannedImages: [
      "abstract gradient backgrounds as primary",
      "generic 'team meeting' stock photos",
      "isometric tech illustrations",
    ],
    motion: motionExpressive,
    patternVocabulary: {
      hero: [
        "kinetic display headline with mask or letter reveal",
        "manifesto headline with offset wordmark and credential rail",
        "split: large statement left, signature client logo wall right",
      ],
      showcase: [
        "asymmetric case-study index with project meta (client/year/discipline)",
        "horizontal scroll rail of case studies",
        "stacked editorial case-study with full-bleed media + offset captions",
        "single hero project + secondary strip",
      ],
      proof: [
        "logo wall with single anchor quote",
        "press strip with publication wordmarks",
        "named-client quote with project context",
      ],
      cta: [
        "typographic invitation block: email + studio address + availability",
        "letter-format contact statement",
        "left-aligned contact block with real email and phone",
      ],
      footer: [
        "designed signature: closing statement + city offices + social",
        "two-column footer: identity / contact",
      ],
    },
    layoutRecipes: [
      {
        name: "manifesto-led",
        description: "Authored manifesto hero with kinetic type, asymmetric case-study index, and typographic contact invitation.",
        sections: [
          "Hero: large manifesto headline spanning 70% width in display serif/grotesk. Displaced wordmark at top-left. Credential rail (disciplines, est. year, locations) as a horizontal strip below headline. Single CTA. No hero image — typography IS the hero.",
          "SelectedWork: asymmetric case-study index. Each project is a row: large project image (60% width) + project meta column (client, year, discipline, one-line scope). Rows alternate image position (left/right). Each project has hover-reveal detail.",
          "Capabilities: typographic list of disciplines. No cards. Each discipline is a line of large display text with a muted description. Ruled dividers. The list IS the design.",
          "StudioPerspective: full-bleed dark band with long-form first-person paragraph. Pull-quote breaks the text in large serif. Optional: principal portrait offset right.",
          "ClientLogos: horizontal logo strip + single anchor quote beneath. Minimal.",
          "ContactInvitation: typographic invitation spanning viewport. 'Let's work together' or equivalent in display type. Below: real email, studio addresses (cities), phone, availability status. Left-aligned.",
          "SignatureFooter: closing statement in serif + city offices + social anchors. Designed as a final page surface.",
        ],
      },
      {
        name: "case-study-first",
        description: "One signature project leads the page. The agency's credibility is built through showing, not telling.",
        sections: [
          "Hero: single signature project — full-bleed project image with overlapping project name, client, and year. Agency wordmark pinned top-left. No manifesto copy.",
          "CaseStudy: deep-dive into the signature project. 3-4 images in asymmetric layout + project narrative + scope + outcome metrics. Editorial treatment.",
          "MoreWork: secondary project strip — 3-4 smaller project thumbnails with names. Horizontal rail or stacked vertical index.",
          "Capabilities: compact. One-line-per-discipline list with project count per discipline.",
          "StudioPerspective: short philosophy paragraph + principal portrait.",
          "ContactInvitation: letter-format contact statement with email + address + availability.",
          "SignatureFooter: offices + social + closing line.",
        ],
      },
    ],
    imageRoles: [
      { role: "project-showcase", sectionHint: "SelectedWork", compositionRule: "Real client work in context — brand identities, websites, campaigns, products. Must look like actual delivered work, not stock or mockup.", fallbackBehavior: "Use high-quality design/branding mockup images." },
      { role: "team-portrait", sectionHint: "StudioPerspective", compositionRule: "Principal or studio portrait in workspace context. Authentic, not corporate.", fallbackBehavior: "Omit portrait — use text-only perspective." },
      { role: "ambient-atmosphere", sectionHint: "Hero", compositionRule: "Only if case-study-first recipe: use a real client project image as hero focal media.", fallbackBehavior: "No image in hero — typography drives the manifesto hero." },
    ],
    shortPromptDefaults: {
      designDirection:
        "confident editorial authorship with kinetic display type, asymmetric case-study index, and a typographic contact invitation",
      titleHint: "Premium creative agency / design studio",
    },
  },

  portfolio: {
    niche: "portfolio",
    label: "Creative Portfolio",
    tone: "authored, point-of-view-first, image-led editorial",
    palettes: [
      "monochrome black/white/gray with warm gold accent on dark",
      "off-white (#f5f3ee) bg, ink text, single accent",
    ],
    typography: {
      display: "Playfair Display or GT Sectra — editorial serif",
      body: "Inter or Söhne",
    },
    choreography: [
      "Hero (authored statement with credential rail or mixed collage)",
      "SelectedWork (NOT alternating 7/4 rail — varied per project)",
      "PerspectiveOrAbout (first-person long-form, NOT stat chips)",
      "MediaInterlude (full-bleed media moment to sustain image-led feel)",
      "SelectiveProof (one curated quote, not avatar grid)",
      "ContactInvitation (typographic invitation with real email/studio)",
      "SignatureFooter (designed signature with real locations and contact)",
    ],
    ctaStyle:
      "typographic invitation spanning the viewport with real email, studio address, and availability — never centered eyebrow + headline + two buttons",
    footerStyle:
      "designed signature with closing typographic statement, real locations, studio contact, social anchors composed in",
    proofStyle:
      "one curated long-form quote with attribution OR a single press mention",
    bannedLayouts: [
      "alternating 7/4 or 12-col flip rail repeated for every project",
      "process section with four numbered steps 01/02/03/04",
      "About with '50+ projects / 12 awards' stat chips",
      "Contact CTA as centered eyebrow + headline + two buttons",
      "hero as moody photo + bg-black/60 overlay + center copy with nothing else",
      "footer as name + generic social icon row only",
    ],
    allowedImages: [
      "real client work / case-study media",
      "high-contrast portrait of the creator",
      "studio / process photography",
      "editorial collage compositions",
    ],
    bannedImages: [
      "abstract gradient backgrounds",
      "stock 'creative person at laptop' photos",
      "generic moody overlays with no media beneath",
    ],
    motion: motionRestrained,
    patternVocabulary: {
      hero: [
        "large authored statement with credential rail",
        "full-bleed portrait with displaced wordmark",
        "typographic manifesto with media anchor",
        "mixed collage with overlapping planes",
      ],
      showcase: [
        "stacked editorial case-study with full-bleed media + offset captions",
        "asymmetric project index with meta (year, client, discipline)",
        "offset overlap grid (projects break the column line)",
        "horizontal scroll rail of projects",
        "single hero project + secondary strip",
      ],
      proof: [
        "single curated quote with attribution",
        "single press mention with publication wordmark",
      ],
      cta: [
        "typographic invitation spanning viewport",
        "letter-format contact statement",
        "left-aligned contact block with real email + studio + availability",
      ],
      footer: [
        "designed signature: closing typographic statement + locations + contact + social",
      ],
    },
    layoutRecipes: [
      {
        name: "authored-typography-hero",
        description: "Authored typography hero with overlapping image plane. Typography and media interact — not side by side.",
        sections: [
          "Hero: large authored statement (3-4 words max per line) in display serif spanning 60% width. Credential rail (disciplines, years, notable clients) as small horizontal strip. One project image overlaps the hero text from the right edge — partially behind the headline, creating depth. The image is cropped asymmetrically.",
          "SelectedWork: stacked editorial case-studies. Each project: full-bleed project image + offset caption column (project name, client, year, one-line scope). Caption column overlaps the image bottom-right. Projects have distinct sizes — first project is large (hero-scale), subsequent projects are medium.",
          "PerspectiveOrAbout: first-person long-form statement. Left-aligned paragraph with pull-quote breaking into the text in large serif. Optional: small portrait offset right, overlapping the text column edge.",
          "MediaInterlude: full-bleed image moment — a project detail or studio shot spanning edge-to-edge. No text overlay. Creates a breathing pause.",
          "SelectiveProof: single curated quote with attribution. Large serif quote, client name + company below. Minimal — not a grid of testimonials.",
          "ContactInvitation: typographic invitation spanning viewport width. 'Available for select projects' or equivalent. Below: real email, studio city, phone. Left-aligned.",
          "SignatureFooter: closing typographic statement in serif + locations + contact + social. Designed as page closure.",
        ],
      },
      {
        name: "case-study-stagger",
        description: "Case-study first layout with staggered narrative sections. Each project tells a short visual story.",
        sections: [
          "Hero: full-bleed portrait of the creator with displaced name/wordmark overlapping the portrait edge. Credential strip below.",
          "HeroProject: single hero project — full-bleed project image + project narrative (3-4 sentences) + scope + outcome. The project image bleeds into the next section.",
          "SecondaryProjects: 2-3 smaller projects in an asymmetric grid — each project is a thumbnail + name + client. Thumbnails vary in size.",
          "PerspectiveOrAbout: typographic manifesto — a bold statement about craft, not a bio. Large serif text, left-aligned.",
          "MediaInterlude: full-bleed project detail image.",
          "ContactInvitation: letter-format. 'Dear future collaborator...' style. Real email + studio + availability.",
          "SignatureFooter: name + locations + social + closing line.",
        ],
      },
      {
        name: "editorial-showcase",
        description: "Editorial showcase with selective proof and signature footer. The work gallery is the structural centerpiece.",
        sections: [
          "Hero: mixed collage with overlapping planes — 2-3 project images at different sizes and rotations, overlapping. Name in large serif displaced to one corner. Credential strip at opposite corner.",
          "SelectedWork: asymmetric project index — projects listed vertically as large text entries (project name in display type, client in body). Hovering/selecting reveals a project image. Three to five projects.",
          "CaseStudyDeepDive: one project expanded — 3-4 images in asymmetric layout + scope + process note + outcome.",
          "PerspectiveOrAbout: interview Q&A format — 3-4 questions and answers about practice and philosophy.",
          "SelectiveProof: single press mention with publication wordmark.",
          "ContactInvitation: left-aligned contact block — email, studio, availability, phone. No centered headline.",
          "SignatureFooter: designed signature with typographic statement + locations + social.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Authored visual — high-contrast portrait of the creator OR project collage with overlapping planes. Must establish authorship. Never a generic moody photo with overlay.", fallbackBehavior: "Use a high-contrast black-and-white portrait in studio context." },
      { role: "project-showcase", sectionHint: "SelectedWork", compositionRule: "Real project media — brand work, designs, photography, campaigns. Must sustain image-led rhythm across the section. 3-4 projects with distinct images.", fallbackBehavior: "Use high-quality design mockup images with editorial treatment." },
      { role: "editorial-narrative", sectionHint: "PerspectiveOrAbout", compositionRule: "Optional portrait of creator in workspace. Offset, not centered. Must complement the text, not dominate.", fallbackBehavior: "Omit — text-only is fine for this section." },
      { role: "ambient-atmosphere", sectionHint: "MediaInterlude", compositionRule: "Full-bleed project detail or studio shot. Creates a breathing pause. Must be high quality and compositionally strong enough to stand alone.", fallbackBehavior: "Use a detail crop of the strongest project image." },
    ],
    shortPromptDefaults: {
      designDirection:
        "editorial authored portfolio with serif display, sustained image-led composition, and a typographic contact invitation",
      titleHint: "High-end creative portfolio",
    },
  },

  realEstate: {
    niche: "realEstate",
    label: "Luxury Real Estate",
    tone: "quiet luxury, place-first, broker-credibility-second",
    palettes: [
      "warm cream (#f5f1e8) bg, charcoal text, brass accent (#b89968)",
      "deep ink (#0d0d0d) bg, cream text, brass accent (#c9a876)",
    ],
    typography: {
      display: "Cormorant Garamond or Tiempos — high-contrast serif",
      body: "Inter or Söhne",
    },
    choreography: [
      "Hero (full-bleed exterior shot with property name, location, price discreetly framed)",
      "FeaturedListing (single hero property with stats: beds, baths, sqft, lot, price)",
      "ListingsIndex (asymmetric grid of 4-6 listings, varied tile sizes)",
      "NeighborhoodContext (map + place narrative)",
      "BrokerOrTeam (portrait + credentials + phone + license)",
      "PressOrTransactions (recent sales or press mentions)",
      "InquirySurface (private viewing request form)",
      "OfficeFooter (office address, phone, license, hours)",
    ],
    ctaStyle:
      "private viewing request form with property/timeline/contact fields, never a centered CTA stripe",
    footerStyle:
      "office address + phone + DRE/broker license + hours + service area",
    proofStyle:
      "recent transactions list (address + sold price + date) OR press mentions",
    bannedLayouts: [
      "saas-style feature cards",
      "centered eyebrow + headline + buttons CTA",
      "uniform 3-column listing grid",
      "stat chips as proof",
    ],
    allowedImages: [
      "high-end real estate photography (exteriors, interiors, lifestyle)",
      "neighborhood / place context shots",
      "broker portraits in property context",
    ],
    bannedImages: [
      "generic city skylines",
      "stock 'happy family with sold sign' photos",
      "abstract gradient backgrounds",
    ],
    motion: motionMinimal,
    patternVocabulary: {
      hero: [
        "full-bleed exterior with property name + location + price discreetly framed",
        "split: exterior left, single featured listing detail right",
      ],
      showcase: [
        "asymmetric listings index with mixed tile sizes",
        "single hero listing + secondary strip of 4 supporting listings",
        "neighborhood-grouped listings",
      ],
      proof: [
        "recent transactions list (address + sold price + date)",
        "press strip with publication wordmarks",
        "named-client quote with property context",
      ],
      cta: [
        "private viewing request form",
        "broker direct-contact card with phone + email + portrait",
      ],
      footer: [
        "office identity: address + phone + DRE license + hours + service area",
      ],
    },
    layoutRecipes: [
      {
        name: "property-showcase",
        description: "Full-bleed property hero with discreet price framing. The property is the star. Broker credibility is secondary.",
        sections: [
          "Hero: full-bleed luxury exterior photo. Property name + location + price discreetly overlaid at bottom-left on a semi-transparent surface. Brokerage wordmark top-right.",
          "FeaturedListing: single property deep-dive — hero exterior + 3 interior photos in asymmetric layout + stats (beds, baths, sqft, lot, price) + description.",
          "ListingsIndex: 4-6 supporting listings as mixed-size tiles. Larger tiles for premium listings. Each tile: exterior thumbnail + address + price + beds/baths.",
          "NeighborhoodContext: place narrative + neighborhood photo. Left-aligned text with map or context photo right.",
          "BrokerOrTeam: broker portrait + credentials + phone + license. Professional, restrained.",
          "InquirySurface: private viewing request form — property interest, timeline, contact fields. Split with broker direct-contact card.",
          "OfficeFooter: office address + phone + DRE license + hours + service area.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Full-bleed luxury property exterior in natural light. Must be a specific property, not a generic skyline.", fallbackBehavior: "Use a luxury residential exterior at golden hour." },
      { role: "project-showcase", sectionHint: "FeaturedListing", compositionRule: "Hero exterior + 2-3 interior shots (living room, kitchen, primary suite). Professional real estate photography style.", fallbackBehavior: "Use luxury interior photos with natural light." },
      { role: "ambient-atmosphere", sectionHint: "NeighborhoodContext", compositionRule: "Neighborhood or place context — street scene, park, waterfront. Must feel like the actual location.", fallbackBehavior: "Use a neighborhood street scene." },
      { role: "team-portrait", sectionHint: "BrokerOrTeam", compositionRule: "Professional broker portrait in property context. Restrained, not corporate stock.", fallbackBehavior: "Omit portrait — use text credentials only." },
    ],
    shortPromptDefaults: {
      designDirection:
        "quiet luxury real estate with serif display, full-bleed property photography, and a private-viewing inquiry surface",
      titleHint: "Luxury real estate brokerage",
    },
  },

  law: {
    niche: "law",
    label: "Law Firm / Legal Practice",
    tone: "authoritative, restrained, credential-first",
    palettes: [
      "ivory (#f6f3eb) bg, deep navy (#0a1f44) text, brass accent (#b08d5b)",
      "deep navy (#0a1f44) bg, cream text, brass accent",
    ],
    typography: {
      display: "Tiempos or Cormorant Garamond — restrained serif",
      body: "Inter or Lora",
    },
    choreography: [
      "Hero (firm name + practice areas + credential rail, NO stock photo)",
      "PracticeAreas (named practice areas with brief authored descriptions)",
      "AttorneyDirectory (portraits + name + role + bar admissions + education)",
      "RepresentativeMatters (notable cases or transactions, anonymized as needed)",
      "PressAndRecognition (Chambers, Best Lawyers, publication mentions)",
      "ContactSurface (consultation request form, office addresses)",
      "OfficeFooter (offices + phone + bar admissions + disclaimer)",
    ],
    ctaStyle:
      "consultation request form with matter type + timeline + contact, never a centered CTA stripe",
    footerStyle:
      "office addresses + phone + bar admissions + attorney advertising disclaimer",
    proofStyle:
      "publication recognition (Chambers, Best Lawyers) + representative matters",
    bannedLayouts: [
      "saas-style feature cards",
      "centered eyebrow + headline + buttons CTA",
      "uniform 3-column attorney grid (use editorial directory)",
      "stat chips as proof",
      "stock courthouse / gavel photography",
    ],
    allowedImages: [
      "attorney portraits in office context",
      "office interior / law library",
      "city office building exterior",
    ],
    bannedImages: [
      "stock gavel / scales-of-justice photos",
      "generic handshake stock photos",
      "abstract gradient backgrounds",
    ],
    motion: motionMinimal,
    patternVocabulary: {
      hero: [
        "firm name + practice areas + credential rail (no stock hero photo)",
        "split: firm statement left, recognition wordmarks right",
      ],
      showcase: [
        "practice areas as authored long-form list with descriptions",
        "attorney directory: portrait + name + role + bar admissions",
        "representative matters as numbered editorial list",
      ],
      proof: [
        "Chambers / Best Lawyers / publication wordmarks",
        "named representative matters",
      ],
      cta: [
        "consultation request form with matter type field",
        "office address card + direct phone + assistant contact",
      ],
      footer: [
        "office identity: addresses + phones + bar admissions + advertising disclaimer",
      ],
    },
    layoutRecipes: [
      {
        name: "credential-first",
        description: "Credential-first hero with typographic firm name. No stock gavel. Authority through restraint.",
        sections: [
          "Hero: firm name in large restrained serif + practice areas as a horizontal strip + credential rail (Chambers, years, bar admissions). No hero image. Typography and credential density establish authority.",
          "PracticeAreas: authored long-form list — each practice area is a row with name and 2-3 sentence description. Ruled dividers.",
          "AttorneyDirectory: editorial directory — attorney portraits with name, role, bar admissions, education. 2-column layout, not a card grid.",
          "RepresentativeMatters: numbered editorial list of notable cases/transactions (anonymized as needed). Each entry: matter type + scope + outcome.",
          "PressAndRecognition: Chambers / Best Lawyers wordmarks + one anchor quote.",
          "ContactSurface: consultation request form (matter type, timeline, contact) + office addresses.",
          "OfficeFooter: office addresses + phones + bar admissions + disclaimer.",
        ],
      },
    ],
    imageRoles: [
      { role: "team-portrait", sectionHint: "AttorneyDirectory", compositionRule: "Attorney portraits in office context. Consistent treatment — same lighting, framing, background for all attorneys.", fallbackBehavior: "Use professional headshots with neutral office background." },
      { role: "ambient-atmosphere", sectionHint: "ContactSurface", compositionRule: "Optional office interior or city building exterior. Restrained, not dramatic.", fallbackBehavior: "Omit image — use text-only contact surface." },
    ],
    shortPromptDefaults: {
      designDirection:
        "authoritative restrained law-firm editorial with serif display, credential-first hero, and consultation inquiry surface",
      titleHint: "Premium law firm / legal practice",
    },
  },

  fitness: {
    niche: "fitness",
    label: "Fitness / Gym / Studio",
    tone: "kinetic, embodied, results-first",
    palettes: [
      "deep ink (#0a0a0a) bg, energetic accent (#facc15 or #ef4444), white text",
      "concrete (#171717) bg, lime accent (#a3e635), white text",
    ],
    typography: {
      display: "Bebas Neue or Archivo Black or Druk — condensed display",
      body: "Inter",
    },
    choreography: [
      "Hero (kinetic athlete media with bold display headline)",
      "ProgramsOrClasses (named programs with format, intensity, schedule)",
      "CoachesAndResults (coach portraits + credentials + one named member story or quote)",
      "MembershipAndTrial (tier ladder pricing + trial class booking form + optional schedule preview)",
      "StudioFooter (address + hours + phone + class schedule link)",
    ],
    ctaStyle:
      "trial class booking form with date/time/program fields, never a centered CTA stripe",
    footerStyle:
      "studio address + hours + phone + class schedule + social",
    proofStyle:
      "named member transformation with photo + program + outcome",
    bannedLayouts: [
      "three uniform pricing cards",
      "stock 'happy gym person on treadmill' photos",
      "centered eyebrow + headline + buttons CTA",
      "abstract gradient backgrounds",
    ],
    allowedImages: [
      "real athletes / members in motion",
      "studio interior with equipment",
      "coach portraits in studio context",
    ],
    bannedImages: [
      "stock fitness model photos",
      "generic gym equipment close-ups with no people",
      "abstract gradient backgrounds",
    ],
    motion: motionExpressive,
    patternVocabulary: {
      hero: [
        "kinetic athlete media + bold display headline + program rail",
        "split: athlete photo left, schedule preview right",
      ],
      showcase: [
        "programs as named lanes with format / intensity / schedule",
        "weekly schedule grid with classes",
        "coach directory: portrait + credentials + specialty",
      ],
      proof: [
        "named member story with photo + program + outcome",
        "transformation timeline with media",
      ],
      cta: [
        "trial class booking form with date/program fields",
        "membership tier ladder with single trial CTA",
      ],
      footer: [
        "studio identity: address + hours + phone + schedule + social",
      ],
    },
    layoutRecipes: [
      {
        name: "kinetic-athlete-led",
        description: "Kinetic athlete-led hero with bold condensed display. Programs and coaching drive the page. Trial booking closes.",
        sections: [
          "Hero: full-bleed athlete in motion with bold condensed headline overlaid. Accent color bar at bottom with program rail (strength, HIIT, mobility). Single CTA.",
          "ProgramsOrClasses: named programs as horizontal lanes — each lane: program name in display type, format, intensity level, schedule. Accent borders.",
          "CoachesAndResults: coach portraits with credentials (2-column editorial layout, not a card grid) + one named member transformation or quote with program + outcome below.",
          "MembershipAndTrial: tier ladder pricing (stacked rows, not three-column cards) — each tier: name, price, included classes, CTA. Below: trial class booking form with date/time/program fields.",
          "StudioFooter: address + hours + phone + schedule link + social.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Real athlete or member in motion. Kinetic, embodied — jumping, lifting, stretching. Not a posed smile. High energy.", fallbackBehavior: "Use an athlete mid-movement in studio lighting." },
      { role: "team-portrait", sectionHint: "CoachingTeam", compositionRule: "Coach portraits in studio context. Active, not corporate. Consistent treatment across all coaches.", fallbackBehavior: "Use active coach portraits in gym environment." },
      { role: "proof-portrait", sectionHint: "MemberStories", compositionRule: "Real member with program context. Shows transformation or effort, not just a headshot.", fallbackBehavior: "Omit photo — use text-only testimonial." },
    ],
    shortPromptDefaults: {
      designDirection:
        "kinetic embodied fitness with condensed display type, athlete-led photography, and a trial class booking surface",
      titleHint: "Premium fitness studio / gym",
    },
  },

  beauty: {
    niche: "beauty",
    label: "Beauty / Spa / Salon",
    tone: "soft luxury, sensory, ritual-first",
    palettes: [
      "warm cream (#faf6f1) bg, ink text, rose accent (#c98a8f)",
      "soft blush (#f5e9e3) bg, deep brown text, gold accent (#b89968)",
    ],
    typography: {
      display: "Cormorant Garamond or Tiempos — soft serif",
      body: "Inter or Lora",
    },
    choreography: [
      "Hero (soft luxury hero with sensory media + ritual headline)",
      "ServicesMenu (editorial list with duration, price, description)",
      "SignatureRitual (one signature treatment story)",
      "PractitionerOrFounder (portrait + credentials + philosophy)",
      "ClientGlow (member quote or transformation)",
      "BookingSurface (real form: service + date + practitioner)",
      "StudioFooter (address + hours + phone + booking link)",
    ],
    ctaStyle:
      "booking form with service + date + practitioner fields, never a centered CTA stripe",
    footerStyle:
      "studio address + hours + phone + booking + social",
    proofStyle:
      "client quote OR press mention from a beauty publication",
    bannedLayouts: [
      "saas-style feature cards",
      "stock 'spa stones with candle' photos",
      "centered eyebrow + headline + buttons CTA",
      "three uniform pricing cards",
    ],
    allowedImages: [
      "soft natural light treatment / ritual photography",
      "practitioner portraits in studio",
      "product / ingredient close-ups in soft light",
    ],
    bannedImages: [
      "stock spa stones with candles",
      "generic 'cucumber over eyes' photos",
      "abstract gradient backgrounds",
    ],
    motion: motionRestrained,
    patternVocabulary: {
      hero: [
        "soft luxury hero with sensory media + ritual-led headline",
        "split: ritual photo left, service preview right",
      ],
      showcase: [
        "services menu as editorial list with duration / price / description",
        "signature ritual long-form story",
        "practitioner directory with credentials",
      ],
      proof: [
        "single curated client quote",
        "press strip with beauty publication wordmarks",
      ],
      cta: [
        "booking form with service / date / practitioner",
        "consultation inquiry block",
      ],
      footer: [
        "studio identity: address + hours + phone + booking + social",
      ],
    },
    layoutRecipes: [
      {
        name: "ritual-sensory",
        description: "Sensory ritual-led layout. Soft luxury. Photography drives atmosphere. Booking is the conversion.",
        sections: [
          "Hero: soft luxury — ritual photo (treatment in progress, soft natural light) with serif headline overlaid. Service preview strip at bottom (3 signature services with duration + price).",
          "ServicesMenu: editorial list — each service: name in serif, duration, price, description. Ruled dividers. One signature service highlighted with photo.",
          "SignatureRitual: long-form story about the signature treatment. Photo + narrative. Editorial composition.",
          "PractitionerOrFounder: portrait + credentials + philosophy paragraph. Left-aligned, not centered.",
          "ClientGlow: single curated client quote with treatment context.",
          "BookingSurface: booking form (service, date, practitioner) with studio hours alongside.",
          "StudioFooter: address + hours + phone + booking link + social.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Soft natural-light treatment or ritual photography. Must be sensory and real — hands working, products applied, soft textures. Never stock spa stones.", fallbackBehavior: "Use a close-up of a facial treatment in soft natural light." },
      { role: "editorial-narrative", sectionHint: "SignatureRitual", compositionRule: "Signature treatment in progress. Soft, intimate, ritual. Product or ingredient detail.", fallbackBehavior: "Use a product/ingredient close-up in soft light." },
      { role: "team-portrait", sectionHint: "PractitionerOrFounder", compositionRule: "Practitioner portrait in studio context. Warm, approachable, professional.", fallbackBehavior: "Use a practitioner working in soft studio light." },
    ],
    shortPromptDefaults: {
      designDirection:
        "soft luxury beauty ritual with serif display, sensory photography, and a service booking surface",
      titleHint: "Premium spa / beauty studio",
    },
  },

  generic: {
    niche: "generic",
    label: "Generic Premium Website",
    tone: "premium editorial with clear hierarchy",
    palettes: [
      "off-white (#f6f4ef) bg, ink text, single bold accent",
      "deep ink (#0a0a0a) bg, warm white text, single accent",
    ],
    typography: {
      display: "GT Sectra or Playfair Display — editorial serif",
      body: "Inter",
    },
    choreography: [
      "Hero (authored statement + clear single CTA)",
      "PrimaryStory (long-form editorial section)",
      "Capabilities (varied non-card section)",
      "Proof (one curated long-form quote)",
      "CTA (split or inset, never centered eyebrow + buttons)",
      "Footer (designed identity, never utility sitemap)",
    ],
    ctaStyle:
      "split or inset CTA with real form, never centered eyebrow + headline + two buttons",
    footerStyle:
      "designed identity with closing line, contact, and locations",
    proofStyle: "single curated long-form quote",
    bannedLayouts: [
      "three uniform feature cards",
      "centered eyebrow + headline + buttons CTA",
      "four-column utility footer sitemap",
      "abstract gradient mesh as primary visual",
    ],
    allowedImages: ["editorial photography relevant to brief"],
    bannedImages: [
      "generic stock business photos",
      "abstract gradient blobs",
    ],
    motion: motionRestrained,
    patternVocabulary: {
      hero: [
        "authored statement + single clear CTA",
        "split: copy left, anchor media right",
      ],
      showcase: [
        "long-form editorial story section",
        "asymmetric capability blocks",
      ],
      proof: ["single curated long-form quote"],
      cta: [
        "split panel with real form",
        "inset bordered band with left-aligned copy",
      ],
      footer: ["designed identity: closing line + contact + locations"],
    },
    layoutRecipes: [
      {
        name: "editorial-premium",
        description: "Editorial premium default. Clear hierarchy, asymmetric composition, designed closure.",
        sections: [
          "Hero: authored statement with single clear CTA. Split or full-width. Credential or trust element visible.",
          "PrimaryStory: long-form editorial section. Left-aligned or split. Not a card grid.",
          "Capabilities: varied non-card section — typographic list, asymmetric blocks, or editorial directory.",
          "Proof: single curated long-form quote with attribution.",
          "CTA: split or inset panel with real form. Not centered headline + buttons.",
          "Footer: designed identity — closing line + contact + locations. Not a utility sitemap.",
        ],
      },
    ],
    imageRoles: [
      { role: "hero-focal", sectionHint: "Hero", compositionRule: "Editorial photography aligned with the brief. Must be intentional, not generic stock.", fallbackBehavior: "Use high-quality editorial photography relevant to brief tone." },
      { role: "editorial-narrative", sectionHint: "PrimaryStory", compositionRule: "Supporting editorial image. Must complement the narrative.", fallbackBehavior: "Omit — text-only editorial section." },
    ],
    shortPromptDefaults: {
      designDirection:
        "premium editorial with clear hierarchy, asymmetric composition, and a designed identity footer",
      titleHint: "Premium website",
    },
  },
};

export function getNicheProfile(niche: Niche): NicheProfile {
  return NICHE_PROFILES[niche];
}
