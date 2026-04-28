/**
 * Niche asset planner — Phase 2 + Phase 4 (image-role logic).
 *
 * Produces an AssetPlan that the prompt builder injects into the
 * generation system message. The plan constrains:
 *  - which image categories are allowed/banned per niche
 *  - per-section image briefs with composition roles
 *  - image-role rules (structural role, not decorative)
 *  - fallback behavior when images are missing or mismatched
 *  - consistency notes (palette, lighting, perspective)
 *
 * Image URLs are still chosen by the model. The planner constrains
 * the allowed vocabulary so short prompts produce niche-correct
 * photography, not generic stock.
 */

import type { Niche } from "./niche-router";
import { getNicheProfile, type ImageRoleRule } from "./niche-profiles";

export type SectionBrief = {
  section: string;
  brief: string;
  role: "hero" | "showcase" | "proof" | "ambient" | "media-interlude";
};

export type AssetPlan = {
  niche: Niche;
  heroBrief: string;
  sectionBriefs: SectionBrief[];
  bannedCategories: string[];
  allowedCategories: string[];
  imageRoleRules: ImageRoleRule[];
  consistencyNotes: string;
};

/**
 * Build a niche-specific asset plan from the chosen niche and the user's
 * raw brief.
 */
export function buildAssetPlan(niche: Niche, _brief: string): AssetPlan {
  const profile = getNicheProfile(niche);

  return {
    niche,
    heroBrief: buildHeroBrief(niche),
    sectionBriefs: buildSectionBriefs(niche),
    allowedCategories: profile.allowedImages,
    bannedCategories: profile.bannedImages,
    imageRoleRules: profile.imageRoles,
    consistencyNotes: buildConsistencyNotes(niche),
  };
}

function buildHeroBrief(niche: Niche): string {
  switch (niche) {
    case "construction":
      return "Real construction project photo (residential or commercial build in progress, or completed structure with crew context). NEVER stock handshake or office worker. NEVER generic skyline.";
    case "restaurant":
      return "Cinematic plated signature dish OR dining room interior at service. Warm low-key lighting. NEVER generic family-eating-dinner stock. NEVER generic food close-up with no atmosphere.";
    case "saas":
      return "Real product UI screenshot (mocked, high-detail) with visible browser chrome and controls. NEVER blurred photo inside gradient card. NEVER abstract gradient blobs. The product must be the hero media.";
    case "agency":
      return "Real client work in context, studio process photography, OR collage composition. NEVER abstract gradient. The hero may be typographic-only (no image) if using the manifesto-led recipe.";
    case "portfolio":
      return "Authored visual: high-contrast portrait of the creator, real client work in editorial frame, OR mixed collage with overlapping planes. NEVER moody overlay with no real media beneath. NEVER stock creative person at laptop.";
    case "realEstate":
      return "Full-bleed exterior or interior photograph of a single luxury property in natural light. NEVER generic city skyline. NEVER stock family with sold sign.";
    case "law":
      return "Restrained editorial: attorney portrait in office context, law library, or city office building exterior. NEVER stock gavel or scales of justice. NEVER stock handshake.";
    case "fitness":
      return "Real athlete or member in motion in studio context. Kinetic, embodied. NEVER stock fitness model posing. NEVER generic gym equipment with no people.";
    case "beauty":
      return "Soft natural-light treatment or ritual photography. NEVER stock spa stones with candle. NEVER generic cucumber-over-eyes photo.";
    default:
      return "Editorial photography aligned with the brief's tone and niche. NEVER generic stock. Every hero image must serve a composition role.";
  }
}

function buildSectionBriefs(niche: Niche): SectionBrief[] {
  switch (niche) {
    case "construction":
      return [
        { section: "ServicesByTrade", brief: "Trade lane photos: residential, commercial, renovation. Each shows a distinct project type.", role: "showcase" },
        { section: "ProjectGallery", brief: "Real completed projects with location/year context. Asymmetric — mix exterior and interior, varied sizes.", role: "showcase" },
        { section: "ProcessTimeline", brief: "Site photos at distinct build stages (foundation, framing, finish). Documentary style.", role: "media-interlude" },
        { section: "ClientProof", brief: "Optional — project photo paired with testimonial. Shows the completed work.", role: "proof" },
      ];
    case "restaurant":
      return [
        { section: "ChefStory", brief: "Chef portrait in kitchen — working, plating, or observing. Tight crop, environmental. Not posed stock.", role: "showcase" },
        { section: "MenuHighlights", brief: "One signature dish in editorial composition. Top-down or 45deg on dark surface. Art-directed, not casual.", role: "showcase" },
        { section: "Gallery", brief: "Asymmetric mix: one large dining room photo + stacked secondaries (bar, wine cellar, ingredient close-up). Consistent warm tone.", role: "media-interlude" },
        { section: "ReservationSurface", brief: "Optional ambient interior at service. Supports the booking ritual.", role: "ambient" },
      ];
    case "saas":
      return [
        { section: "ProductTeardown", brief: "Annotated product workflow screenshot with visible callouts. Specific workflow, not generic dashboard.", role: "showcase" },
        { section: "ProofBand", brief: "Optional customer portrait with company context. Professional, not stock.", role: "proof" },
        { section: "ConversionPanel", brief: "Optional inset product preview anchoring the conversion section.", role: "media-interlude" },
      ];
    case "agency":
      return [
        { section: "SelectedWork", brief: "3-5 real client work pieces in context. Varied media types. Must look like actual delivered work.", role: "showcase" },
        { section: "StudioPerspective", brief: "Studio process photo or principal portrait. Authentic, not corporate.", role: "media-interlude" },
      ];
    case "portfolio":
      return [
        { section: "SelectedWork", brief: "3-4 real project pieces with sustained media presence. Each project needs distinct media. Varied sizes.", role: "showcase" },
        { section: "PerspectiveOrAbout", brief: "Authored portrait of the creator in workspace. Offset, not centered.", role: "media-interlude" },
        { section: "MediaInterlude", brief: "Full-bleed image — project detail or studio shot. Stands alone as a visual pause.", role: "media-interlude" },
      ];
    case "realEstate":
      return [
        { section: "FeaturedListing", brief: "Hero exterior + 2-3 interior shots. Professional real estate photography.", role: "showcase" },
        { section: "ListingsIndex", brief: "4-6 supporting listings, varied tile sizes.", role: "showcase" },
        { section: "NeighborhoodContext", brief: "Neighborhood/place context shot.", role: "media-interlude" },
        { section: "BrokerOrTeam", brief: "Broker portrait in property context.", role: "proof" },
      ];
    case "law":
      return [
        { section: "AttorneyDirectory", brief: "Attorney portraits — consistent lighting, framing, background.", role: "showcase" },
      ];
    case "fitness":
      return [
        { section: "ProgramsOrClasses", brief: "Athletes/members in motion in distinct programs.", role: "showcase" },
        { section: "CoachingTeam", brief: "Coach portraits in studio context.", role: "showcase" },
        { section: "MemberStories", brief: "Real member with program + outcome context.", role: "proof" },
      ];
    case "beauty":
      return [
        { section: "SignatureRitual", brief: "Soft natural-light photography of the signature treatment.", role: "media-interlude" },
        { section: "PractitionerOrFounder", brief: "Practitioner portrait in studio context.", role: "showcase" },
      ];
    default:
      return [
        { section: "PrimaryStory", brief: "Editorial photography aligned with brief tone.", role: "showcase" },
      ];
  }
}

function buildConsistencyNotes(niche: Niche): string {
  switch (niche) {
    case "restaurant":
      return "Maintain warm low-key lighting, dark moody palette, and consistent food/interior treatment across all images. Every food photo must feel art-directed — not casual snapshots.";
    case "construction":
      return "Real-site photography with daylight or golden-hour lighting. Consistent industrial palette. Every project photo must show real work, not stock.";
    case "saas":
      return "Product surfaces must use the same UI mockup language and dark surface treatment across all sections. Product screenshots must look like a real application.";
    case "agency":
      return "Mix media types across selected work but keep an editorial color treatment consistent. Client work must look like real delivered projects.";
    case "portfolio":
      return "Images must persist across at least FOUR sections beyond the hero. Sustain the image-led rhythm. Every project image must feel curated, not generic.";
    case "realEstate":
      return "Natural light, restrained color, place-first composition. Every property image should feel like the same photographer shot it.";
    case "law":
      return "Restrained editorial palette. Every attorney portrait must use the same lighting, framing, and background treatment for consistency.";
    case "fitness":
      return "Kinetic motion, real athletes, consistent studio palette and lighting. Every member/coach image must show energy and authenticity.";
    case "beauty":
      return "Soft natural light, warm palette, consistent ritual treatment. Every image must feel sensory and intimate, not clinical.";
    default:
      return "Consistent editorial tone, palette, and lighting across all images. Every image must serve a composition role.";
  }
}

/**
 * Render the asset plan as a prompt-ready block.
 */
export function renderAssetPlan(plan: AssetPlan): string {
  const sectionLines = plan.sectionBriefs
    .map((b) => `- ${b.section} [${b.role}]: ${b.brief}`)
    .join("\n");

  const imageRoleLines = plan.imageRoleRules.length > 0
    ? plan.imageRoleRules
        .map((r) => `- ${r.sectionHint} [${r.role}]: ${r.compositionRule}\n  Fallback if broken/missing: ${r.fallbackBehavior}`)
        .join("\n")
    : "- Use niche-appropriate photography for every section with images.";

  return `=== NICHE ASSET PLAN ===

This plan constrains the photography vocabulary for this niche. Every image you reference (every Unsplash URL in the manifest and every <img src=...> in the components) MUST satisfy these rules.

HERO IMAGE REQUIREMENT:
${plan.heroBrief}

SECTION IMAGE BRIEFS:
${sectionLines}

IMAGE-ROLE RULES (every image must have a structural role — no decorative filler):
${imageRoleLines}

HARD IMAGE RULES:
- Every <img> must serve a composition role: hero-focal, editorial-narrative, proof-portrait, ambient-atmosphere, project-showcase, product-surface, team-portrait, process-documentary, or venue-context.
- No image should be interchangeable — if you could swap it for any other photo without affecting the section's meaning, the image has no role and must be replaced or removed.
- If an image would be broken, missing, or mismatched to the niche, use the fallback behavior from the image-role rule above. NEVER leave a visible broken or empty image block.
- For image-led niches (restaurant, portfolio, real estate, beauty), images must persist across at least FOUR sections. Dropping to text-only after the hero is a composition failure.

ALLOWED IMAGE CATEGORIES:
${plan.allowedCategories.map((c) => `- ${c}`).join("\n")}

BANNED IMAGE CATEGORIES (do NOT use, even if technically available on Unsplash):
${plan.bannedCategories.map((c) => `- ${c}`).join("\n")}

SPECIFIC BANS:
- No mountains/lakes/nature for creative agencies (unless the brief explicitly mentions outdoor/nature work)
- No bridges for construction (unless the brief is specifically about infrastructure)
- No generic casual food stock for fine dining (every food photo must be art-directed)
- No wrong portrait use — team/founder portraits only where the section specifically needs a person
- No empty/broken alt-text-like image blocks visible as UI elements

CONSISTENCY:
${plan.consistencyNotes}

If an image category is not in ALLOWED, reject it and choose from ALLOWED. If a section requires media but no allowed image fits, use typographic composition instead — do not use a wrong-niche image as filler.`;
}
