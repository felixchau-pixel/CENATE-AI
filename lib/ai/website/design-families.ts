import type { Niche } from "./niche-router";
import { findLocalImage } from "./local-image-library";

export type DesignFamilyId =
  | "editorial_luxury"
  | "modern_minimal"
  | "bold_commercial"
  | "warm_artisan";

export type SectionRole =
  | "navbar"
  | "hero"
  | "story"
  | "services"
  | "gallery"
  | "proof"
  | "cta"
  | "footer";

export type DesignFamily = {
  id: DesignFamilyId;
  label: string;
  description: string;
  typography: string;
  colors: string;
  spacing: string;
  borders: string;
  shadows: string;
  cta: string;
  imagery: string;
  motifs: string;
  cssTheme: string;
  cssUtilities: string;
  archetypes: Record<SectionRole, string[]>;
};

export type SectionBlueprint = {
  required: string[];
  banned: string[];
  structure: string;
};

export type WebsiteVariantPlan = {
  designFamily: DesignFamilyId;
  heroVariant: string;
  sectionChoreography: string;
  bodyRoleSequence: Array<"story" | "services" | "gallery" | "proof" | "cta">;
  proofVariant: string;
  featureVariant: string;
  ctaVariant: string;
  footerVariant: string;
  imageStrategy: "uploaded" | "curated-local" | "approved-fallback";
  densityMode: "airy" | "balanced" | "dense";
  contrastMode: "soft" | "balanced" | "high";
};

type VariantPlannerParams = {
  brief: string;
  niche: Niche;
  designFamily: DesignFamilyId;
  uploadedImageUrls?: string[];
};

type VariantDirectiveMap = Record<string, { contract: string; bans: string[] }>;

const HERO_VARIANTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["editorial-split", "cinematic-offset", "image-left-copy-right"],
  saas: ["product-ui-split", "centered-launch-rail", "workflow-window"],
  construction: ["proof-led-split", "crew-and-project-split", "metric-anchored-hero"],
  agency: ["editorial-collage", "manifesto-with-media", "showcase-split"],
  portfolio: ["authored-manifesto", "collage-signature", "image-led-statement"],
  realEstate: ["property-split", "listing-led-hero", "editorial-estate-frame"],
  law: ["authority-split", "credential-rail", "editorial-trust-panel"],
  fitness: ["performance-split", "coach-led-hero", "energy-panel"],
  beauty: ["artisan-editorial", "portrait-split", "ritual-led-hero"],
  generic: ["editorial-split", "showcase-split", "centered-premium-statement"],
};

const CHOREOGRAPHIES_BY_NICHE: Record<Niche, Array<{ key: string; roles: WebsiteVariantPlan["bodyRoleSequence"] }>> = {
  restaurant: [
    { key: "story -> services -> gallery -> proof -> cta", roles: ["story", "services", "gallery", "proof", "cta"] },
    { key: "gallery -> story -> services -> proof -> cta", roles: ["gallery", "story", "services", "proof", "cta"] },
    { key: "story -> gallery -> proof -> services -> cta", roles: ["story", "gallery", "proof", "services", "cta"] },
  ],
  saas: [
    { key: "story -> services -> proof -> cta", roles: ["story", "services", "proof", "cta"] },
    { key: "proof -> story -> services -> cta", roles: ["proof", "story", "services", "cta"] },
    { key: "story -> proof -> services -> cta", roles: ["story", "proof", "services", "cta"] },
  ],
  construction: [
    { key: "proof -> services -> gallery -> cta", roles: ["proof", "services", "gallery", "cta"] },
    { key: "story -> proof -> services -> cta", roles: ["story", "proof", "services", "cta"] },
    { key: "gallery -> proof -> services -> cta", roles: ["gallery", "proof", "services", "cta"] },
  ],
  agency: [
    { key: "gallery -> story -> proof -> cta", roles: ["gallery", "story", "proof", "cta"] },
    { key: "story -> gallery -> services -> cta", roles: ["story", "gallery", "services", "cta"] },
    { key: "proof -> gallery -> story -> cta", roles: ["proof", "gallery", "story", "cta"] },
  ],
  portfolio: [
    { key: "gallery -> story -> proof -> cta", roles: ["gallery", "story", "proof", "cta"] },
    { key: "story -> gallery -> proof -> cta", roles: ["story", "gallery", "proof", "cta"] },
    { key: "gallery -> proof -> story -> cta", roles: ["gallery", "proof", "story", "cta"] },
  ],
  realEstate: [
    { key: "gallery -> proof -> services -> cta", roles: ["gallery", "proof", "services", "cta"] },
    { key: "story -> gallery -> proof -> cta", roles: ["story", "gallery", "proof", "cta"] },
    { key: "proof -> gallery -> services -> cta", roles: ["proof", "gallery", "services", "cta"] },
  ],
  law: [
    { key: "proof -> story -> services -> cta", roles: ["proof", "story", "services", "cta"] },
    { key: "story -> proof -> services -> cta", roles: ["story", "proof", "services", "cta"] },
    { key: "proof -> services -> story -> cta", roles: ["proof", "services", "story", "cta"] },
  ],
  fitness: [
    { key: "story -> proof -> services -> cta", roles: ["story", "proof", "services", "cta"] },
    { key: "gallery -> story -> proof -> cta", roles: ["gallery", "story", "proof", "cta"] },
    { key: "proof -> services -> gallery -> cta", roles: ["proof", "services", "gallery", "cta"] },
  ],
  beauty: [
    { key: "story -> gallery -> proof -> cta", roles: ["story", "gallery", "proof", "cta"] },
    { key: "gallery -> story -> services -> cta", roles: ["gallery", "story", "services", "cta"] },
    { key: "story -> proof -> gallery -> cta", roles: ["story", "proof", "gallery", "cta"] },
  ],
  generic: [
    { key: "story -> services -> proof -> cta", roles: ["story", "services", "proof", "cta"] },
    { key: "gallery -> story -> proof -> cta", roles: ["gallery", "story", "proof", "cta"] },
    { key: "proof -> story -> services -> cta", roles: ["proof", "story", "services", "cta"] },
  ],
};

const PROOF_VARIANTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["critic-pull-quote", "press-proof-band", "named-guest-quote"],
  saas: ["metrics-band", "logo-quote-rail", "case-study-strip"],
  construction: ["metric-band", "credential-strip", "project-proof-band"],
  agency: ["case-study-strip", "logo-quote-rail", "editorial-proof-band"],
  portfolio: ["selective-attributed-quote", "editorial-proof-band", "press-mention-strip"],
  realEstate: ["market-metrics-band", "client-proof-band", "listing-results-strip"],
  law: ["credential-strip", "case-result-band", "attributed-client-quote"],
  fitness: ["transformation-metrics-band", "member-proof-strip", "coach-credential-band"],
  beauty: ["client-quote-band", "editorial-proof-strip", "brand-trust-band"],
  generic: ["attributed-quote-band", "metrics-band", "logo-quote-rail"],
};

const FEATURE_VARIANTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["editorial-menu-ledger", "signature-course-feature", "ritual-story-lanes"],
  saas: ["alternating-workflow-rows", "dense-product-grid", "teardown-callout-band"],
  construction: ["service-lanes-with-highlight", "timeline-capabilities", "project-scope-matrix"],
  agency: ["asymmetric-case-cards", "editorial-story-sections", "alternating-media-rows"],
  portfolio: ["stacked-case-study", "asymmetric-project-index", "editorial-story-sections"],
  realEstate: ["property-type-rows", "listing-grid-with-anchor", "neighborhood-story-bands"],
  law: ["practice-area-lanes", "timeline-capabilities", "case-study-rows"],
  fitness: ["program-lanes", "coach-led-feature-rows", "transformation-grid-with-anchor"],
  beauty: ["ritual-lanes", "asymmetric-offer-cards", "ingredient-story-rows"],
  generic: ["alternating-media-rows", "asymmetric-cards", "editorial-story-sections"],
};

const CTA_VARIANTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["booking-panel", "reservation-form-first", "private-dining-contact"],
  saas: ["framed-conversion-panel", "form-first-signup", "dual-path-demo"],
  construction: ["estimate-form-panel", "call-now-split-cta", "service-area-booking"],
  agency: ["project-brief-panel", "consultation-form-first", "dual-path-engagement"],
  portfolio: ["letter-format-contact", "left-aligned-invitation", "project-inquiry-panel"],
  realEstate: ["consultation-form-panel", "tour-booking-cta", "agent-contact-panel"],
  law: ["consultation-intake-panel", "call-now-contact-block", "case-review-form-first"],
  fitness: ["trial-booking-panel", "plan-selection-cta", "coach-contact-split"],
  beauty: ["appointment-booking-panel", "consultation-form-first", "ritual-inquiry-cta"],
  generic: ["framed-conversion-panel", "form-first-cta", "contact-panel"],
};

const FOOTER_VARIANTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["venue-contact-footer", "editorial-closing-footer", "reservation-led-footer"],
  saas: ["product-signal-footer", "brand-and-status-footer", "lean-product-footer"],
  construction: ["service-area-footer", "commercial-contact-footer", "trust-signal-footer"],
  agency: ["studio-contact-footer", "editorial-signature-footer", "brand-closure-footer"],
  portfolio: ["authored-signature-footer", "studio-contact-footer", "editorial-contact-footer"],
  realEstate: ["agent-contact-footer", "listing-brand-footer", "estate-contact-footer"],
  law: ["practice-contact-footer", "credential-footer", "firm-closing-footer"],
  fitness: ["studio-hours-footer", "coach-contact-footer", "membership-footer"],
  beauty: ["salon-hours-footer", "brand-contact-footer", "ritual-closing-footer"],
  generic: ["brand-contact-footer", "editorial-contact-footer", "service-company-footer"],
};

const HERO_VARIANT_DIRECTIVES: VariantDirectiveMap = {
  "editorial-split": {
    contract: "Use an offset split hero with real media weight on one side and a support rail on the other. Include eyebrow, headline, body copy, Button CTA, and one trust/stat/media support block.",
    bans: ["plain centered copy over wallpaper image", "headline + button only hero"],
  },
  "cinematic-offset": {
    contract: "Use a layered cinematic hero with one dominant image plane and one offset support panel containing credentials, service notes, or stats.",
    bans: ["flat two-column stock split", "hero with no secondary panel"],
  },
  "image-left-copy-right": {
    contract: "Use image-left / copy-right hero with explicit asymmetry and a compact support rail below the copy.",
    bans: ["centered hero", "browser-window fake visual"],
  },
  "product-ui-split": {
    contract: "Hero must show a real product surface as primary content, with copy on the opposite side and a supporting proof strip below or beside it.",
    bans: ["blurred photo in gradient card", "dashboard placeholder frame with no product details"],
  },
  "centered-launch-rail": {
    contract: "Use centered premium statement only if a real product/proof rail sits directly under it. The support rail is mandatory and must carry metrics or trust.",
    bans: ["centered headline + buttons only", "empty visual frame"],
  },
  "workflow-window": {
    contract: "Hero must anchor around a workflow/product window with visible structure and one adjacent credential or metric support block.",
    bans: ["photo-led hero for SaaS", "soft gradient blob hero with no product surface"],
  },
  "proof-led-split": {
    contract: "Lead with proof numbers or credentials in the hero support block, paired with real project or crew imagery.",
    bans: ["generic corporate handshake hero", "software-style hero panel"],
  },
  "metric-anchored-hero": {
    contract: "Anchor the hero around a metric/credential rail that immediately substantiates the offer.",
    bans: ["hero without trust/stat support", "decorative-only media"],
  },
  "editorial-collage": {
    contract: "Hero must use overlapping project/media planes and a clear authored thesis, not a generic split.",
    bans: ["flat feature marketing hero", "single wallpaper image with centered text"],
  },
  "manifesto-with-media": {
    contract: "Hero must foreground an authored statement plus a deliberately framed supporting media block.",
    bans: ["generic startup hero", "empty side panel"],
  },
  "showcase-split": {
    contract: "Use split hero with one side dedicated to real showcase media and the other to authored or commercial copy plus proof.",
    bans: ["both sides text-only", "generic icon grid inside hero"],
  },
  "authored-manifesto": {
    contract: "Hero must establish authorship and point of view with a strong first-person or authored statement plus a supporting visual plane.",
    bans: ["agency boilerplate hero", "soft centered CTA stripe hero"],
  },
  "collage-signature": {
    contract: "Hero must use a collage or mixed-plane composition with at least two media or content layers.",
    bans: ["plain alternating case study hero", "single framed image only"],
  },
  "image-led-statement": {
    contract: "Hero must be image-led, but the copy still needs a clear support rail and authored identity.",
    bans: ["photo wallpaper with overlay only", "minimal hero with no proof"],
  },
  "property-split": {
    contract: "Use property-led split hero with listing or location proof embedded in the support block.",
    bans: ["generic skyline stock hero", "text-only real-estate hero"],
  },
  "listing-led-hero": {
    contract: "Hero must foreground a real property/listing frame and supporting market or tour information.",
    bans: ["generic feature card hero", "no property media"],
  },
  "editorial-estate-frame": {
    contract: "Use a high-end estate/editorial frame with one strong property visual and compact proof support.",
    bans: ["utility SaaS hero", "icon grid hero"],
  },
  "authority-split": {
    contract: "Use split hero with authority/credential support anchored close to the main copy.",
    bans: ["startup product hero", "hero without contact/trust support"],
  },
  "credential-rail": {
    contract: "Hero must carry a visible credential rail and a direct action surface.",
    bans: ["soft lifestyle wallpaper hero", "hero missing service proof"],
  },
  "editorial-trust-panel": {
    contract: "Use a trust panel with bars/credentials next to or beneath the core copy.",
    bans: ["generic marketing hero", "empty decorative panel"],
  },
  "performance-split": {
    contract: "Use energetic split hero with performance imagery and a support rail for stats or program markers.",
    bans: ["static service-company hero", "text-only fitness hero"],
  },
  "coach-led-hero": {
    contract: "Hero must visually establish coach or member context and one structured proof strip.",
    bans: ["generic app hero", "hero with no people/proof context"],
  },
  "energy-panel": {
    contract: "Use a dense energy-led panel plus direct conversion support.",
    bans: ["muted premium editorial hero", "flat centered stack only"],
  },
  "artisan-editorial": {
    contract: "Use a warm editorial hero with tactile image treatment and one crafted support block.",
    bans: ["cold product hero", "generic corporate split"],
  },
  "portrait-split": {
    contract: "Use portrait/process imagery with an intimate copy rail and appointment-oriented action.",
    bans: ["SaaS-style browser panel", "hero with no ritual/process signal"],
  },
  "ritual-led-hero": {
    contract: "Hero must foreground ritual/process/ingredient context, not only headline and offer.",
    bans: ["centered CTA stripe hero", "proofless lifestyle wallpaper"],
  },
  "centered-premium-statement": {
    contract: "If centered, the hero still requires a structured support rail and a visibly distinct media or proof anchor beneath the headline.",
    bans: ["centered headline + two buttons only", "hero with no support block"],
  },
};

const PROOF_VARIANT_DIRECTIVES: VariantDirectiveMap = {
  "critic-pull-quote": {
    contract: "Proof must be a large attributed quote with publication/critic identity, not a testimonial card grid.",
    bans: ["avatar testimonial grid", "same card shell as features"],
  },
  "press-proof-band": {
    contract: "Use a horizontal press/proof band with one anchor quote and supporting marks or names.",
    bans: ["uniform quote cards", "generic review stars row only"],
  },
  "named-guest-quote": {
    contract: "Use one named guest or publication quote with real attribution and restrained support items.",
    bans: ["anonymous quotes", "3-card testimonial fallback"],
  },
  "metrics-band": {
    contract: "Proof should anchor on metrics or adoption numbers, optionally paired with a single quote or logo strip.",
    bans: ["feature-card clone", "avatar card wall"],
  },
  "logo-quote-rail": {
    contract: "Use logos or trust marks with one editorial quote rail, not uniform cards.",
    bans: ["metrics repeated as cards", "same surface as pricing/features"],
  },
  "case-study-strip": {
    contract: "Proof must look like concise case-study outcomes or adoption evidence, not testimonials alone.",
    bans: ["generic quote carousel", "3-up testimonial cards"],
  },
  "metric-band": {
    contract: "Use one hard metric band with strong commercial credibility markers.",
    bans: ["soft testimonial-only proof", "uniform cards"],
  },
  "credential-strip": {
    contract: "Lead with certifications, licensing, service areas, or guarantees in a strong strip.",
    bans: ["avatar cards", "proof section that looks like services"],
  },
  "project-proof-band": {
    contract: "Proof should showcase project outcomes or completed work evidence, not just quotes.",
    bans: ["generic testimonials", "same grid as services"],
  },
  "selective-attributed-quote": {
    contract: "Use one curated attributed quote with editorial weight, not a wall of testimonials.",
    bans: ["3-card testimonials", "proof section cloned from features"],
  },
  "editorial-proof-band": {
    contract: "Use a wide editorial proof band with either a pull quote or press/award markers.",
    bans: ["tight symmetric card grid", "avatar stack"],
  },
  "press-mention-strip": {
    contract: "Use a sparse press-mention or publication strip with strong typographic restraint.",
    bans: ["testimonial cards", "logo grid with no context"],
  },
  "attributed-quote-band": {
    contract: "Proof must include real attribution and distinct composition from services/features.",
    bans: ["anonymous quotes", "same card shell reuse"],
  },
};

const FEATURE_VARIANT_DIRECTIVES: VariantDirectiveMap = {
  "editorial-menu-ledger": {
    contract: "Render services/menu as an editorial ledger with ruled items and one highlighted signature entry.",
    bans: ["uniform 3-card grid", "pricing-card clone"],
  },
  "signature-course-feature": {
    contract: "Use one dominant highlighted offering with supporting secondary items around it.",
    bans: ["equal cards", "dense SaaS-style feature grid"],
  },
  "ritual-story-lanes": {
    contract: "Use sequential ritual/story lanes with media and copy shifts rather than equal cards.",
    bans: ["feature trifecta cards", "stack of identical panels"],
  },
  "alternating-workflow-rows": {
    contract: "Features must alternate direction and density, with media/callout changes between rows.",
    bans: ["uniform grid only", "same shell repeated across all rows"],
  },
  "dense-product-grid": {
    contract: "Use a dense product grid only if one item is clearly dominant and neighboring items vary in weight.",
    bans: ["three equal cards", "identical padding and shell on every feature"],
  },
  "teardown-callout-band": {
    contract: "Use one teardown or callout band that explains the product/service structurally, not just cards.",
    bans: ["plain features grid", "generic centered feature intro"],
  },
  "service-lanes-with-highlight": {
    contract: "Use service lanes with one highlighted offer and varied row treatment.",
    bans: ["equal three-card grid", "same border-card repeated"],
  },
  "timeline-capabilities": {
    contract: "Use timeline or process-led capability presentation with structural markers.",
    bans: ["agency 01/02/03/04 boilerplate cards", "flat feature cards only"],
  },
  "project-scope-matrix": {
    contract: "Use a scope matrix or hard-separated capability surface, not generic feature cards.",
    bans: ["soft rounded equal cards", "same shell as proof"],
  },
  "asymmetric-case-cards": {
    contract: "Use asymmetric case cards or project panels with one anchor item and supporting secondaries.",
    bans: ["all cards same size", "uniform 3-column card wall"],
  },
  "editorial-story-sections": {
    contract: "Use editorial story sections with strong copy/media cadence and varied alignment.",
    bans: ["feature card fallback", "repeating centered intros"],
  },
  "alternating-media-rows": {
    contract: "Alternate media rows left/right with spacing and surface shifts between them.",
    bans: ["same split repeated three times", "grid-only features"],
  },
  "stacked-case-study": {
    contract: "Use a stacked case-study or project index with visible hierarchy between items.",
    bans: ["alternating rail repeated for every project", "uniform cards"],
  },
  "asymmetric-project-index": {
    contract: "Use an asymmetric project index with one dominant project and smaller adjacent stories.",
    bans: ["repeated equal project cards", "generic portfolio grid"],
  },
  "property-type-rows": {
    contract: "Use property/service rows with one anchor listing/type and supporting rows.",
    bans: ["equal marketing cards", "SaaS-style feature grid"],
  },
  "listing-grid-with-anchor": {
    contract: "If using a grid, one listing/property must anchor the section with larger visual weight.",
    bans: ["three equal cards", "flat list with no anchor"],
  },
  "neighborhood-story-bands": {
    contract: "Use neighborhood or lifestyle story bands rather than generic service cards.",
    bans: ["uniform feature grid", "same shell reuse"],
  },
  "practice-area-lanes": {
    contract: "Use practice-area lanes or separated capability bands with one anchor emphasis.",
    bans: ["generic agency cards", "equal cards only"],
  },
  "case-study-rows": {
    contract: "Use matter/case-study rows with context and result markers.",
    bans: ["card-only features", "same composition as proof"],
  },
  "program-lanes": {
    contract: "Use program lanes with one featured offer and varied support items.",
    bans: ["three equal plan cards", "flat features row"],
  },
  "coach-led-feature-rows": {
    contract: "Use coach-led or transformation-led rows, not generic benefit cards.",
    bans: ["uniform card grid", "same shell repetition"],
  },
  "transformation-grid-with-anchor": {
    contract: "If using a transformation grid, anchor it with one dominant result panel.",
    bans: ["all items same weight", "testimonial-like cards"],
  },
  "ritual-lanes": {
    contract: "Use ritual/treatment lanes with texture and one hero treatment highlight.",
    bans: ["equal cards only", "service cards with no media rhythm"],
  },
  "asymmetric-offer-cards": {
    contract: "Use asymmetric offer cards with one dominant panel and varied support cards.",
    bans: ["equal 3-card grid", "same shell everywhere"],
  },
  "ingredient-story-rows": {
    contract: "Use ingredient/process/story rows rather than generic service cards.",
    bans: ["plain offer cards only", "SaaS-style features"],
  },
  "asymmetric-cards": {
    contract: "Use asymmetric cards with one dominant anchor item and non-uniform neighbors.",
    bans: ["three equal cards", "flat uniform grid"],
  },
};

const CTA_VARIANT_DIRECTIVES: VariantDirectiveMap = {
  "booking-panel": {
    contract: "CTA must be a framed booking panel with real reservation/contact detail and one primary Button.",
    bans: ["centered stripe with two buttons only", "no contact detail"],
  },
  "reservation-form-first": {
    contract: "CTA must lead with a real reservation/contact form on a framed surface.",
    bans: ["headline and buttons only", "utility footer masquerading as CTA"],
  },
  "private-dining-contact": {
    contract: "CTA must feel like a private-dining/contact invitation with real phone/email/address details.",
    bans: ["generic booking buttons only", "unframed CTA strip"],
  },
  "framed-conversion-panel": {
    contract: "CTA must be a left-aligned framed conversion panel with structural separation from the previous section.",
    bans: ["centered eyebrow headline two-button mesh", "unframed CTA"],
  },
  "form-first-signup": {
    contract: "CTA must foreground a real signup form or field group with one clear primary action.",
    bans: ["buttons-only CTA", "same shell as features"],
  },
  "dual-path-demo": {
    contract: "CTA may offer two paths only if the panel is structurally framed and one path remains primary.",
    bans: ["two equal buttons with no context", "centered CTA stripe"],
  },
  "estimate-form-panel": {
    contract: "CTA must use a real estimate/contact form panel and support assurances.",
    bans: ["call now buttons only", "no input/contact detail"],
  },
  "call-now-split-cta": {
    contract: "CTA must split offer copy and direct contact surface, not center everything.",
    bans: ["centered CTA stripe", "buttons with no contact context"],
  },
  "service-area-booking": {
    contract: "CTA must tie directly to service area or appointment action with framed structure.",
    bans: ["generic quote request strip", "text-only CTA"],
  },
  "project-brief-panel": {
    contract: "CTA must feel like a project inquiry panel with real form or explicit contact channel.",
    bans: ["centered generic CTA", "no authored contact context"],
  },
  "consultation-form-first": {
    contract: "CTA must lead with a consultation form on a distinct surface.",
    bans: ["buttons-only CTA", "footer-like closure posing as CTA"],
  },
  "dual-path-engagement": {
    contract: "CTA can offer two engagement paths only if framed and clearly prioritized.",
    bans: ["equal buttons only", "centered mesh CTA"],
  },
  "letter-format-contact": {
    contract: "CTA/contact must read like a letter-format or authored invitation, with real contact detail.",
    bans: ["centered eyebrow + two buttons", "generic signup CTA"],
  },
  "left-aligned-invitation": {
    contract: "CTA/contact must be left-aligned and personal, with real email/availability/contact detail.",
    bans: ["centered CTA stripe", "utility footer clone"],
  },
  "project-inquiry-panel": {
    contract: "CTA/contact must use a framed inquiry panel, not a generic button strip.",
    bans: ["buttons only", "same shell as features/proof"],
  },
  "consultation-form-panel": {
    contract: "CTA must use a consultation form panel with one clear conversion path.",
    bans: ["generic CTA stripe", "contact info omitted"],
  },
  "tour-booking-cta": {
    contract: "CTA must support booking/showing/tour action with real contact details.",
    bans: ["headline + buttons only", "no framed surface"],
  },
  "agent-contact-panel": {
    contract: "CTA must foreground the agent/contact surface with real phone/email/location context.",
    bans: ["generic signup CTA", "two-button stripe"],
  },
  "consultation-intake-panel": {
    contract: "CTA must read like a consultation/intake panel with direct legal contact paths.",
    bans: ["generic commercial CTA", "no intake or contact detail"],
  },
  "case-review-form-first": {
    contract: "CTA must foreground a case-review/contact form in a dedicated framed panel.",
    bans: ["buttons only", "utility footer style"],
  },
  "trial-booking-panel": {
    contract: "CTA must offer a trial or booking path with one primary action and real scheduling/contact cues.",
    bans: ["centered mesh CTA", "buttons-only stripe"],
  },
  "plan-selection-cta": {
    contract: "CTA may include plan selection or membership cues, but must remain structurally framed.",
    bans: ["three equal plan cards as CTA", "generic CTA stripe"],
  },
  "coach-contact-split": {
    contract: "CTA must split contact/booking details from persuasive copy.",
    bans: ["centered CTA only", "no real contact details"],
  },
  "appointment-booking-panel": {
    contract: "CTA must present appointment booking with real contact or form inputs.",
    bans: ["centered buttons only", "unframed CTA"],
  },
  "ritual-inquiry-cta": {
    contract: "CTA must feel like a crafted inquiry/booking moment with intimate contact context.",
    bans: ["generic promo CTA", "mesh/button stripe"],
  },
  "form-first-cta": {
    contract: "CTA must foreground a real form on a distinct framed surface.",
    bans: ["buttons-only CTA", "generic centered CTA"],
  },
  "contact-panel": {
    contract: "CTA must be a real contact panel with one primary Button and real contact detail.",
    bans: ["two-button-only stripe", "footer clone"],
  },
};

const FOOTER_VARIANT_DIRECTIVES: VariantDirectiveMap = {
  "venue-contact-footer": {
    contract: "Footer must close with venue identity, address/hours, reservation line, and a non-link element.",
    bans: ["four-column sitemap", "copyright strip only"],
  },
  "editorial-closing-footer": {
    contract: "Footer must include a closing statement plus real contact detail in an editorial arrangement.",
    bans: ["link grid only", "utility footer"],
  },
  "reservation-led-footer": {
    contract: "Footer must include booking/contact context and one non-link surface such as hours or private dining note.",
    bans: ["generic product footer", "links only"],
  },
  "product-signal-footer": {
    contract: "Footer must include product brand closure plus one non-link signal like status, changelog, or newsletter.",
    bans: ["four equal link columns", "link-only sitemap"],
  },
  "brand-and-status-footer": {
    contract: "Footer must close with brand statement and a status/trust surface, not just utility links.",
    bans: ["utility strip", "links-only footer"],
  },
  "lean-product-footer": {
    contract: "Footer should stay compact but still include non-link product/company signal.",
    bans: ["four-column footer", "empty legal strip"],
  },
  "service-area-footer": {
    contract: "Footer must include service area, direct contact, and one trust/status element.",
    bans: ["generic sitemap", "links-only closure"],
  },
  "commercial-contact-footer": {
    contract: "Footer must read as a commercial contact surface with direct phone/location cues.",
    bans: ["product footer", "utility links only"],
  },
  "trust-signal-footer": {
    contract: "Footer must include trust signals or credentials alongside direct contact info.",
    bans: ["plain link grid", "copyright-only strip"],
  },
  "studio-contact-footer": {
    contract: "Footer must include studio/brand identity, real contact details, and a closing statement.",
    bans: ["utility footer", "social icons only"],
  },
  "editorial-signature-footer": {
    contract: "Footer must feel authored and typographic, with real contact detail and one non-link closure element.",
    bans: ["generic company footer", "four-column sitemap"],
  },
  "brand-closure-footer": {
    contract: "Footer must end with a brand/studio closure, not just links.",
    bans: ["links only", "generic legal strip"],
  },
  "authored-signature-footer": {
    contract: "Footer must read like an authored signature with location/contact presence.",
    bans: ["utility footer", "name + icon row only"],
  },
  "editorial-contact-footer": {
    contract: "Footer must use editorial contact composition with a real closing note.",
    bans: ["sitemap only", "link-heavy generic footer"],
  },
  "agent-contact-footer": {
    contract: "Footer must include agent identity, phone/email/location, and one trust or scheduling signal.",
    bans: ["generic product footer", "links-only footer"],
  },
  "listing-brand-footer": {
    contract: "Footer must close with brand/listing context and direct contact, not utility columns.",
    bans: ["four-column sitemap", "link-only strip"],
  },
  "estate-contact-footer": {
    contract: "Footer must use estate/contact framing with real address/contact details.",
    bans: ["utility footer", "generic CTA clone"],
  },
  "practice-contact-footer": {
    contract: "Footer must close with practice/firma contact details and one trust element.",
    bans: ["generic company footer", "links-only footer"],
  },
  "credential-footer": {
    contract: "Footer must reinforce credentials or jurisdictional trust alongside contact info.",
    bans: ["utility strip", "minimal link footer"],
  },
  "firm-closing-footer": {
    contract: "Footer must end with a direct firm closing statement plus real contact detail.",
    bans: ["sitemap only", "generic product footer"],
  },
  "studio-hours-footer": {
    contract: "Footer must include studio hours/contact and one non-link closure element.",
    bans: ["product sitemap footer", "links-only strip"],
  },
  "coach-contact-footer": {
    contract: "Footer must include coach/studio contact and one trust or schedule signal.",
    bans: ["links only", "generic company footer"],
  },
  "membership-footer": {
    contract: "Footer must carry membership/studio closure with real hours or contact context.",
    bans: ["utility strip", "four-column footer"],
  },
  "salon-hours-footer": {
    contract: "Footer must include salon hours, booking/contact details, and one non-link closure surface.",
    bans: ["generic service footer", "links-only footer"],
  },
  "brand-contact-footer": {
    contract: "Footer must include brand closure and direct contact context with one tactile non-link element.",
    bans: ["utility strip", "sitemap only"],
  },
  "ritual-closing-footer": {
    contract: "Footer must feel crafted and intimate, with contact details and a closing note.",
    bans: ["product footer", "link-only footer"],
  },
  "service-company-footer": {
    contract: "Footer must include direct contact and service/company closure, not a plain utility grid.",
    bans: ["four-column footer", "link-only closure"],
  },
  "brand-contact-footer-generic": {
    contract: "Footer must include brand closure plus real contact detail and one non-link element.",
    bans: ["utility grid", "copyright strip only"],
  },
};

export const SECTION_BLUEPRINTS: Record<SectionRole, SectionBlueprint> = {
  navbar: {
    required: [
      "brand/wordmark element",
      "navigation links (hidden on mobile via MobileNav)",
      "primary CTA using Button component",
    ],
    banned: [
      "custom hamburger state (must use MobileNav primitive)",
      "raw styled <a> or <button> for CTA",
    ],
    structure: "horizontal bar: brand left, links center/right, CTA right. Must import MobileNav.",
  },
  hero: {
    required: [
      "headline: text-4xl sm:text-5xl md:text-6xl max, font-heading",
      "supporting paragraph: text-lg or text-xl, max-w-xl or max-w-2xl",
      "primary CTA: Button component, not raw element",
      "support block: exactly ONE of stats row (3-4 items), trust badges, credential rail, feature bullets, or secondary media panel",
    ],
    banned: [
      "centered text floating on dimmed photo with no structure",
      "gradient card with pulse dot as hero visual",
      "text-7xl or larger for multi-word headlines",
      "hero with only headline + paragraph + button (missing support block)",
    ],
    structure: "split (lg:grid-cols-2) with text + media, OR immersive with overlay panel + support rail. Must have layered composition.",
  },
  story: {
    required: [
      "narrative text block with real substance",
      "supporting media (projectImages.*) or pull quote",
      "visual distinction from hero (different layout, different surface)",
    ],
    banned: [
      "stat chips only (50+ / 12 awards pattern)",
      "generic 'About Us' with no narrative",
      "same layout as hero section",
    ],
    structure: "split layout with text and media, editorial manifesto with supporting element, or two-column narrative with caption.",
  },
  services: {
    required: [
      "at least 3 distinct service/feature items",
      "clear hierarchy with one featured/highlighted item",
      "Card component if using grid layout",
    ],
    banned: [
      "3 identical cards in uniform grid as only treatment (the features trifecta)",
      "all items same size, same bg, same structure",
    ],
    structure: "editorial list with ruled items, asymmetric lanes with one dominant panel, or split layout with featured item.",
  },
  gallery: {
    required: [
      "3+ images using projectImages.*",
      "asymmetric composition (varied sizes/spans)",
      "images wrapped with aspect ratio control",
    ],
    banned: [
      "uniform 3-column equal grid (all same size)",
      "all images same aspect ratio and treatment",
    ],
    structure: "asymmetric mosaic with one dominant image + supporting frames, or captioned rail with varied crops.",
  },
  proof: {
    required: [
      "at least one named quote with real attribution",
      "credibility signal (publication, role, company)",
    ],
    banned: [
      "generic avatar testimonial cards in uniform 3-col grid",
      "same card shell as services/features section",
    ],
    structure: "editorial pull-quote band, horizontal logo/quote rail, or stacked long-form quotes. Use Testimonial primitive.",
  },
  cta: {
    required: [
      "real form (Input/Textarea) OR real contact info (email, phone, address)",
      "Button CTA component",
      "visual distinction from content sections (background shift or bordered panel)",
    ],
    banned: [
      "centered eyebrow + headline + two buttons only (no form, no contact)",
      "no form and no contact info",
    ],
    structure: "split panel with form and value copy, bordered inset band, or product-anchored CTA with structural framing.",
  },
  footer: {
    required: [
      "brand identity (logo, wordmark, or closing statement)",
      "real contact info (address, email, phone, or hours)",
      "at least one non-link element (newsletter signup, status badge, hours display)",
    ],
    banned: [
      "four-column link-only sitemap",
      "utility strip with links + copyright only",
    ],
    structure: "designed closure: brand element + contact details + non-link element + closing statement.",
  },
};

export function renderSectionBlueprintsPrompt(): string {
  const roles: SectionRole[] = ["navbar", "hero", "story", "services", "gallery", "proof", "cta", "footer"];
  const blocks = roles.map((role) => {
    const bp = SECTION_BLUEPRINTS[role];
    const required = bp.required.map((r) => `    ✓ ${r}`).join("\n");
    const banned = bp.banned.map((b) => `    ✗ ${b}`).join("\n");
    return `  ${role.toUpperCase()}:
    Structure: ${bp.structure}
    Required:
${required}
    Banned:
${banned}`;
  }).join("\n\n");

  return `=== SECTION STRUCTURAL BLUEPRINTS (BINDING) ===

Every section MUST meet its blueprint requirements. These are not suggestions — the critic enforces them.

${blocks}

If a section cannot meet its blueprint, merge its content into an adjacent section rather than emitting a non-compliant one.

=== END SECTION BLUEPRINTS ===`;
}

const DESIGN_FAMILIES: Record<DesignFamilyId, DesignFamily> = {
  editorial_luxury: {
    id: "editorial_luxury",
    label: "Editorial Luxury",
    description:
      "Restrained high-contrast editorial identity with serif display typography, deep surfaces, metallic accent control, and spacious composition.",
    typography:
      "Display uses Playfair Display with high contrast and tight tracking. Body uses Inter with compact copy blocks and discreet uppercase labels.",
    colors:
      "Deep graphite backgrounds, ivory text, muted stone surfaces, restrained brass accent, subtle warm highlights.",
    spacing:
      "Generous vertical spacing, large hero breathing room, disciplined internal card spacing, measured section transitions.",
    borders: "Thin ruled dividers, low-noise borders, large radius reserved for image frames and editorial panels only.",
    shadows: "Soft long shadows and restrained inset lines. No glows.",
    cta: "Buttons feel tailored and formal. Primary CTAs are solid with brass-toned accents or ivory-on-dark contrast.",
    imagery:
      "Cinematic framed photography, tall editorial crops, layered panels, controlled overlays, image captions and support rails.",
    motifs:
      "Ruled lines, overline labels, framed caption blocks, split editorial panels, venue-grade footer treatment.",
    cssTheme: `
:root {
  --background: 18 14% 7%;
  --foreground: 38 24% 93%;
  --card: 24 12% 11%;
  --card-foreground: 38 24% 93%;
  --popover: 24 12% 10%;
  --popover-foreground: 38 24% 93%;
  --primary: 37 54% 63%;
  --primary-foreground: 18 14% 7%;
  --secondary: 24 9% 18%;
  --secondary-foreground: 38 24% 93%;
  --muted: 24 8% 17%;
  --muted-foreground: 36 12% 69%;
  --accent: 30 20% 16%;
  --accent-foreground: 38 24% 93%;
  --border: 32 17% 23%;
  --input: 32 17% 23%;
  --ring: 37 54% 63%;
  --radius: 1.35rem;
  --font-heading: "Playfair Display", serif;
  --font-body: "Inter", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(18 14% 8%), hsl(18 14% 7%) 58%, hsl(37 54% 63% / 0.18));
  --gradient-surface: linear-gradient(180deg, hsl(24 12% 12%) 0%, hsl(18 14% 7%) 100%);
  --shadow-soft: 0 24px 60px -34px rgb(0 0 0 / 0.52);
  --shadow-card: 0 22px 55px -34px rgb(0 0 0 / 0.6);
  --shadow-card-hover: 0 30px 72px -36px rgb(0 0 0 / 0.72);
}
body {
  letter-spacing: 0.01em;
  background-image:
    radial-gradient(circle at top, hsl(var(--primary) / 0.08), transparent 28%),
    linear-gradient(180deg, hsl(18 14% 7%) 0%, hsl(18 12% 5%) 100%);
}
`,
    cssUtilities: `
.text-gradient {
  background-image: linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)));
}

.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card) / 0.98), hsl(24 12% 9% / 0.96));
  border-color: hsl(var(--border) / 0.9);
}

.surface-panel {
  background: hsl(24 12% 10% / 0.86);
  backdrop-filter: blur(18px);
  border: 1px solid hsl(var(--border) / 0.8);
}

.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.28em;
}

.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent);
}

.family-frame {
  border: 1px solid hsl(var(--border) / 0.9);
  box-shadow: inset 0 0 0 1px hsl(var(--primary) / 0.08);
}
`,
    archetypes: {
      navbar: [
        "thin venue bar with centered wordmark, restrained nav links, and one reservation Button",
        "split editorial nav with left label cluster, centered mark, right reservation rail",
      ],
      hero: [
        "split editorial panel with framed cinematic image and right-side copy rail",
        "immersive hero with offset image plane and support rail of awards or service notes",
      ],
      story: [
        "portrait-left philosophy-right narrative with pull quote and caption",
        "editorial manifesto block with inset supporting image and ruled divider",
      ],
      services: [
        "ruled editorial list with one highlighted signature item and support note",
        "tall split menu or services ledger with narrative side panel",
      ],
      gallery: [
        "asymmetric mosaic with one dominant image and stacked supporting frames",
        "cinematic gallery rail with captioned stills and narrow support strip",
      ],
      proof: [
        "press quote band with one anchor quote and smaller publication marks",
        "testimonial proof rail with one large quote and understated credibility line",
      ],
      cta: [
        "reservation or contact salon with left ritual notes and right form panel",
        "split booking panel with framed media support and formal action surface",
      ],
      footer: [
        "venue ledger footer with centered mark, address, hours, and closing line",
        "editorial footer with framed contact details and restrained divider",
      ],
    },
  },
  modern_minimal: {
    id: "modern_minimal",
    label: "Modern Minimal",
    description:
      "Clean product-grade interface language with restrained neutrals, crisp hierarchy, sharp spacing, and low-noise components.",
    typography:
      "Display uses Inter with tight leading and medium-heavy weight. Body uses Inter with compact paragraphs and data-like labels.",
    colors:
      "Neutral white or charcoal backgrounds, crisp text contrast, cool accent blue, subtle surface shifts.",
    spacing:
      "Tight and systematic. Sections use clean rhythm, consistent containers, and deliberate whitespace instead of ornament.",
    borders: "Crisp lines, controlled medium radius, sharp panels, product-shell framing.",
    shadows: "Low, precise elevation. No glow stacks.",
    cta: "Buttons are dense, crisp, and product-like with strong contrast and direct labels.",
    imagery:
      "Framed UI or documentary imagery with simple chrome, clean aspect ratios, restrained overlays, and utility-first support blocks.",
    motifs:
      "Grid texture, status dots, clean stat rails, subtle panel strokes, sharp footer closure.",
    cssTheme: `
:root {
  --background: 0 0% 99%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 224 76% 54%;
  --primary-foreground: 210 40% 98%;
  --secondary: 220 20% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 220 20% 96%;
  --muted-foreground: 220 9% 42%;
  --accent: 214 78% 96%;
  --accent-foreground: 224 76% 36%;
  --border: 220 14% 90%;
  --input: 220 14% 90%;
  --ring: 224 76% 54%;
  --radius: 1rem;
  --font-heading: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(0 0% 100%), hsl(220 30% 98%) 58%, hsl(224 76% 54% / 0.12));
  --gradient-surface: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 20% 97%) 100%);
  --shadow-soft: 0 16px 38px -30px rgb(15 23 42 / 0.14);
  --shadow-card: 0 16px 42px -28px rgb(15 23 42 / 0.12);
  --shadow-card-hover: 0 22px 50px -26px rgb(15 23 42 / 0.18);
}
body {
  background-image:
    linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(220 23% 98%) 100%);
}
`,
    cssUtilities: `
.surface-card {
  border-color: hsl(var(--border));
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(var(--secondary) / 0.78));
}

.surface-panel {
  background: hsl(var(--card) / 0.86);
  border: 1px solid hsl(var(--border));
}

.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.22em;
}

.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--border)), transparent);
}

.family-grid {
  background-image:
    linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px);
  background-size: 28px 28px;
}
`,
    archetypes: {
      navbar: [
        "clean product nav with left brand, centered utility links, right primary Button",
        "minimal nav with slim border, dense links, status chip, and right CTA",
      ],
      hero: [
        "left-copy right-visual split with product frame and stat strip",
        "centered launch statement with supporting product rail and customer proof row",
      ],
      story: [
        "single-column manifesto with offset support card",
        "two-column proof narrative with stat rail and compact media panel",
      ],
      services: [
        "non-uniform capability bands with alternating density",
        "split feature stack with one dominant capability panel and two support rows",
      ],
      gallery: [
        "product or proof rail with one large frame and smaller detail stack",
        "clean screenshot wall with caption rail and varied spans",
      ],
      proof: [
        "editorial quote band with logo strip",
        "horizontal proof rail with one anchor quote and supporting metrics",
      ],
      cta: [
        "split conversion panel with left value copy and right compact form",
        "product-anchored signup shell with bordered inset panel",
      ],
      footer: [
        "tight product footer with status badge, update field, and lean links",
        "minimal footer with closing line, compact utilities, and one signal panel",
      ],
    },
  },
  bold_commercial: {
    id: "bold_commercial",
    label: "Bold Commercial",
    description:
      "High-contrast sales-driven identity with assertive typography, energetic density, strong CTA surfaces, and proof-heavy section transitions.",
    typography:
      "Display uses Bebas Neue or condensed sans treatment. Body uses Barlow for direct, high-legibility marketing copy.",
    colors:
      "Charcoal or off-white base with strong action accent in amber, red, or electric blue. Secondary surfaces stay dense and contrast-heavy.",
    spacing:
      "Compact hero density, punchy section spacing, tighter copy blocks, large proof numbers, strong rhythm shifts.",
    borders: "Hard edges, medium radius, assertive strokes, framed proof blocks.",
    shadows: "Punchier elevation and strong panel separation.",
    cta: "Buttons are aggressive and direct. Labels are short. Action surfaces feel sales-ready, not ornamental.",
    imagery:
      "Large proof-led visuals, diagonal or staggered framing, industrial or commercial realism, stat overlays.",
    motifs:
      "Metric bands, contrast stripes, heavy dividers, badge clusters, blocky footers.",
    cssTheme: `
:root {
  --background: 222 29% 8%;
  --foreground: 210 40% 98%;
  --card: 222 26% 12%;
  --card-foreground: 210 40% 98%;
  --popover: 222 26% 11%;
  --popover-foreground: 210 40% 98%;
  --primary: 28 94% 57%;
  --primary-foreground: 222 29% 8%;
  --secondary: 220 19% 18%;
  --secondary-foreground: 210 40% 98%;
  --muted: 220 19% 18%;
  --muted-foreground: 215 16% 70%;
  --accent: 18 86% 52%;
  --accent-foreground: 210 40% 98%;
  --border: 217 15% 24%;
  --input: 217 15% 24%;
  --ring: 28 94% 57%;
  --radius: 0.9rem;
  --font-heading: "Bebas Neue", "Barlow", system-ui, sans-serif;
  --font-body: "Barlow", system-ui, sans-serif;
  --gradient-hero: linear-gradient(125deg, hsl(222 29% 8%), hsl(222 24% 10%) 54%, hsl(28 94% 57% / 0.18));
  --gradient-surface: linear-gradient(180deg, hsl(222 26% 12%) 0%, hsl(222 29% 8%) 100%);
  --shadow-soft: 0 20px 52px -32px rgb(0 0 0 / 0.42);
  --shadow-card: 0 18px 48px -28px rgb(0 0 0 / 0.5);
  --shadow-card-hover: 0 26px 64px -28px rgb(0 0 0 / 0.66);
}
body {
  background-image:
    radial-gradient(circle at top right, hsl(var(--primary) / 0.12), transparent 22%),
    linear-gradient(180deg, hsl(222 29% 8%) 0%, hsl(222 31% 7%) 100%);
}
h1, h2, h3, h4 {
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
`,
    cssUtilities: `
.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(222 24% 10%));
  border-color: hsl(var(--border));
}

.surface-panel {
  background: hsl(222 26% 11% / 0.9);
  border: 1px solid hsl(var(--border));
}

.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.24em;
}

.family-divider {
  height: 2px;
  background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)));
}

.family-band {
  background-image: linear-gradient(90deg, hsl(var(--primary) / 0.16), transparent 42%);
}
`,
    archetypes: {
      navbar: [
        "hard-edged top bar with left brand, bold nav, and assertive quote/demo Button",
        "commercial nav with utility proof badges and right CTA block",
      ],
      hero: [
        "proof-led split hero with large stat band and right commercial image plane",
        "diagonal or offset hero with dense copy stack, Button cluster, and metric strip",
      ],
      story: [
        "operator narrative with metric rail and industrial support panel",
        "split authority block with image left and credential stack right",
      ],
      services: [
        "asymmetric trade or feature lanes with one dominant card and stacked support lanes",
        "commercial service matrix with hard separators and price/scope support",
      ],
      gallery: [
        "proof wall with one hero project and smaller evidence cards",
        "staggered commercial gallery with value badges and overlay facts",
      ],
      proof: [
        "heavy metric band with one customer or client pull quote",
        "credential strip with badges, guarantees, and one anchor testimonial",
      ],
      cta: [
        "quote or signup split with real form shell and support assurances",
        "commercial conversion band with left offer copy and right form frame",
      ],
      footer: [
        "blocky footer with service area, trust signals, and direct contact rail",
        "commercial footer with closing statement and hard-divider columns",
      ],
    },
  },
  warm_artisan: {
    id: "warm_artisan",
    label: "Warm Artisan",
    description:
      "Craft-led identity with softer earthy tones, tactile surfaces, organic spacing, and intimate storytelling.",
    typography:
      "Display uses Playfair Display. Body uses Barlow or Inter with warm spacing and softer line lengths.",
    colors:
      "Cream, clay, cocoa, olive, and muted terracotta. Surfaces feel tactile instead of glossy.",
    spacing:
      "Relaxed but deliberate. Sections open with breathing room and intimate narrative blocks.",
    borders: "Soft lines, slightly larger radius, tactile panels, subtle inset frames.",
    shadows: "Warm low-contrast depth.",
    cta: "Buttons feel inviting and crafted, with warm contrast and soft but confident structure.",
    imagery:
      "Natural light, organic crop ratios, craft process details, ingredient or maker context, softer framing.",
    motifs:
      "Texture hints, soft dividers, caption notes, craft badges, warm footer closure.",
    cssTheme: `
:root {
  --background: 36 44% 97%;
  --foreground: 18 18% 19%;
  --card: 33 33% 94%;
  --card-foreground: 18 18% 19%;
  --popover: 36 44% 97%;
  --popover-foreground: 18 18% 19%;
  --primary: 21 58% 42%;
  --primary-foreground: 36 44% 97%;
  --secondary: 34 26% 89%;
  --secondary-foreground: 18 18% 19%;
  --muted: 34 26% 89%;
  --muted-foreground: 24 12% 41%;
  --accent: 85 18% 58%;
  --accent-foreground: 18 18% 19%;
  --border: 28 21% 80%;
  --input: 28 21% 80%;
  --ring: 21 58% 42%;
  --radius: 1.4rem;
  --font-heading: "Playfair Display", serif;
  --font-body: "Barlow", system-ui, sans-serif;
  --gradient-hero: linear-gradient(135deg, hsl(36 44% 97%), hsl(34 32% 93%) 54%, hsl(21 58% 42% / 0.12));
  --gradient-surface: linear-gradient(180deg, hsl(36 44% 97%) 0%, hsl(34 26% 92%) 100%);
  --shadow-soft: 0 18px 44px -30px rgb(90 63 42 / 0.22);
  --shadow-card: 0 18px 46px -30px rgb(90 63 42 / 0.2);
  --shadow-card-hover: 0 24px 58px -30px rgb(90 63 42 / 0.26);
}
body {
  background-image:
    radial-gradient(circle at top, hsl(var(--accent) / 0.18), transparent 28%),
    linear-gradient(180deg, hsl(36 44% 97%) 0%, hsl(34 36% 95%) 100%);
}
`,
    cssUtilities: `
.surface-card {
  background-image: linear-gradient(180deg, hsl(var(--card)), hsl(34 26% 92% / 0.92));
  border-color: hsl(var(--border));
}

.surface-panel {
  background: hsl(var(--card) / 0.88);
  border: 1px solid hsl(var(--border));
}

.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.22em;
}

.family-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.55), transparent);
}

.family-kicker {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}
`,
    archetypes: {
      navbar: [
        "craft-led nav with left wordmark, intimate section links, and one booking or inquiry Button",
        "soft framed nav with centered brand and right crafted CTA",
      ],
      hero: [
        "warm split hero with natural-light image and right narrative panel",
        "artisan hero with framed process image, support badges, and intimate CTA rail",
      ],
      story: [
        "maker story with portrait/process image and warm manifesto block",
        "two-column craft narrative with caption strip and pull quote",
      ],
      services: [
        "crafted service or menu ledger with notes, prices, and one featured panel",
        "soft lane layout with one dominant offer and stacked support details",
      ],
      gallery: [
        "organic mosaic with ingredient/process/detail imagery",
        "natural-light gallery rail with caption notes and varied crops",
      ],
      proof: [
        "quiet testimonial band with one anchor quote and craft markers",
        "community proof strip with one large quote and two supporting notes",
      ],
      cta: [
        "warm reservation or inquiry panel with left details and right form",
        "soft split CTA with framed image and crafted action surface",
      ],
      footer: [
        "warm footer with address, hours, inquiry line, and closing note",
        "craft ledger footer with understated rules and contact details",
      ],
    },
  },
};

const NICHE_FAMILY_POOLS: Record<Niche, DesignFamilyId[]> = {
  restaurant: ["editorial_luxury", "warm_artisan"],
  saas: ["modern_minimal", "bold_commercial"],
  construction: ["bold_commercial", "modern_minimal"],
  agency: ["modern_minimal", "editorial_luxury"],
  portfolio: ["editorial_luxury", "modern_minimal"],
  realEstate: ["editorial_luxury", "modern_minimal"],
  law: ["editorial_luxury", "modern_minimal"],
  fitness: ["bold_commercial", "modern_minimal"],
  beauty: ["warm_artisan", "editorial_luxury"],
  generic: ["editorial_luxury", "modern_minimal", "warm_artisan", "bold_commercial"],
};

function scoreFamily(brief: string, familyId: DesignFamilyId): number {
  const lower = brief.toLowerCase();
  const keywordMap: Record<DesignFamilyId, string[]> = {
    editorial_luxury: [
      "luxury", "editorial", "fine dining", "serif", "elegant", "high-end", "premium",
      "michelin", "upscale", "bespoke", "exclusive", "refined", "sophisticated", "venue",
      "estate", "curated", "gallery", "art", "studio", "architect", "jewel", "wine",
      "fancy", "beautiful", "cinematic", "fashion", "campaign", "luxurious", "statement",
    ],
    modern_minimal: [
      "minimal", "clean", "modern", "saas", "software", "product", "app", "launch",
      "startup", "tech", "platform", "dashboard", "analytics", "api", "developer",
      "cloud", "automation", "workspace", "productivity", "tool", "interface",
    ],
    bold_commercial: [
      "construction", "contractor", "industrial", "commercial", "sales", "fast", "roi", "performance",
      "roofing", "plumbing", "hvac", "trucking", "fleet", "logistics", "manufacturing",
      "concrete", "demolition", "excavation", "paving", "electric", "solar", "trade",
    ],
    warm_artisan: [
      "artisan", "warm", "organic", "craft", "boutique", "cozy", "handmade", "seasonal",
      "bakery", "cafe", "pottery", "florist", "local", "farm", "garden", "wellness",
      "yoga", "spa", "holistic", "vintage", "workshop", "maker", "natural", "fancy",
    ],
  };

  return keywordMap[familyId].reduce(
    (score, keyword) => (lower.includes(keyword) ? score + 2 : score),
    0
  );
}

function hashBrief(brief: string): number {
  let hash = 0;
  for (let i = 0; i < brief.length; i += 1) {
    hash = (hash * 31 + brief.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function pickVariant<T>(seed: string, options: readonly T[]): T {
  return options[hashBrief(seed) % options.length];
}

function inferDensityMode(brief: string, family: DesignFamilyId): WebsiteVariantPlan["densityMode"] {
  const lower = brief.toLowerCase();
  if (/\b(dense|high-converting|commercial|technical|comparison|specs?)\b/.test(lower)) {
    return "dense";
  }
  if (/\b(luxury|calm|editorial|minimal|boutique|artisan|refined)\b/.test(lower)) {
    return "airy";
  }
  if (family === "bold_commercial") return "dense";
  if (family === "editorial_luxury" || family === "warm_artisan") return "airy";
  return "balanced";
}

function inferContrastMode(brief: string, family: DesignFamilyId): WebsiteVariantPlan["contrastMode"] {
  const lower = brief.toLowerCase();
  if (/\b(high contrast|bold|dramatic|dark|cinematic|industrial)\b/.test(lower)) {
    return "high";
  }
  if (/\b(soft|warm|quiet|organic|subtle|minimal)\b/.test(lower)) {
    return "soft";
  }
  if (family === "bold_commercial" || family === "editorial_luxury") return "high";
  if (family === "warm_artisan") return "soft";
  return "balanced";
}

function resolveImageStrategy(
  niche: Niche,
  designFamily: DesignFamilyId,
  uploadedImageUrls?: string[]
): WebsiteVariantPlan["imageStrategy"] {
  if ((uploadedImageUrls?.length ?? 0) > 0) {
    return "uploaded";
  }

  const hasCurated =
    !!findLocalImage(niche, "hero", designFamily) ||
    !!findLocalImage(niche, "support", designFamily) ||
    !!findLocalImage(niche, "gallery1", designFamily);

  return hasCurated ? "curated-local" : "approved-fallback";
}

function directiveFor(map: VariantDirectiveMap, key: string): { contract: string; bans: string[] } {
  return map[key] ?? {
    contract: `Preserve the selected variant shape for ${key}.`,
    bans: ["generic fallback patterns"],
  };
}

export function planWebsiteVariant(params: VariantPlannerParams): WebsiteVariantPlan {
  const choreography = pickVariant(
    `${params.niche}:${params.designFamily}:${params.brief}:choreo`,
    CHOREOGRAPHIES_BY_NICHE[params.niche]
  );

  return {
    designFamily: params.designFamily,
    heroVariant: pickVariant(
      `${params.niche}:${params.designFamily}:${params.brief}:hero`,
      HERO_VARIANTS_BY_NICHE[params.niche]
    ),
    sectionChoreography: choreography.key,
    bodyRoleSequence: choreography.roles,
    proofVariant: pickVariant(
      `${params.niche}:${params.designFamily}:${params.brief}:proof`,
      PROOF_VARIANTS_BY_NICHE[params.niche]
    ),
    featureVariant: pickVariant(
      `${params.niche}:${params.designFamily}:${params.brief}:feature`,
      FEATURE_VARIANTS_BY_NICHE[params.niche]
    ),
    ctaVariant: pickVariant(
      `${params.niche}:${params.designFamily}:${params.brief}:cta`,
      CTA_VARIANTS_BY_NICHE[params.niche]
    ),
    footerVariant: pickVariant(
      `${params.niche}:${params.designFamily}:${params.brief}:footer`,
      FOOTER_VARIANTS_BY_NICHE[params.niche]
    ),
    imageStrategy: resolveImageStrategy(
      params.niche,
      params.designFamily,
      params.uploadedImageUrls
    ),
    densityMode: inferDensityMode(params.brief, params.designFamily),
    contrastMode: inferContrastMode(params.brief, params.designFamily),
  };
}

export function renderVariantPlanPrompt(plan: WebsiteVariantPlan): string {
  const hero = directiveFor(HERO_VARIANT_DIRECTIVES, plan.heroVariant);
  const proof = directiveFor(PROOF_VARIANT_DIRECTIVES, plan.proofVariant);
  const feature = directiveFor(FEATURE_VARIANT_DIRECTIVES, plan.featureVariant);
  const cta = directiveFor(CTA_VARIANT_DIRECTIVES, plan.ctaVariant);
  const footer = directiveFor(FOOTER_VARIANT_DIRECTIVES, plan.footerVariant);
  const imageStrategyLine =
    plan.imageStrategy === "uploaded"
      ? "Use uploaded images as the primary visual source. Do not replace them with placeholders or generic generated imagery."
      : plan.imageStrategy === "curated-local"
        ? "Use local curated niche imagery as the primary source where media is needed. Do not drift to placeholder-only media."
        : "No uploaded or curated image source is available. Use the approved fallback visual strategy deliberately and keep media shells purposeful.";

  return `=== BINDING VARIANT PLAN (LOCK BEFORE CODEGEN) ===

This plan is pre-selected. It is a binding first-pass layout and composition contract, not inspiration text.
Do not swap these variants during generation. Do not flatten them during repair.

VARIANT AXES:
- designFamily: ${plan.designFamily}
- heroVariant: ${plan.heroVariant}
- sectionChoreography: ${plan.sectionChoreography}
- proofVariant: ${plan.proofVariant}
- featureVariant: ${plan.featureVariant}
- ctaVariant: ${plan.ctaVariant}
- footerVariant: ${plan.footerVariant}
- imageStrategy: ${plan.imageStrategy}
- densityMode: ${plan.densityMode}
- contrastMode: ${plan.contrastMode}

MIDDLE-SECTION ROLE ORDER:
- ${plan.bodyRoleSequence.join(" -> ")}
- If section-count limits force merges, preserve this relative order exactly.

HERO CONTRACT:
- ${hero.contract}
- Banned hero fallbacks: ${hero.bans.join("; ")}

PROOF CONTRACT:
- ${proof.contract}
- Banned proof fallbacks: ${proof.bans.join("; ")}

FEATURE / SERVICES CONTRACT:
- ${feature.contract}
- Banned feature fallbacks: ${feature.bans.join("; ")}

CTA CONTRACT:
- ${cta.contract}
- Banned CTA fallbacks: ${cta.bans.join("; ")}

FOOTER CONTRACT:
- ${footer.contract}
- Banned footer fallbacks: ${footer.bans.join("; ")}

IMAGE STRATEGY CONTRACT:
- ${imageStrategyLine}
- Hero media, support media, and gallery media must follow this strategy consistently on the first pass.

GLOBAL VARIANT RULES:
- Density mode must visibly affect spacing, card count, and information packing.
- Contrast mode must visibly affect surface contrast and typographic punch, not just metadata text.
- Do not collapse to the generic skeleton of split hero -> three equal cards -> centered CTA stripe -> four-column footer.
- Repair may fix violations, but it must preserve this variant family and choreography.

=== END BINDING VARIANT PLAN ===`;
}

export function getDesignFamily(id: DesignFamilyId): DesignFamily {
  return DESIGN_FAMILIES[id];
}

export function selectDesignFamily(niche: Niche, brief: string): DesignFamilyId {
  const pool = NICHE_FAMILY_POOLS[niche] ?? NICHE_FAMILY_POOLS.generic;
  const scored = pool
    .map((id) => ({ id, score: scoreFamily(brief, id) }))
    .sort((a, b) => b.score - a.score);

  if (scored[0] && scored[0].score > scored[1]?.score) {
    return scored[0].id;
  }

  return pool[hashBrief(`${niche}:${brief}`) % pool.length];
}

export function renderDesignFamilyPrompt(id: DesignFamilyId): string {
  const family = DESIGN_FAMILIES[id];

  return `=== DESIGN FAMILY (BINDING) ===

Selected family: ${family.id} (${family.label})

This family is selected programmatically before generation. It is not optional. Every section must belong to this family.

FAMILY DESCRIPTION:
${family.description}

TYPOGRAPHY SYSTEM:
${family.typography}

COLOR SYSTEM:
${family.colors}

SPACING RHYTHM:
${family.spacing}

BORDER + RADIUS RULES:
${family.borders}

SHADOW RULES:
${family.shadows}

CTA STYLE:
${family.cta}

IMAGE FRAMING STYLE:
${family.imagery}

MOTIF SYSTEM:
${family.motifs}

PROJECT-WIDE CONSISTENCY RULES:
- Use one coherent heading treatment across all sections.
- Use one coherent CTA treatment across all sections.
- Reuse one spacing cadence across all sections.
- Reuse one image framing language across all sections.
- Reuse the same divider/accent motif across all sections.
- Do not mix families or import visual grammar from another family.
`;
}

function pickArchetype(
  familyId: DesignFamilyId,
  role: SectionRole,
  brief: string
): string {
  const family = DESIGN_FAMILIES[familyId];
  const options = family.archetypes[role];
  return options[hashBrief(`${brief}:${familyId}:${role}`) % options.length];
}

export function renderSectionArchetypesPrompt(
  niche: Niche,
  familyId: DesignFamilyId,
  brief: string
): string {
  const roles: SectionRole[] = [
    "navbar",
    "hero",
    "story",
    "services",
    "gallery",
    "proof",
    "cta",
    "footer",
  ];

  const lines = roles
    .map((role) => `- ${role}: ${pickArchetype(familyId, role, `${niche}:${brief}`)}`)
    .join("\n");

  return `=== SECTION ARCHETYPE CONTRACT (BINDING) ===

Do NOT invent section structure freehand. Use these selected archetypes as the structural contract for this build.

${lines}

RULES:
- Preserve the chosen archetype's layout skeleton.
- Adapt content, copy, and niche details to the brief.
- Preserve the family's motif, CTA style, image framing, and spacing rhythm inside every archetype.
- If a section type is not present, merge its responsibility into the closest neighboring archetype without changing the family grammar.
`;
}

export function getDesignFamilyCss(id: DesignFamilyId): string {
  const family = DESIGN_FAMILIES[id];
  return `${family.cssTheme}
@layer utilities {
${family.cssUtilities}
}`;
}

export type GeneratedImageSpec = {
  key:
    | "hero"
    | "support"
    | "gallery1"
    | "gallery2"
    | "gallery3"
    | "detail1";
  path: string;
  prompt: string;
  role: string;
  aspectRatio: "16:10" | "4:5" | "3:2" | "1:1";
};

function nicheImageSubjects(
  brief: string,
  niche: Niche
): {
  hero: string;
  support: string;
  gallery: string;
  detail: string;
} {
  const lowerBrief = brief.toLowerCase();

  if (niche === "generic" && /\b(hotel|resort|inn|lodge|suite|boutique stay|hospitality)\b/.test(lowerBrief)) {
    return {
      hero: "luxury boutique hotel exterior, suite, or destination-led hospitality scene with real atmosphere",
      support: "guest experience, room detail, lounge, spa, or concierge-led hospitality vignette",
      gallery: "destination, suite, amenities, dining, or editorial travel imagery with premium hospitality framing",
      detail: "textural hotel detail such as linen, bath, key card, terrace, or in-room object with travel editorial styling",
    };
  }

  switch (niche) {
    case "restaurant":
      return {
        hero: "cinematic fine-dining atmosphere or plated signature dish in service context",
        support: "chef, kitchen ritual, or private dining vignette",
        gallery: "dining room, plating, ingredient, bar, or service still",
        detail: "close-up culinary detail with editorial framing",
      };
    case "saas":
      return {
        hero: "high-fidelity product UI inside a real application shell, not a stock photo",
        support: "product workflow, analytics panel, or automation interface detail",
        gallery: "distinct product views, dashboards, workflows, or customer proof screens",
        detail: "close-up product workflow or team-in-context supporting visual",
      };
    case "construction":
      return {
        hero: "active construction project, commercial build, or completed structure with real scale",
        support: "crew process, site planning, or material/progress detail",
        gallery: "completed projects, build phases, site documentation, or trade detail",
        detail: "architectural or materials detail shot with commercial realism",
      };
    case "agency":
      return {
        hero: "client work collage, studio process scene, or editorial brand composition",
        support: "studio detail, campaign still, or project proof panel",
        gallery: "delivered work, mockups, process boards, and editorial project frames",
        detail: "close-up brand or campaign artifact with premium editorial styling",
      };
    default:
      return {
        hero: "hero visual aligned with the niche and selected design family",
        support: "supporting narrative visual aligned with the brief",
        gallery: "gallery still aligned with the niche and family",
        detail: "detail visual aligned with the niche and family",
      };
  }
}

export function buildGeneratedImageSpecs(
  brief: string,
  niche: Niche,
  familyId: DesignFamilyId
): GeneratedImageSpec[] {
  const family = getDesignFamily(familyId);
  const subject = nicheImageSubjects(brief, niche);
  const familyStyle = `${family.label}. ${family.imagery} ${family.motifs}`;
  const briefContext = `Project brief: ${brief}.`;
  const sharedRules =
    "No text, no logos, no watermarks, no empty stage-set compositions, and maintain one coherent art direction. Deliver complete, art-directed imagery with strong focal hierarchy and usable crop space.";

  return [
    {
      key: "hero",
      path: "generated/hero.png",
      role: "hero",
      aspectRatio: "16:10",
      prompt: `${briefContext} Create the hero image for a ${niche} website in the ${family.label} family. Subject: ${subject.hero}. Style: ${familyStyle} This must feel like finished hero photography or a finished product render, not a placeholder panel. Leave intentional negative space for adjacent headline copy. ${sharedRules}`,
    },
    {
      key: "support",
      path: "generated/support.png",
      role: "support",
      aspectRatio: "4:5",
      prompt: `${briefContext} Create a supporting image for a ${niche} website in the ${family.label} family. Subject: ${subject.support}. Style must match the hero image, but use a distinct composition and crop. This image should carry a story/about/process section, not repeat the hero framing. ${sharedRules}`,
    },
    {
      key: "gallery1",
      path: "generated/gallery-1.png",
      role: "gallery",
      aspectRatio: "3:2",
      prompt: `${briefContext} Create gallery image 1 for a ${niche} website in the ${family.label} family. Subject: ${subject.gallery}. Match the same palette and framing language. This should be the strongest proof/showcase image after the hero. ${sharedRules}`,
    },
    {
      key: "gallery2",
      path: "generated/gallery-2.png",
      role: "gallery",
      aspectRatio: "3:2",
      prompt: `${briefContext} Create gallery image 2 for a ${niche} website in the ${family.label} family. Subject: ${subject.gallery}. Keep the same visual grammar but vary the scene, distance, and angle. ${sharedRules}`,
    },
    {
      key: "gallery3",
      path: "generated/gallery-3.png",
      role: "gallery",
      aspectRatio: "3:2",
      prompt: `${briefContext} Create gallery image 3 for a ${niche} website in the ${family.label} family. Subject: ${subject.gallery}. Keep the same visual grammar but vary the crop and distance. This should work as a secondary supporting proof image, not another hero. ${sharedRules}`,
    },
    {
      key: "detail1",
      path: "generated/detail-1.png",
      role: "detail",
      aspectRatio: "1:1",
      prompt: `${briefContext} Create a detail image for a ${niche} website in the ${family.label} family. Subject: ${subject.detail}. Keep the same palette and motif language. This should be a tactile close-up or focused inset that enriches a section, not a generic filler crop. ${sharedRules}`,
    },
  ];
}

export function renderGeneratedImagePrompt(
  brief: string,
  niche: Niche,
  familyId: DesignFamilyId
): string {
  const specs = buildGeneratedImageSpecs(brief, niche, familyId);
  const lines = specs
    .map(
      (spec) =>
        `- ${spec.key} (${spec.role}, ${spec.aspectRatio}) -> ${spec.path}\n  ${spec.prompt}`
    )
    .join("\n");

  return `=== GENERATED IMAGE CONTRACT (BINDING) ===

All site imagery comes from Cenate's generated image pipeline. Do NOT use Unsplash. Do NOT use any third-party stock URL. Do NOT use remote placeholder images.

Use ONLY these local asset references in section components:
- projectImages.hero
- projectImages.support
- projectImages.gallery1
- projectImages.gallery2
- projectImages.gallery3
- projectImages.detail1

The generated image module is injected automatically at:
- src/assets/generated-images.ts

Generated image plan:
${lines}

IMAGE RULES:
- Hero must use projectImages.hero as the primary media surface when the section includes media.
- Gallery/proof/media sections should use projectImages.gallery1/gallery2/gallery3 and projectImages.detail1.
- Story/about/process sections should use projectImages.support or projectImages.detail1.
- All image usage must stay local. No external URLs in component code.
`;
}
