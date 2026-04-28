/**
 * Niche starter bases — Phase 5.
 *
 * Controlled starting structures for the SAME project-manifest generation
 * path. NOT a second generator. NOT a second runtime. NOT a duplicate.
 *
 * Each starter base provides a concrete structural scaffold that the
 * model uses as its starting point rather than inventing from scratch.
 * This eliminates the "generic AI template" problem by pre-defining:
 *  - exact component file list
 *  - section composition instructions (not just names)
 *  - hero structure
 *  - footer/CTA structure
 *  - motion defaults
 *  - image placement instructions
 *
 * The starter base is injected into the prompt as a structural scaffold.
 * The model fills in the actual code. It does NOT receive pre-written
 * component code — that would be a template system, not generation.
 */

import type { Niche } from "./niche-router";
import type { WebsiteVariantPlan } from "./design-families";

export type StarterBase = {
  niche: Niche;
  name: string;
  componentFiles: string[];
  scaffoldInstructions: string;
};

export type VariantComponentRole =
  | "navbar"
  | "hero"
  | WebsiteVariantPlan["bodyRoleSequence"][number]
  | "footer";

export type VariantComponentEntry = {
  role: VariantComponentRole;
  componentName: string;
  filePath: string;
};

export type SectionFamilyRule = {
  role: VariantComponentRole;
  preferredComponentName: string;
  preferredFilePath: string;
  allowedComponentNames: string[];
  disallowedComponentNames: string[];
  preferredFallbackName: string;
};

const STORY_COMPONENT_BY_NICHE: Record<Niche, string> = {
  restaurant: "ChefStory",
  saas: "WorkflowNarrative",
  construction: "CompanyStory",
  agency: "StudioPerspective",
  portfolio: "AboutStatement",
  realEstate: "MarketStory",
  law: "AuthorityStory",
  fitness: "CoachStory",
  beauty: "BrandStory",
  generic: "Story",
};

const GALLERY_COMPONENT_BY_NICHE: Record<Niche, string> = {
  restaurant: "AtmosphereGallery",
  saas: "ProductGallery",
  construction: "ProjectGallery",
  agency: "ShowcaseGallery",
  portfolio: "SelectedWorkGallery",
  realEstate: "PropertyGallery",
  law: "CaseGallery",
  fitness: "TransformationGallery",
  beauty: "RitualGallery",
  generic: "ShowcaseGallery",
};

const FEATURE_COMPONENT_BY_VARIANT: Record<string, string> = {
  "editorial-menu-ledger": "MenuLedger",
  "signature-course-feature": "SignatureFeature",
  "ritual-story-lanes": "RitualStoryLanes",
  "alternating-workflow-rows": "WorkflowRows",
  "dense-product-grid": "ProductGrid",
  "teardown-callout-band": "TeardownBand",
  "service-lanes-with-highlight": "ServiceLanes",
  "timeline-capabilities": "CapabilityTimeline",
  "project-scope-matrix": "ScopeMatrix",
  "asymmetric-case-cards": "CaseCards",
  "editorial-story-sections": "EditorialStorySections",
  "alternating-media-rows": "AlternatingMediaRows",
  "stacked-case-study": "StackedCaseStudy",
  "asymmetric-project-index": "ProjectIndex",
  "property-type-rows": "PropertyTypeRows",
  "listing-grid-with-anchor": "ListingGrid",
  "neighborhood-story-bands": "NeighborhoodStoryBands",
  "practice-area-lanes": "PracticeAreaLanes",
  "case-study-rows": "CaseStudyRows",
  "program-lanes": "ProgramLanes",
  "coach-led-feature-rows": "CoachFeatureRows",
  "transformation-grid-with-anchor": "TransformationGrid",
  "ritual-lanes": "RitualLanes",
  "asymmetric-offer-cards": "OfferCards",
  "ingredient-story-rows": "IngredientStoryRows",
  "asymmetric-cards": "AsymmetricCards",
};

const PROOF_COMPONENT_BY_VARIANT: Record<string, string> = {
  "critic-pull-quote": "CriticQuote",
  "press-proof-band": "PressProofBand",
  "named-guest-quote": "GuestQuote",
  "metrics-band": "MetricsBand",
  "logo-quote-rail": "LogoQuoteRail",
  "case-study-strip": "CaseStudyStrip",
  "metric-band": "MetricBand",
  "credential-strip": "CredentialStrip",
  "project-proof-band": "ProjectProofBand",
  "selective-attributed-quote": "AttributedQuote",
  "editorial-proof-band": "EditorialProofBand",
  "press-mention-strip": "PressMentionStrip",
  "market-metrics-band": "MarketMetricsBand",
  "client-proof-band": "ClientProofBand",
  "listing-results-strip": "ListingResultsStrip",
  "case-result-band": "CaseResultBand",
  "attributed-client-quote": "ClientQuote",
  "transformation-metrics-band": "TransformationMetricsBand",
  "member-proof-strip": "MemberProofStrip",
  "coach-credential-band": "CoachCredentialBand",
  "client-quote-band": "ClientQuoteBand",
  "editorial-proof-strip": "EditorialProofStrip",
  "brand-trust-band": "BrandTrustBand",
  "attributed-quote-band": "AttributedQuoteBand",
};

const CTA_COMPONENT_BY_VARIANT: Record<string, string> = {
  "booking-panel": "BookingPanel",
  "reservation-form-first": "ReservationForm",
  "private-dining-contact": "PrivateDiningContact",
  "framed-conversion-panel": "ConversionPanel",
  "form-first-signup": "SignupFormPanel",
  "dual-path-demo": "DemoPaths",
  "estimate-form-panel": "EstimatePanel",
  "call-now-split-cta": "CallNowSplit",
  "service-area-booking": "ServiceAreaBooking",
  "project-brief-panel": "ProjectBriefPanel",
  "consultation-form-first": "ConsultationForm",
  "dual-path-engagement": "EngagementPaths",
  "letter-format-contact": "ContactLetter",
  "left-aligned-invitation": "InvitationPanel",
  "project-inquiry-panel": "ProjectInquiryPanel",
  "consultation-form-panel": "ConsultationPanel",
  "tour-booking-cta": "TourBookingPanel",
  "agent-contact-panel": "AgentContactPanel",
  "consultation-intake-panel": "ConsultationIntakePanel",
  "call-now-contact-block": "CallNowBlock",
  "case-review-form-first": "CaseReviewForm",
  "trial-booking-panel": "TrialBookingPanel",
  "plan-selection-cta": "PlanSelectionPanel",
  "coach-contact-split": "CoachContactSplit",
  "appointment-booking-panel": "AppointmentBookingPanel",
  "form-first-cta": "FormFirstCta",
  "contact-panel": "ContactPanel",
};

const FOOTER_COMPONENT_BY_VARIANT: Record<string, string> = {
  "venue-contact-footer": "VenueContactFooter",
  "editorial-closing-footer": "EditorialClosingFooter",
  "reservation-led-footer": "ReservationFooter",
  "product-signal-footer": "ProductSignalFooter",
  "brand-and-status-footer": "BrandStatusFooter",
  "lean-product-footer": "LeanProductFooter",
  "service-area-footer": "ServiceAreaFooter",
  "commercial-contact-footer": "CommercialContactFooter",
  "trust-signal-footer": "TrustSignalFooter",
  "studio-contact-footer": "StudioContactFooter",
  "editorial-signature-footer": "EditorialSignatureFooter",
  "brand-closure-footer": "BrandClosureFooter",
  "authored-signature-footer": "AuthoredSignatureFooter",
  "editorial-contact-footer": "EditorialContactFooter",
  "agent-contact-footer": "AgentContactFooter",
  "listing-brand-footer": "ListingBrandFooter",
  "estate-contact-footer": "EstateContactFooter",
  "practice-contact-footer": "PracticeContactFooter",
  "credential-footer": "CredentialFooter",
  "firm-closing-footer": "FirmClosingFooter",
  "studio-hours-footer": "StudioHoursFooter",
  "coach-contact-footer": "CoachContactFooter",
  "membership-footer": "MembershipFooter",
  "salon-hours-footer": "SalonHoursFooter",
  "brand-contact-footer": "BrandContactFooter",
  "ritual-closing-footer": "RitualClosingFooter",
  "service-company-footer": "ServiceCompanyFooter",
};

const STORY_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["ChefStory"],
  saas: ["WorkflowNarrative"],
  construction: ["CompanyStory"],
  agency: ["StudioPerspective"],
  portfolio: ["AboutStatement"],
  realEstate: ["MarketStory"],
  law: ["AuthorityStory"],
  fitness: ["CoachStory"],
  beauty: ["BrandStory"],
  generic: ["Story"],
};

const GALLERY_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["AtmosphereGallery"],
  saas: ["ProductGallery"],
  construction: ["ProjectGallery"],
  agency: ["ShowcaseGallery"],
  portfolio: ["SelectedWorkGallery"],
  realEstate: ["PropertyGallery"],
  law: ["CaseGallery"],
  fitness: ["TransformationGallery"],
  beauty: ["RitualGallery"],
  generic: ["ShowcaseGallery"],
};

const FEATURE_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["MenuLedger", "SignatureFeature", "RitualStoryLanes"],
  saas: ["WorkflowRows", "ProductGrid", "TeardownBand"],
  construction: ["ServiceLanes", "CapabilityTimeline", "ScopeMatrix"],
  agency: ["CaseCards", "EditorialStorySections", "AlternatingMediaRows"],
  portfolio: ["StackedCaseStudy", "ProjectIndex", "EditorialStorySections"],
  realEstate: ["PropertyTypeRows", "ListingGrid", "NeighborhoodStoryBands"],
  law: ["PracticeAreaLanes", "CapabilityTimeline", "CaseStudyRows"],
  fitness: ["ProgramLanes", "CoachFeatureRows", "TransformationGrid"],
  beauty: ["RitualLanes", "OfferCards", "IngredientStoryRows"],
  generic: ["AlternatingMediaRows", "AsymmetricCards", "EditorialStorySections"],
};

const PROOF_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["CriticQuote", "PressProofBand", "GuestQuote"],
  saas: ["MetricsBand", "LogoQuoteRail", "CaseStudyStrip"],
  construction: ["MetricBand", "CredentialStrip", "ProjectProofBand"],
  agency: ["CaseStudyStrip", "LogoQuoteRail", "EditorialProofBand"],
  portfolio: ["AttributedQuote", "EditorialProofBand", "PressMentionStrip"],
  realEstate: ["MarketMetricsBand", "ClientProofBand", "ListingResultsStrip"],
  law: ["CredentialStrip", "CaseResultBand", "ClientQuote"],
  fitness: ["TransformationMetricsBand", "MemberProofStrip", "CoachCredentialBand"],
  beauty: ["ClientQuoteBand", "EditorialProofStrip", "BrandTrustBand"],
  generic: ["AttributedQuoteBand", "MetricsBand", "LogoQuoteRail"],
};

const CTA_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["BookingPanel", "ReservationForm", "PrivateDiningContact"],
  saas: ["ConversionPanel", "SignupFormPanel", "DemoPaths"],
  construction: ["EstimatePanel", "CallNowSplit", "ServiceAreaBooking"],
  agency: ["ProjectBriefPanel", "ConsultationForm", "EngagementPaths"],
  portfolio: ["ContactLetter", "InvitationPanel", "ProjectInquiryPanel"],
  realEstate: ["ConsultationPanel", "TourBookingPanel", "AgentContactPanel"],
  law: ["ConsultationIntakePanel", "CallNowBlock", "CaseReviewForm"],
  fitness: ["TrialBookingPanel", "PlanSelectionPanel", "CoachContactSplit"],
  beauty: ["AppointmentBookingPanel", "ConsultationForm", "ContactPanel"],
  generic: ["ConversionPanel", "FormFirstCta", "ContactPanel"],
};

const FOOTER_COMPONENTS_BY_NICHE: Record<Niche, string[]> = {
  restaurant: ["VenueContactFooter", "EditorialClosingFooter", "ReservationFooter"],
  saas: ["ProductSignalFooter", "BrandStatusFooter", "LeanProductFooter"],
  construction: ["ServiceAreaFooter", "CommercialContactFooter", "TrustSignalFooter"],
  agency: ["StudioContactFooter", "EditorialSignatureFooter", "BrandClosureFooter"],
  portfolio: ["AuthoredSignatureFooter", "StudioContactFooter", "EditorialContactFooter"],
  realEstate: ["AgentContactFooter", "ListingBrandFooter", "EstateContactFooter"],
  law: ["PracticeContactFooter", "CredentialFooter", "FirmClosingFooter"],
  fitness: ["StudioHoursFooter", "CoachContactFooter", "MembershipFooter"],
  beauty: ["SalonHoursFooter", "BrandContactFooter", "RitualClosingFooter"],
  generic: ["BrandContactFooter", "EditorialContactFooter", "ServiceCompanyFooter"],
};

const ALL_COMPONENTS_BY_ROLE: Record<VariantComponentRole, string[]> = {
  navbar: ["Navbar"],
  hero: ["Hero"],
  story: Array.from(new Set(Object.values(STORY_COMPONENTS_BY_NICHE).flat())),
  services: Array.from(new Set(Object.values(FEATURE_COMPONENTS_BY_NICHE).flat())),
  gallery: Array.from(new Set(Object.values(GALLERY_COMPONENTS_BY_NICHE).flat())),
  proof: Array.from(new Set(Object.values(PROOF_COMPONENTS_BY_NICHE).flat())),
  cta: Array.from(new Set(Object.values(CTA_COMPONENTS_BY_NICHE).flat())),
  footer: Array.from(new Set(Object.values(FOOTER_COMPONENTS_BY_NICHE).flat())),
};

function titleCaseToken(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function componentNameForRole(
  niche: Niche,
  role: WebsiteVariantPlan["bodyRoleSequence"][number],
  plan: WebsiteVariantPlan
): string {
  switch (role) {
    case "story":
      return STORY_COMPONENT_BY_NICHE[niche] ?? "Story";
    case "services":
      return FEATURE_COMPONENT_BY_VARIANT[plan.featureVariant] ?? "Services";
    case "gallery":
      return GALLERY_COMPONENT_BY_NICHE[niche] ?? "Gallery";
    case "proof":
      return PROOF_COMPONENT_BY_VARIANT[plan.proofVariant] ?? "Proof";
    case "cta":
      return CTA_COMPONENT_BY_VARIANT[plan.ctaVariant] ?? "Cta";
    default:
      return "Section";
  }
}

export function getSectionFamilyRule(
  niche: Niche,
  plan: WebsiteVariantPlan,
  role: VariantComponentRole
): SectionFamilyRule {
  const genericHospitalityOverride =
    niche === "generic" &&
    (plan.designFamily === "warm_artisan" ||
      plan.designFamily === "editorial_luxury");

  const preferredComponentName =
    role === "navbar"
      ? "Navbar"
      : role === "hero"
        ? "Hero"
        : role === "footer"
          ? FOOTER_COMPONENT_BY_VARIANT[plan.footerVariant] ?? "Footer"
          : componentNameForRole(niche, role, plan);

  const allowedComponentNames =
    role === "navbar"
      ? ["Navbar"]
        : role === "hero"
          ? ["Hero"]
          : role === "story"
          ? genericHospitalityOverride
            ? ["Story", "EditorialStorySections"]
            : STORY_COMPONENTS_BY_NICHE[niche] ?? ["Story"]
          : role === "services"
            ? genericHospitalityOverride
              ? ["EditorialStorySections", "AlternatingMediaRows", "AsymmetricCards"]
              : FEATURE_COMPONENTS_BY_NICHE[niche] ?? ["Services"]
            : role === "gallery"
              ? genericHospitalityOverride
                ? ["ShowcaseGallery"]
                : GALLERY_COMPONENTS_BY_NICHE[niche] ?? ["Gallery"]
              : role === "proof"
                ? genericHospitalityOverride
                  ? ["AttributedQuoteBand", "EditorialProofBand", "PressMentionStrip"]
                  : PROOF_COMPONENTS_BY_NICHE[niche] ?? ["Proof"]
                : role === "cta"
                  ? genericHospitalityOverride
                    ? ["BookingPanel", "FormFirstCta", "ContactPanel"]
                    : CTA_COMPONENTS_BY_NICHE[niche] ?? ["Cta"]
                  : genericHospitalityOverride
                    ? ["EditorialContactFooter", "BrandContactFooter"]
                    : FOOTER_COMPONENTS_BY_NICHE[niche] ?? ["Footer"];

  const uniqueAllowed = Array.from(
    new Set([preferredComponentName, ...allowedComponentNames])
  );

  return {
    role,
    preferredComponentName,
    preferredFilePath: `src/components/${preferredComponentName}.tsx`,
    allowedComponentNames: uniqueAllowed,
    disallowedComponentNames: ALL_COMPONENTS_BY_ROLE[role].filter(
      (name) => !uniqueAllowed.includes(name)
    ),
    preferredFallbackName: preferredComponentName,
  };
}

export function getVariantComponentTree(
  niche: Niche,
  plan: WebsiteVariantPlan
): VariantComponentEntry[] {
  const bodyEntries = plan.bodyRoleSequence.map((role) => {
    const componentName = componentNameForRole(niche, role, plan);
    return {
      role,
      componentName,
      filePath: `src/components/${componentName}.tsx`,
    };
  });
  const footerName =
    FOOTER_COMPONENT_BY_VARIANT[plan.footerVariant] ?? "Footer";

  return [
    {
      role: "navbar",
      componentName: "Navbar",
      filePath: "src/components/Navbar.tsx",
    },
    {
      role: "hero",
      componentName: "Hero",
      filePath: "src/components/Hero.tsx",
    },
    ...bodyEntries,
    {
      role: "footer",
      componentName: footerName,
      filePath: `src/components/${footerName}.tsx`,
    },
  ];
}

function renderHeroExecution(plan: WebsiteVariantPlan, niche: Niche): string {
  const imageRule =
    plan.imageStrategy === "uploaded"
      ? "Bind the hero to projectImages.hero from uploaded imagery and compose around that real asset."
      : plan.imageStrategy === "curated-local"
        ? "Bind the hero to projectImages.hero from curated local imagery and let the scaffold frame that image as primary content."
        : plan.imageStrategy === "approved-fallback"
          ? "Bind the hero to projectImages.hero using the pre-approved fallback image plan. Do not replace it with an empty placeholder frame."
          : "Bind the hero to projectImages.hero using the resolved image plan.";

  const contrastRule =
    plan.contrastMode === "high"
      ? "Use decisive surface contrast: strong light/dark separation, bold foreground, and one clear accent plane."
      : plan.contrastMode === "soft"
        ? "Use softer surface transitions, restrained contrast, and quieter panel edges."
        : "Use balanced contrast with one distinct support surface and one quieter secondary surface.";

  switch (plan.heroVariant) {
    case "product-ui-split":
      return `- Use a true split hero with product UI as the dominant visual and copy on the opposite side.
- The product surface must show real interface structure, not a decorative browser shell.
- Add a support rail with metrics, trust marks, or workflow proof beside or below the copy.
- ${imageRule}
- ${contrastRule}`;
    case "workflow-window":
      return `- Center the hero around a workflow window or product canvas with visible controls and content hierarchy.
- Pair it with one adjacent support block containing credentials, metrics, or workflow notes.
- Do not substitute a photo-led or wallpaper-led hero.
- ${imageRule}
- ${contrastRule}`;
    case "centered-launch-rail":
      return `- Use a centered statement only if it sits directly above a visible proof/product rail.
- The proof rail must carry real metrics, trust marks, or a structured product/media block.
- Do not emit headline + buttons only.
- ${imageRule}
- ${contrastRule}`;
    case "crew-and-project-split":
    case "proof-led-split":
    case "metric-anchored-hero":
      return `- Build the hero around real project or crew imagery plus an explicit proof or credential rail.
- The support plane should show licensing, years, project count, service area, or commercial proof.
- Do not use software-style panels or startup glow treatments.
- ${imageRule}
- ${contrastRule}`;
    case "image-left-copy-right":
    case "editorial-split":
    case "cinematic-offset":
      return `- Use an image-led editorial hero with explicit asymmetry and a secondary support panel or rail.
- The support plane should carry credentials, awards, tasting/service notes, or trust markers.
- Do not center the copy over wallpaper imagery.
- ${imageRule}
- ${contrastRule}`;
    default:
      return `- Preserve heroVariant "${plan.heroVariant}" as the hero scaffold, not just a label.
- The hero must include a real support block and one dominant media or proof plane.
- ${imageRule}
- ${contrastRule}`;
  }
}

function renderFeatureExecution(plan: WebsiteVariantPlan): string {
  const key = plan.featureVariant;
  if (key.includes("grid")) {
    return "- Use a non-uniform grid with one dominant item and at least one smaller supporting item. Do not emit three equal cards.";
  }
  if (key.includes("timeline")) {
    return "- Use a timeline or sequenced capability structure with markers, not a card grid.";
  }
  if (key.includes("ledger") || key.includes("menu")) {
    return "- Render this section as an editorial ledger/list with ruled entries and one highlighted entry.";
  }
  if (key.includes("callout") || key.includes("teardown") || key.includes("matrix")) {
    return "- Render this section as a structured product/service explanation band, table, or matrix rather than a generic features grid.";
  }
  if (key.includes("rows") || key.includes("lanes") || key.includes("story")) {
    return "- Use alternating rows or lanes with varied alignment and one highlighted row. Avoid repeated card shells.";
  }
  return `- Preserve featureVariant "${plan.featureVariant}" with a visibly distinct structure, not a fallback feature grid.`;
}

function renderProofExecution(plan: WebsiteVariantPlan): string {
  const key = plan.proofVariant;
  if (key.includes("metric")) {
    return "- Use a metric/proof band with large numbers or adoption markers. Do not render testimonial cards.";
  }
  if (key.includes("logo") || key.includes("credential") || key.includes("trust")) {
    return "- Use a credential or trust strip with logos, certifications, or named proof markers.";
  }
  if (key.includes("quote") || key.includes("critic") || key.includes("guest") || key.includes("attributed")) {
    return "- Use one editorial quote or pull-quote treatment with real attribution, not a 3-card testimonial wall.";
  }
  if (key.includes("case") || key.includes("project")) {
    return "- Use concise case-study or project-outcome proof blocks rather than generic quotes.";
  }
  return `- Preserve proofVariant "${plan.proofVariant}" as a distinct proof scaffold.`;
}

function renderCtaExecution(plan: WebsiteVariantPlan): string {
  const key = plan.ctaVariant;
  if (key.includes("form")) {
    return "- Make the CTA a form-first conversion surface with real inputs and a framed panel. Do not reduce it to two buttons.";
  }
  if (key.includes("dual-path")) {
    return "- Make the CTA a dual-path split surface with two distinct actions or tracks inside one structured panel.";
  }
  if (key.includes("booking") || key.includes("reservation") || key.includes("appointment") || key.includes("tour")) {
    return "- Make the CTA a booking or reservation surface with schedule/contact context plus a real action form or direct booking path.";
  }
  if (key.includes("contact") || key.includes("call")) {
    return "- Make the CTA a contact-first split block with direct contact details and a framed action surface.";
  }
  return `- Preserve ctaVariant "${plan.ctaVariant}" as the closure structure, not a centered CTA stripe.`;
}

function renderFooterExecution(plan: WebsiteVariantPlan): string {
  const key = plan.footerVariant;
  if (key.includes("product") || key.includes("status")) {
    return "- Build a product-grade footer with brand closure, status/trust signal, and one non-link utility element.";
  }
  if (key.includes("service") || key.includes("commercial") || key.includes("company") || key.includes("trust")) {
    return "- Build a service-company footer with real contact details, service area/trust notes, and no sitemap-grid fallback.";
  }
  if (key.includes("venue") || key.includes("reservation")) {
    return "- Build a venue/footer closure with address, hours, reservation/contact line, and one hospitality-specific note.";
  }
  if (key.includes("editorial") || key.includes("signature") || key.includes("studio") || key.includes("brand")) {
    return "- Build an editorial/brand closure with a closing statement, real contact details, and one non-link anchor.";
  }
  return `- Preserve footerVariant "${plan.footerVariant}" as the final closure structure.`;
}

function renderStoryOrGalleryExecution(
  niche: Niche,
  role: WebsiteVariantPlan["bodyRoleSequence"][number]
): string {
  if (role === "gallery") {
    return "- Use an asymmetric gallery or showcase composition with one dominant media block and supporting secondary images.";
  }

  switch (niche) {
    case "saas":
      return "- Make the story section a workflow narrative or product demonstration with real product context, not generic company copy.";
    case "construction":
      return "- Make the story section a company or project narrative with commercial credibility and real site/process context.";
    case "restaurant":
      return "- Make the story section an editorial chef/atmosphere narrative with media and authored hospitality detail.";
    default:
      return "- Make the story section a real authored narrative or process block with one supporting media/proof element.";
  }
}

function renderSurfaceModeExecution(plan: WebsiteVariantPlan): string {
  const density =
    plan.densityMode === "dense"
      ? "- Density mode dense: tighter spacing, more information per section, stronger data/proof packing."
      : plan.densityMode === "airy"
        ? "- Density mode airy: fewer blocks per section, larger negative space, more editorial spacing."
        : "- Density mode balanced: moderate spacing and information density.";
  const contrast =
    plan.contrastMode === "high"
      ? "- Contrast mode high: strong background/surface separation and more assertive accent usage."
      : plan.contrastMode === "soft"
        ? "- Contrast mode soft: quieter surface transitions and lower-contrast panel treatment."
        : "- Contrast mode balanced: visible surface changes without extreme contrast.";

  return `${density}\n${contrast}`;
}

function renderVariantExecutionScaffold(
  niche: Niche,
  plan: WebsiteVariantPlan
): string {
  const orderedFiles = plan.bodyRoleSequence
    .map((role, index) => {
      const componentName = componentNameForRole(niche, role, plan);
      const instructions =
        role === "services"
          ? renderFeatureExecution(plan)
          : role === "proof"
            ? renderProofExecution(plan)
            : role === "cta"
              ? renderCtaExecution(plan)
              : renderStoryOrGalleryExecution(niche, role);
      return `${index + 1}. src/components/${componentName}.tsx (${role})
${instructions}`;
    })
    .join("\n\n");

  const footerName =
    FOOTER_COMPONENT_BY_VARIANT[plan.footerVariant] ?? "Footer";

  return `=== VARIANT-BOUND STARTER EXECUTION PLAN ===

Lock this scaffold before code generation. These file names and section patterns are the real execution contract for this run.

HERO FILE:
- src/components/Hero.tsx
${renderHeroExecution(plan, niche)}

BODY FILE ORDER:
${orderedFiles}

FOOTER FILE:
- src/components/${footerName}.tsx
${renderFooterExecution(plan)}

SURFACE + DENSITY MODES:
${renderSurfaceModeExecution(plan)}

HARD EXECUTION RULES:
- Emit the exact component files above. Do not substitute old default scaffold names.
- App.tsx and manifest.sectionOrder MUST render these components in this exact order.
- The selected proof/features/CTA/footer variants must survive through finalize and repair.
- Theme/surface decisions must visibly reflect densityMode and contrastMode, not just metadata.
- Bind real projectImages.* slots into the hero and supporting media sections. No empty browser-shell placeholders unless the selected hero explicitly requires a real product surface.

=== END VARIANT-BOUND STARTER EXECUTION PLAN ===`;
}

const CONSTRUCTION_BASE: StarterBase = {
  niche: "construction",
  name: "Industrial Contractor",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/Services.tsx",
    "src/components/ProjectGallery.tsx",
    "src/components/ProcessTimeline.tsx",
    "src/components/Credentials.tsx",
    "src/components/Testimonial.tsx",
    "src/components/EstimateForm.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `CONSTRUCTION STARTER BASE — structural scaffold for this generation.

HERO (Hero.tsx):
- Full-bleed project photo as background with dark overlay gradient (not uniform — heavier at bottom)
- Overlapping credential bar at bottom: license number, years in business, "Fully Insured" badge, BBB rating
- Headline: condensed industrial display sans (Archivo/Bebas Neue), left-aligned, max 6 words
- Sub: one line about service area and specialties
- CTA: "Request Estimate" button anchored to hero, not floating
- The credential bar OVERLAPS the hero-to-services boundary (negative margin or absolute positioning)
- NO centered text. NO gradient mesh. NO floating blobs.

SERVICES (Services.tsx):
- Three trade lanes: Residential, Commercial, Renovation
- NOT a uniform 3-card grid. Use asymmetric layout: one featured lane (60% width) with project thumbnail + scope description, two secondary lanes (40% stacked)
- Each lane has: trade name in display type, 2-3 bullet capabilities, "Starting at $X" indicator, small project thumbnail
- Dark surface section with amber/orange accent borders on lanes

PROJECT GALLERY (ProjectGallery.tsx):
- Asymmetric grid: one large project image (col-span-2, tall) + 3 smaller thumbnails
- Each project card: image + overlay with project name, location, year, scope (sqft or $value)
- Hover: image zoom + info slide-up
- Section header: left-aligned, not centered

PROCESS TIMELINE (ProcessTimeline.tsx):
- Horizontal timeline with 4 stages connected by a ruled line
- Each stage: small site photo, stage name, one-line description
- Photos ALTERNATE above and below the timeline line (offset composition)
- NOT four equal cards in a grid. The timeline IS the structure.

CREDENTIALS (Credentials.tsx):
- Full-bleed dark band
- Large typographic credential numbers: "27+ Years", "500+ Projects", "$50M+ Built", "100% Licensed & Insured"
- Display type, not small chips. Each number is a dominant visual element.
- Single line layout on desktop, 2x2 on mobile

TESTIMONIAL (Testimonial.tsx):
- Single large testimonial, NOT a grid of 3
- Named client + project name + project value
- Pull-quote in serif or display type
- Optional: project completion photo alongside

ESTIMATE FORM (EstimateForm.tsx):
- Split panel: left side has phone number (large), office hours, service area text
- Right side: real form with fields: Project Type (dropdown), Scope Description (textarea), Timeline (dropdown), Name, Phone, Email
- Dark surface with bordered form panel
- NOT a centered CTA stripe

FOOTER (Footer.tsx):
- Deep dark surface, distinct from content sections
- Two-column: left (company name + tagline + license number + insurance), right (address + phone + hours + service area)
- Brand mark or wordmark at top
- NO four-column link sitemap. This is a contractor, not a SaaS.

MOTION:
- Hero: single fade-up on headline + credential bar slide-up from bottom
- Sections: subtle fade-up on scroll entry, no stagger chains
- Hover: image zoom 1.02 + shadow on project cards
- No float loops, no pulse rings, no gradient animations`,
};

const RESTAURANT_BASE: StarterBase = {
  niche: "restaurant",
  name: "Editorial Fine Dining",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/ChefStory.tsx",
    "src/components/MenuHighlights.tsx",
    "src/components/Gallery.tsx",
    "src/components/PressProof.tsx",
    "src/components/Reservation.tsx",
    "src/components/Location.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `RESTAURANT STARTER BASE — structural scaffold for this generation.

HERO (Hero.tsx):
- Split composition: left 55% — full-height dining room or signature dish photo with warm low-key lighting. Right 45% — dark surface panel with:
  - Restaurant name in large serif display (Playfair/Cormorant)
  - Cuisine type + "Est. 20XX"
  - Awards/credential rail (Michelin star, James Beard, etc. as small typographic marks)
  - "Reserve a Table" CTA
- The left image and right panel OVERLAP slightly (the image bleeds 40px into the text panel or vice versa)
- Warm color temperature throughout. Gold/brass accent on credential marks.
- NO centered text over full-bleed photo. NO bg-black/60 overlay as the only treatment.

CHEF STORY (ChefStory.tsx):
- Full-width section with warm surface shift (not same bg as hero)
- Chef portrait: offset left (not centered), environmental — working in kitchen, plating, or at the pass
- Right: first-person philosophy paragraph (2-3 sentences) + pull-quote in large serif breaking the paragraph
- Chef name + title as a small editorial caption below portrait
- The portrait should be tall (portrait aspect) and the text should wrap beside it

MENU HIGHLIGHTS (MenuHighlights.tsx):
- Editorial ruled list on dark surface
- Three categories: Starters, Mains, Desserts (or seasonal equivalent)
- Each item: dish name (serif, medium weight) left, description (body, muted) center, price right
- Horizontal ruled lines between items
- ONE signature dish breaks the list: larger, with an inset photo + a 2-sentence story
- NO 3-card grid. NO uniform rounded cards. This is an editorial menu.

GALLERY (Gallery.tsx):
- Asymmetric 8/4 split: one large atmospheric image (col-span-2, tall) left + two stacked images right
- Images: dining room atmosphere, ingredient close-up, wine/bar service
- Consistent warm tone across all images
- Subtle image hover: zoom 1.02 + warm overlay shift
- NO uniform grid-cols-3

PRESS PROOF (PressProof.tsx):
- Full-bleed dark band
- Single large pull-quote from a named critic with publication name as a wordmark
- Below: 2-3 smaller secondary quotes with publication names
- NO avatar testimonial cards. NO star ratings. This is press proof.

RESERVATION (Reservation.tsx):
- Warm surface shift (different bg from press proof)
- Split: left — time slot display (Lunch: 12-2pm, Dinner: 6-10pm) + private dining inquiry note + dress code note
- Right: reservation form (Date, Time, Party Size, Occasion, Name, Phone)
- Or: left — atmospheric interior photo, right — form
- NOT a centered "Reserve Now" button stripe

LOCATION (Location.tsx):
- Compact section: address + cross-streets + transit directions + parking note
- Optional: exterior photo or neighborhood context
- Hours display

FOOTER (Footer.tsx):
- Deep dark surface with warm accent
- Venue identity: address + hours + reservation phone + dress note + private events inquiry
- Brand mark / restaurant wordmark centered above
- Closing line in serif: "A culinary journey since 20XX" or equivalent
- NO utility sitemap. This is a venue, not a SaaS.

MOTION:
- Hero: fade-up on text panel, image loads immediately
- Sections: single fade-up per section on scroll entry
- Menu items: subtle stagger reveal (50ms each) on scroll entry
- Gallery: hover zoom 1.02
- No float loops, no pulse dots`,
};

const SAAS_BASE: StarterBase = {
  niche: "saas",
  name: "Product-First SaaS",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/ProductDemo.tsx",
    "src/components/Capabilities.tsx",
    "src/components/Metrics.tsx",
    "src/components/Testimonial.tsx",
    "src/components/Pricing.tsx",
    "src/components/Conversion.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `SAAS STARTER BASE — structural scaffold for this generation.

HERO (Hero.tsx):
- Split 45/55: left column — headline in display sans (Inter Display/Geist), one-line sub, single primary CTA button, credibility rail ("10,000+ teams" or logo strip of 3-4 customer logos)
- Right column (55%): edge-bleeding product window with visible browser chrome (title bar with dots, address bar mockup). Inside: a real-looking dashboard UI with sidebar nav, header, chart area, and data table. The product window overlaps the hero bottom boundary.
- Dark bg (#0a0a0a to #0b0d12). Subtle grid texture or dot pattern in background.
- NO gradient mesh + floating blobs. NO blurred photo inside a glow card. The PRODUCT is the hero visual.

PRODUCT DEMO (ProductDemo.tsx):
- Full-width annotated product screenshot
- One specific workflow shown step-by-step with 4-5 callout labels pointing to UI elements
- Each callout: small number marker + one-line description
- Dark surface with subtle grid lines
- The screenshot should show a DIFFERENT view than the hero (e.g., if hero shows dashboard, this shows workflow editor)

CAPABILITIES (Capabilities.tsx):
- NOT a 3-card grid
- Three capability rows: each is a horizontal band with icon-mark left, capability name (bold), description (muted), and small product detail right
- Alternating subtle bg shifts between rows (e.g., surface-1 / surface-2)
- Or: asymmetric layout — two large cards (col-span-2) + three small cards
- Each card has distinct visual weight, not uniform

METRICS (Metrics.tsx):
- Full-bleed accent band (dark with blue/violet accent)
- 4-5 large metric numbers in display type: "99.99% Uptime", "50ms Response", "10K+ Teams", "500+ Integrations", "SOC 2 Certified"
- Horizontal layout on desktop. Numbers are LARGE (text-5xl+).
- This is a typographic section. No cards. No images.

TESTIMONIAL (Testimonial.tsx):
- Warm surface shift (subtle bg change)
- Single long-form quote with portrait + name + role + company logo
- NOT the same card shell as capabilities
- Or: logo wall strip + single anchor quote beneath
- Editorial treatment, not a card grid

PRICING (Pricing.tsx):
- NOT three uniform cards in grid-cols-3
- Two-tier comparison: Essentials (compact left column) vs Pro (expanded right column, accent border highlight)
- Feature comparison rows beneath both tiers
- Or: single-plan hero with monthly/annual toggle
- Or: stacked tier ladder (each tier is a horizontal row)
- Enterprise: separate full-width band beneath with "Contact Sales"

CONVERSION (Conversion.tsx):
- Split panel: left — headline + 2-line value prop + trust signal ("No credit card required" or "3-minute setup")
- Right — real signup form: Email, Company Name (optional), Use Case (dropdown), Submit button
- Bordered inset panel, NOT centered headline + two buttons on gradient
- Or: product-anchored CTA with small product preview left, form right

FOOTER (Footer.tsx):
- Brand closing line in confident typography ("Built for teams that ship")
- Minimal product links (max 2 columns, not 4)
- Status badge: green dot + "All systems operational"
- Newsletter email field: "Get product updates"
- NO four-column link-only sitemap

MOTION:
- Hero: staggered fade-up (headline 0ms, sub 100ms, CTA 200ms, product window 300ms slide-up)
- Product demo: callout labels fade in with 100ms stagger on scroll
- Capabilities: rows fade-up on scroll entry
- Pricing: subtle scale 1.01 on hover for tier cards
- No float loops, no pulse rings as primary effects`,
};

const PORTFOLIO_BASE: StarterBase = {
  niche: "portfolio",
  name: "Authored Creative Portfolio",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/SelectedWork.tsx",
    "src/components/About.tsx",
    "src/components/MediaInterlude.tsx",
    "src/components/Testimonial.tsx",
    "src/components/Contact.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `PORTFOLIO STARTER BASE — structural scaffold for this generation.

HERO (Hero.tsx):
- Large authored statement (creator's name or manifesto) in display serif (Playfair/GT Sectra), spanning 60% width, left-aligned
- Credential rail below: disciplines (Brand / Editorial / Packaging), notable clients or publications, years of practice
- One project image overlaps the hero from the right edge — partially behind/overlapping the headline text, creating depth. The image is cropped asymmetrically (not a clean rectangle).
- Or: full-bleed portrait with displaced name/wordmark overlapping the portrait edge
- NO centered headline + subtitle + two buttons over a dimmed photo. NO bg-black/60 overlay as the only composition.
- The hero must feel AUTHORED — it communicates a point of view, not just polish.

SELECTED WORK (SelectedWork.tsx):
- Stacked editorial case-studies (NOT alternating 7/4 rail)
- First project: LARGE — full-bleed project image + offset caption column (project name, client, year, one-line scope). Caption overlaps image bottom-right.
- Second project: MEDIUM — split composition, different from first. Image left + text right, or image right + text left.
- Third project: SMALL — compact entry with thumbnail + project name + client. Teaser.
- Each project has DISTINCT size and treatment. Not uniform.
- Images must be real project work, not generic stock.
- Project index feel, not a template grid.

ABOUT (About.tsx):
- First-person long-form statement (3-4 paragraphs). Left-aligned, not centered.
- Pull-quote breaks the text in large serif
- Optional: small portrait offset right, overlapping the text column edge
- NO "50+ projects / 12 awards" stat chips
- NO "2-col text + expertise list" layout
- This section is AUTHORED — it reads like the person wrote it, not like a template filled in.

MEDIA INTERLUDE (MediaInterlude.tsx):
- Full-bleed image moment — a project detail or studio shot spanning edge-to-edge
- No text overlay (or minimal — just a caption at bottom edge)
- This creates a visual breathing pause in the page rhythm
- Image must be high quality and compositionally strong enough to stand alone

TESTIMONIAL (Testimonial.tsx):
- Single curated quote with attribution
- Large serif quote, client name + company below
- Minimal — not a grid of testimonials
- Or: single press mention with publication wordmark

CONTACT (Contact.tsx):
- Typographic invitation spanning viewport width
- "Available for select projects" or "Let's create something together" in display serif
- Below: real email (mailto: link), studio city, phone number, availability status
- Left-aligned or left-heavy composition. NOT centered eyebrow + headline + two buttons.

FOOTER (Footer.tsx):
- Designed signature — closing typographic statement in serif
- Real locations (city names), studio contact, social anchors (as text links, not just icons)
- Composed as a final page surface, not a utility strip
- The footer should feel like the last page of a book — intentional closure

MOTION:
- Hero: fade-up on statement + credential rail. Image loads immediately.
- Selected Work: projects reveal on scroll with subtle fade-up, no heavy stagger
- Media Interlude: parallax-like subtle shift on scroll (translateY: -20px over scroll range)
- Contact: fade-up on invitation text
- No float loops, no pulse dots, no gradient animations

IMAGE RULES:
- Images must persist across at least 4 sections: hero, selected work (multiple), about (optional), media interlude
- Portfolio pages must feel IMAGE-LED throughout. Dropping to text-only after the hero is a failure.
- Every project image must be real client work or high-quality design mockup, not generic stock.`,
};

const GENERIC_PREMIUM_BASE: StarterBase = {
  niche: "generic",
  name: "Art-Directed Premium Website",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/Story.tsx",
    "src/components/Showcase.tsx",
    "src/components/Proof.tsx",
    "src/components/Invitation.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `GENERIC PREMIUM STARTER BASE — structural scaffold for sparse or style-led briefs like "fancy website".

HERO (Hero.tsx):
- Image-led or split-media composition. One side carries real visual weight with projectImages.hero. The other side carries headline, supporting copy, primary CTA, and a support rail.
- Support rail must include 3 distinct items: trust statement, proof stat, and service/experience note.
- NO centered text floating over a flat gradient. NO browser-window mockup unless the brief is explicitly product/SaaS.
- If the brief is style-led ("fancy", "beautiful", "luxury"), the hero should feel editorial and composed, not startup-generic.

STORY (Story.tsx):
- Narrative section with 2-column composition: long-form copy on one side, supporting image or quote panel on the other.
- Must feel authored and substantial, not "About us" filler.
- Use projectImages.support if the section carries media.

SHOWCASE (Showcase.tsx):
- Asymmetric visual proof section.
- One dominant image or content block plus 2-3 supporting items with varied scale.
- NOT a uniform 3-card grid.
- Each item needs a heading, supporting line, and one visual anchor.

PROOF (Proof.tsx):
- Use a testimonial/proof/editorial quote treatment with real hierarchy.
- Include a named quote or a metrics/proof band with clear value labels.
- Must visually differ from Showcase via surface treatment and density.

INVITATION (Invitation.tsx):
- Real conversion surface. Headline, support copy, CTA, and either a short form or real contact/availability details.
- Distinct container treatment from surrounding sections.
- No floating lonely button in whitespace.

FOOTER (Footer.tsx):
- Brand closure, real contact info, utility links, and one non-link element like status, hours, or newsletter.
- Should feel like an intentional ending surface, not a sitemap.

IMAGE RULES:
- Hero and at least one supporting section must use real local assets from projectImages.*.
- If a section does not use media, it must use a deliberate text-led composition instead of a blank box or fake placeholder panel.

MOTION:
- Restrained. Fade-up per section, subtle image hover scale, no pulse dots, no floating gradient blobs.`,
};

const STARTER_BASES: Partial<Record<Niche, StarterBase>> = {
  construction: CONSTRUCTION_BASE,
  restaurant: RESTAURANT_BASE,
  saas: SAAS_BASE,
  portfolio: PORTFOLIO_BASE,
  generic: GENERIC_PREMIUM_BASE,
};

// Agency uses the portfolio base with minor adjustments
const AGENCY_BASE: StarterBase = {
  ...PORTFOLIO_BASE,
  niche: "agency",
  name: "Creative Agency / Studio",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/SelectedWork.tsx",
    "src/components/Capabilities.tsx",
    "src/components/StudioPerspective.tsx",
    "src/components/ClientLogos.tsx",
    "src/components/Contact.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `AGENCY STARTER BASE — structural scaffold for this generation.

HERO (Hero.tsx):
- Large manifesto headline in display serif/grotesk, spanning 70% width. Left-aligned.
- Wordmark displaced to top-left. Credential rail: disciplines (Brand / Digital / Campaign), est. year, locations
- Single CTA. No hero image — TYPOGRAPHY IS THE HERO.
- Or: single signature project as full-bleed hero image with overlapping project name + agency wordmark
- Bold, confident, authored. Not safe.

SELECTED WORK (SelectedWork.tsx):
- Asymmetric case-study index
- Each project: large project image (60% width) + meta column (client, year, discipline, one-line scope)
- Rows alternate image position. Each project has distinct size.
- Hover: image zoom + meta expand
- NOT a uniform 3-column grid

CAPABILITIES (Capabilities.tsx):
- Typographic list of disciplines. No cards. No icons.
- Each discipline: line of display text + muted description. Ruled dividers.
- The list IS the design. Confident, editorial.

STUDIO PERSPECTIVE (StudioPerspective.tsx):
- Full-bleed dark band with long-form first-person paragraph
- Pull-quote breaks the text in large serif
- Optional: principal portrait offset right

CLIENT LOGOS (ClientLogos.tsx):
- Horizontal logo strip + single anchor quote beneath
- Minimal. The logos are the proof.

CONTACT (Contact.tsx):
- Typographic invitation. "Let's work together" in display type.
- Real email, studio addresses (cities), phone, availability status. Left-aligned.

FOOTER (Footer.tsx):
- Closing statement in serif + city offices + social anchors
- Designed as a final page surface

MOTION:
- Hero: kinetic headline reveal (mask or letter stagger) if typography-led
- Work: hover image zoom + meta reveal
- Perspective: fade-up paragraph with pull-quote delay
- Expressive but controlled. No generic float loops.`,
};

STARTER_BASES.agency = AGENCY_BASE;

// Fitness base — 6 components (Navbar + Hero + 3 body sections + Footer).
// Targets bold-commercial style's 7-component budget. Each body section
// intentionally merges 2-3 niche choreography roles to stay within the
// 3-body-section hard limit enforced by all routed style skills.
const FITNESS_BASE: StarterBase = {
  niche: "fitness",
  name: "High-Energy Fitness Studio",
  componentFiles: [
    "src/components/Navbar.tsx",
    "src/components/Hero.tsx",
    "src/components/ProgramsOrClasses.tsx",
    "src/components/CoachesAndResults.tsx",
    "src/components/MembershipAndTrial.tsx",
    "src/components/Footer.tsx",
  ],
  scaffoldInstructions: `FITNESS STARTER BASE — structural scaffold for this generation.
This base uses exactly 3 body sections. Merge choreography roles as instructed — do NOT split into more files.

HERO (Hero.tsx):
- Full-bleed athlete-in-motion photo with bold condensed display headline overlaid
- Accent color bar at bottom with 3-4 program category labels (STRENGTH / HIIT / MOBILITY / etc.)
- Single primary CTA button ("Start Your Free Trial" or equivalent)
- Stat rail below or inside hero: member count, sessions per week, years open, or success metric
- NO centered text floating over a plain gradient. The athlete photo IS the hero.

PROGRAMS OR CLASSES (ProgramsOrClasses.tsx):
- Named program lanes — each lane: program name in display type, format, intensity, schedule
- NOT a uniform 3-card grid. Use asymmetric layout: one featured program (60% width) + 2 secondary lanes stacked
- Each lane has: program name in condensed sans, format descriptor, intensity level badge, sample schedule
- Accent-color borders on lanes. Dark surface section.

COACHES AND RESULTS (CoachesAndResults.tsx):
- Split section: left — 2 coach entries (name, specialty, one-line credential). Right — one named member quote with program + outcome.
- NOT a card grid. One anchor result per side. Compact.

MEMBERSHIP AND TRIAL (MembershipAndTrial.tsx):
- Tier ladder: 2-3 pricing rows (name, price, 2-3 included items, one CTA button each). Stacked, NOT three-column cards.
- One trial CTA below the tiers: "Book a Free Trial" button linking to a contact surface. No inline form here.
- Dark accent surface. Split or stacked layout.

FOOTER (Footer.tsx):
- Studio address + hours + phone + class schedule link
- Social anchors as text links, not just icons
- One non-link element: next class time, class cancellation policy note, or "download our app" badge
- NO four-column utility sitemap

MOTION:
- Hero: staggered fade-up on headline, accent bar slides up from bottom
- Programs: lanes reveal with 60ms stagger on scroll
- Coaches: fade-up per portrait. Member quote fades in with delay.
- No float loops, no pulse rings, no gradient animations`,
};

STARTER_BASES.fitness = FITNESS_BASE;

/**
 * Get the starter base for a niche. Returns null for niches without one.
 */
export function getStarterBase(niche: Niche): StarterBase | null {
  return STARTER_BASES[niche] ?? null;
}

export function getVariantStarterBase(
  niche: Niche,
  plan?: WebsiteVariantPlan
): StarterBase | null {
  const base = getStarterBase(niche);

  if (!base || !plan) {
    return base;
  }

  const bodyFiles = plan.bodyRoleSequence.map((role) => {
    const componentName = componentNameForRole(niche, role, plan);
    return `src/components/${componentName}.tsx`;
  });
  const footerName =
    FOOTER_COMPONENT_BY_VARIANT[plan.footerVariant] ?? "Footer";

  return {
    ...base,
    name: `${base.name} :: ${titleCaseToken(plan.heroVariant)} / ${titleCaseToken(plan.ctaVariant)}`,
    componentFiles: getVariantComponentTree(niche, plan).map(
      (entry) => entry.filePath
    ),
    scaffoldInstructions: renderVariantExecutionScaffold(niche, plan),
  };
}

/**
 * Render a starter base as a prompt-ready scaffold block.
 */
export function renderStarterBase(base: StarterBase): string {
  const files = base.componentFiles.map((f) => `  - ${f}`).join("\n");

  return `=== NICHE STARTER BASE: ${base.name.toUpperCase()} (STRUCTURAL SCAFFOLD) ===

This is your structural starting point. Follow this scaffold for the component breakdown and section compositions. You MUST emit exactly these component files (plus the standard config/entry files). The scaffold tells you HOW each section should be composed — follow it.

COMPONENT FILES TO EMIT:
${files}

${base.scaffoldInstructions}

HARD RULES:
- Emit exactly these component files (you may add 1-2 more if the brief demands, but do not remove any)
- Follow the section composition instructions above — they override any generic instinct
- The scaffold defines the STRUCTURE, not the content. Fill in niche-appropriate content, names, copy.
- If a scaffold instruction says "NOT X" or "NO X", that is a hard ban — do not emit X.

=== END STARTER BASE ===`;
}
