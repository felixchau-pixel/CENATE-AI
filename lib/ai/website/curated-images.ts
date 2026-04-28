/**
 * Curated image library — niche × role validated Unsplash URLs.
 *
 * Each entry has been selected for:
 *  - niche correctness (construction shows real builds, not bridges)
 *  - role fit (hero-focal is compositionally strong, not a thumbnail)
 *  - art direction quality (lighting, perspective, mood match the niche)
 *  - technical quality (resolution, aspect ratio, no watermarks)
 *
 * The generator picks from this library instead of free-form Unsplash.
 * This eliminates wrong-niche, broken, and generic stock images.
 *
 * To add images: find the Unsplash photo ID, verify it loads, verify
 * the niche/role fit, add it here with the correct metadata.
 */

import type { Niche } from "./niche-router";
import type { ImageRole } from "./niche-profiles";

export type CuratedImage = {
  id: string;
  url: string;
  niche: Niche;
  role: ImageRole;
  brief: string;
  aspectRatio: "landscape" | "portrait" | "square";
  mood: string;
};

function unsplash(photoId: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&q=80`;
}

// ─────────────────────────────────────────────
// CONSTRUCTION
// ─────────────────────────────────────────────
const CONSTRUCTION: CuratedImage[] = [
  // Hero focal — large-scale build sites
  { id: "1504307651254-35680f356dfd", url: unsplash("1504307651254-35680f356dfd", 1920, 1080), niche: "construction", role: "hero-focal", brief: "Modern commercial building under construction with crane and steel framework", aspectRatio: "landscape", mood: "industrial-confident" },
  { id: "1541888946425-d81bb19240f5", url: unsplash("1541888946425-d81bb19240f5", 1920, 1080), niche: "construction", role: "hero-focal", brief: "Construction site with concrete structure and scaffolding at golden hour", aspectRatio: "landscape", mood: "warm-industrial" },
  { id: "1503387762-592deb58ef4e", url: unsplash("1503387762-592deb58ef4e", 1920, 1080), niche: "construction", role: "hero-focal", brief: "Heavy construction machinery on active commercial site", aspectRatio: "landscape", mood: "industrial-power" },
  // Project showcase
  { id: "1486406146926-c627a92ad1ab", url: unsplash("1486406146926-c627a92ad1ab", 1200, 800), niche: "construction", role: "project-showcase", brief: "Completed modern commercial building exterior", aspectRatio: "landscape", mood: "professional-pride" },
  { id: "1487958449943-2429e8be8625", url: unsplash("1487958449943-2429e8be8625", 1200, 800), niche: "construction", role: "project-showcase", brief: "Modern residential build completed exterior", aspectRatio: "landscape", mood: "clean-confident" },
  { id: "1600585154340-be6161a56a0c", url: unsplash("1600585154340-be6161a56a0c", 1200, 800), niche: "construction", role: "project-showcase", brief: "Architectural concrete and glass commercial building", aspectRatio: "landscape", mood: "modern-industrial" },
  { id: "1590486145612-17e984b2abb2", url: unsplash("1590486145612-17e984b2abb2", 800, 600), niche: "construction", role: "project-showcase", brief: "Residential renovation exterior showing before/after quality", aspectRatio: "landscape", mood: "transformation" },
  // Process documentary
  { id: "1504615755583-2916b52192a3", url: unsplash("1504615755583-2916b52192a3", 800, 600), niche: "construction", role: "process-documentary", brief: "Construction workers on steel framework with safety gear", aspectRatio: "landscape", mood: "crew-at-work" },
  { id: "1621905252507-b35492cc74b4", url: unsplash("1621905252507-b35492cc74b4", 800, 600), niche: "construction", role: "process-documentary", brief: "Concrete pouring and formwork during active construction", aspectRatio: "landscape", mood: "active-progress" },
  { id: "1581092160562-40aa08e78837", url: unsplash("1581092160562-40aa08e78837", 800, 600), niche: "construction", role: "process-documentary", brief: "Building framing and structural work in progress", aspectRatio: "landscape", mood: "in-progress" },
  // Team portrait
  { id: "1560472355516-28c076dcd06d", url: unsplash("1560472355516-28c076dcd06d", 600, 800), niche: "construction", role: "team-portrait", brief: "Construction professional with hardhat on site", aspectRatio: "portrait", mood: "trustworthy" },
];

// ─────────────────────────────────────────────
// RESTAURANT / FINE DINING
// ─────────────────────────────────────────────
const RESTAURANT: CuratedImage[] = [
  // Hero focal
  { id: "1414235077428-338989a2e8c0", url: unsplash("1414235077428-338989a2e8c0", 1920, 1080), niche: "restaurant", role: "hero-focal", brief: "Elegant fine dining restaurant interior with warm candlelight", aspectRatio: "landscape", mood: "intimate-luxury" },
  { id: "1517248135467-4c7edcad34c4", url: unsplash("1517248135467-4c7edcad34c4", 1920, 1080), niche: "restaurant", role: "hero-focal", brief: "Upscale restaurant dining room at evening service", aspectRatio: "landscape", mood: "atmospheric-service" },
  { id: "1550966871-3ed3cdb51f3a", url: unsplash("1550966871-3ed3cdb51f3a", 1920, 1080), niche: "restaurant", role: "hero-focal", brief: "Moody fine dining atmosphere with low warm lighting", aspectRatio: "landscape", mood: "dark-editorial" },
  // Editorial narrative — chef
  { id: "1577219491135-ce391730fb2c", url: unsplash("1577219491135-ce391730fb2c", 800, 1000), niche: "restaurant", role: "editorial-narrative", brief: "Chef working at the pass under warm kitchen light", aspectRatio: "portrait", mood: "craft-focus" },
  { id: "1556910103-1c02745aae4d", url: unsplash("1556910103-1c02745aae4d", 800, 1000), niche: "restaurant", role: "team-portrait", brief: "Chef plating a dish with precision and focus", aspectRatio: "portrait", mood: "precision-art" },
  // Editorial narrative — food
  { id: "1565299624946-b28f40a0ca4b", url: unsplash("1565299624946-b28f40a0ca4b", 800, 600), niche: "restaurant", role: "editorial-narrative", brief: "Artfully plated signature dish on dark surface, top-down", aspectRatio: "landscape", mood: "art-directed-food" },
  { id: "1540189549336-e6e99c3679fe", url: unsplash("1540189549336-e6e99c3679fe", 800, 600), niche: "restaurant", role: "editorial-narrative", brief: "Fine dining dessert plating with delicate garnish", aspectRatio: "landscape", mood: "sweet-precision" },
  { id: "1504674900247-0877df9cc836", url: unsplash("1504674900247-0877df9cc836", 800, 600), niche: "restaurant", role: "editorial-narrative", brief: "Plated main course with sauce artistry", aspectRatio: "landscape", mood: "savory-art" },
  // Ambient atmosphere
  { id: "1559339352-11d035aa65de", url: unsplash("1559339352-11d035aa65de", 600, 800), niche: "restaurant", role: "ambient-atmosphere", brief: "Wine cellar or sommelier service", aspectRatio: "portrait", mood: "cellar-warmth" },
  { id: "1551632436-cbf8dd35adfa", url: unsplash("1551632436-cbf8dd35adfa", 800, 600), niche: "restaurant", role: "ambient-atmosphere", brief: "Restaurant kitchen during active service", aspectRatio: "landscape", mood: "kitchen-energy" },
  { id: "1470337458703-46a1888eb515", url: unsplash("1470337458703-46a1888eb515", 800, 600), niche: "restaurant", role: "ambient-atmosphere", brief: "Bartender crafting cocktail in upscale bar", aspectRatio: "landscape", mood: "bar-craft" },
  // Venue context
  { id: "1555396273-367ea4eb4db5", url: unsplash("1555396273-367ea4eb4db5", 800, 600), niche: "restaurant", role: "venue-context", brief: "Restaurant exterior at evening with warm interior glow", aspectRatio: "landscape", mood: "evening-invitation" },
];

// ─────────────────────────────────────────────
// SAAS / PRODUCT
// ─────────────────────────────────────────────
const SAAS: CuratedImage[] = [
  // Product surface — dashboard/UI screenshots
  { id: "1551288049-bebda4e38f71", url: unsplash("1551288049-bebda4e38f71", 1200, 800), niche: "saas", role: "product-surface", brief: "Modern analytics dashboard with charts and metrics", aspectRatio: "landscape", mood: "data-clarity" },
  { id: "1460925895917-afdab827c52f", url: unsplash("1460925895917-afdab827c52f", 1200, 800), niche: "saas", role: "product-surface", brief: "Data analytics charts and visualization interface", aspectRatio: "landscape", mood: "technical-precision" },
  { id: "1518186285589-2f7649de83e0", url: unsplash("1518186285589-2f7649de83e0", 1200, 800), niche: "saas", role: "product-surface", brief: "Workflow automation interface with connected nodes", aspectRatio: "landscape", mood: "workflow-clarity" },
  { id: "1551434678-e076c223a692", url: unsplash("1551434678-e076c223a692", 1200, 800), niche: "saas", role: "product-surface", brief: "Modern code editor or development interface", aspectRatio: "landscape", mood: "developer-tool" },
  // Proof portrait
  { id: "1522202176988-66273c2fd55f", url: unsplash("1522202176988-66273c2fd55f", 600, 600), niche: "saas", role: "proof-portrait", brief: "Professional team member in modern workspace", aspectRatio: "square", mood: "professional-approachable" },
];

// ─────────────────────────────────────────────
// AGENCY
// ─────────────────────────────────────────────
const AGENCY: CuratedImage[] = [
  // Project showcase
  { id: "1558618666-fcd25c85cd64", url: unsplash("1558618666-fcd25c85cd64", 1200, 800), niche: "agency", role: "project-showcase", brief: "Luxury brand identity design mockup", aspectRatio: "landscape", mood: "brand-craft" },
  { id: "1586281380349-632531db7ed4", url: unsplash("1586281380349-632531db7ed4", 800, 1000), niche: "agency", role: "project-showcase", brief: "Editorial magazine spread design layout", aspectRatio: "portrait", mood: "editorial-precision" },
  { id: "1607827448387-a67db1383b59", url: unsplash("1607827448387-a67db1383b59", 800, 1000), niche: "agency", role: "project-showcase", brief: "Minimal packaging design concept", aspectRatio: "portrait", mood: "minimal-craft" },
  { id: "1561070791-2526d30994b5", url: unsplash("1561070791-2526d30994b5", 1200, 800), niche: "agency", role: "project-showcase", brief: "Brand guideline and identity system", aspectRatio: "landscape", mood: "systematic-design" },
  // Team portrait
  { id: "1507003211169-0a1dd7228f2d", url: unsplash("1507003211169-0a1dd7228f2d", 600, 800), niche: "agency", role: "team-portrait", brief: "Creative director in studio workspace", aspectRatio: "portrait", mood: "creative-authority" },
  // Ambient
  { id: "1581291518857-4e27b48ff24e", url: unsplash("1581291518857-4e27b48ff24e", 800, 600), niche: "agency", role: "ambient-atmosphere", brief: "Design sketches and process work on desk", aspectRatio: "landscape", mood: "process-intimacy" },
];

// ─────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────
const PORTFOLIO: CuratedImage[] = [
  // Hero focal
  { id: "1544717297-fa95b6ee9643", url: unsplash("1544717297-fa95b6ee9643", 1200, 800), niche: "portfolio", role: "hero-focal", brief: "Creative professional in minimal studio setting", aspectRatio: "landscape", mood: "authored-confidence" },
  { id: "1531746020798-e6953c6e8e04", url: unsplash("1531746020798-e6953c6e8e04", 800, 1000), niche: "portfolio", role: "hero-focal", brief: "High-contrast portrait of designer/creative", aspectRatio: "portrait", mood: "editorial-portrait" },
  // Project showcase
  { id: "1558618666-fcd25c85cd64", url: unsplash("1558618666-fcd25c85cd64", 1200, 800), niche: "portfolio", role: "project-showcase", brief: "Luxury brand identity design work", aspectRatio: "landscape", mood: "brand-craft" },
  { id: "1586281380349-632531db7ed4", url: unsplash("1586281380349-632531db7ed4", 800, 1000), niche: "portfolio", role: "project-showcase", brief: "Editorial layout and publication design", aspectRatio: "portrait", mood: "editorial" },
  { id: "1607827448387-a67db1383b59", url: unsplash("1607827448387-a67db1383b59", 800, 1000), niche: "portfolio", role: "project-showcase", brief: "Minimal packaging and product design", aspectRatio: "portrait", mood: "minimal" },
  { id: "1561070791-2526d30994b5", url: unsplash("1561070791-2526d30994b5", 1200, 800), niche: "portfolio", role: "project-showcase", brief: "Campaign and visual identity work", aspectRatio: "landscape", mood: "campaign-scale" },
  // Editorial narrative
  { id: "1507003211169-0a1dd7228f2d", url: unsplash("1507003211169-0a1dd7228f2d", 600, 800), niche: "portfolio", role: "editorial-narrative", brief: "Creative workspace with materials and tools", aspectRatio: "portrait", mood: "process" },
  // Ambient
  { id: "1581291518857-4e27b48ff24e", url: unsplash("1581291518857-4e27b48ff24e", 800, 600), niche: "portfolio", role: "ambient-atmosphere", brief: "Design process documentation and sketches", aspectRatio: "landscape", mood: "behind-the-scenes" },
];

// ─────────────────────────────────────────────
// REAL ESTATE
// ─────────────────────────────────────────────
const REAL_ESTATE: CuratedImage[] = [
  { id: "1600596542815-ffad4c1539a9", url: unsplash("1600596542815-ffad4c1539a9", 1920, 1080), niche: "realEstate", role: "hero-focal", brief: "Luxury home exterior with pool and landscaping", aspectRatio: "landscape", mood: "aspirational-luxury" },
  { id: "1600607687939-ce8a6c25118c", url: unsplash("1600607687939-ce8a6c25118c", 1200, 800), niche: "realEstate", role: "project-showcase", brief: "Modern luxury living room interior", aspectRatio: "landscape", mood: "interior-warmth" },
  { id: "1600566753190-17f0baa2a6c3", url: unsplash("1600566753190-17f0baa2a6c3", 1200, 800), niche: "realEstate", role: "project-showcase", brief: "Modern kitchen interior with premium finishes", aspectRatio: "landscape", mood: "kitchen-luxury" },
  { id: "1600585154526-990dced4db0d", url: unsplash("1600585154526-990dced4db0d", 1200, 800), niche: "realEstate", role: "project-showcase", brief: "Luxury primary suite interior", aspectRatio: "landscape", mood: "retreat" },
  { id: "1512917774080-9991f1c4c750", url: unsplash("1512917774080-9991f1c4c750", 1200, 800), niche: "realEstate", role: "ambient-atmosphere", brief: "Neighborhood streetscape with trees and homes", aspectRatio: "landscape", mood: "community" },
  { id: "1560448204-e02f11c3d0e2", url: unsplash("1560448204-e02f11c3d0e2", 600, 800), niche: "realEstate", role: "team-portrait", brief: "Professional in front of luxury property", aspectRatio: "portrait", mood: "broker-confidence" },
];

// ─────────────────────────────────────────────
// LAW
// ─────────────────────────────────────────────
const LAW: CuratedImage[] = [
  { id: "1497366216548-37526070297c", url: unsplash("1497366216548-37526070297c", 1200, 800), niche: "law", role: "ambient-atmosphere", brief: "Modern law office interior with bookshelves", aspectRatio: "landscape", mood: "authoritative-restraint" },
  { id: "1507679799987-c73779587ccf", url: unsplash("1507679799987-c73779587ccf", 600, 800), niche: "law", role: "team-portrait", brief: "Professional attorney portrait in office setting", aspectRatio: "portrait", mood: "credible-authority" },
  { id: "1486406146926-c627a92ad1ab", url: unsplash("1486406146926-c627a92ad1ab", 1200, 800), niche: "law", role: "venue-context", brief: "Modern city office building exterior", aspectRatio: "landscape", mood: "institutional-presence" },
];

// ─────────────────────────────────────────────
// FITNESS
// ─────────────────────────────────────────────
const FITNESS: CuratedImage[] = [
  { id: "1534438327276-14e5300c3a48", url: unsplash("1534438327276-14e5300c3a48", 1920, 1080), niche: "fitness", role: "hero-focal", brief: "Athlete mid-workout with intense focus", aspectRatio: "landscape", mood: "kinetic-power" },
  { id: "1571019613454-1cb2f99b2d8b", url: unsplash("1571019613454-1cb2f99b2d8b", 1200, 800), niche: "fitness", role: "hero-focal", brief: "CrossFit or functional training in motion", aspectRatio: "landscape", mood: "raw-energy" },
  { id: "1574680096145-d05b13162c66", url: unsplash("1574680096145-d05b13162c66", 800, 600), niche: "fitness", role: "project-showcase", brief: "Group class in session with trainer", aspectRatio: "landscape", mood: "community-energy" },
  { id: "1549060279-7aa3d2e29fd7", url: unsplash("1549060279-7aa3d2e29fd7", 600, 800), niche: "fitness", role: "team-portrait", brief: "Fitness coach in gym environment", aspectRatio: "portrait", mood: "coach-authority" },
];

// ─────────────────────────────────────────────
// BEAUTY / SPA
// ─────────────────────────────────────────────
const BEAUTY: CuratedImage[] = [
  { id: "1570172619644-dfd03ed5d881", url: unsplash("1570172619644-dfd03ed5d881", 1200, 800), niche: "beauty", role: "hero-focal", brief: "Skincare treatment in soft natural light", aspectRatio: "landscape", mood: "soft-ritual" },
  { id: "1616394584738-fc6e612e71b9", url: unsplash("1616394584738-fc6e612e71b9", 800, 600), niche: "beauty", role: "editorial-narrative", brief: "Premium skincare products in soft light", aspectRatio: "landscape", mood: "product-luxury" },
  { id: "1560750588-73207b1ef5b8", url: unsplash("1560750588-73207b1ef5b8", 600, 800), niche: "beauty", role: "team-portrait", brief: "Aesthetician or practitioner portrait in studio", aspectRatio: "portrait", mood: "warm-professional" },
  { id: "1540555700478-4be289fbecef", url: unsplash("1540555700478-4be289fbecef", 800, 600), niche: "beauty", role: "ambient-atmosphere", brief: "Spa interior with soft lighting and natural materials", aspectRatio: "landscape", mood: "sanctuary" },
];

// ─────────────────────────────────────────────
// FULL LIBRARY
// ─────────────────────────────────────────────
const ALL_IMAGES: CuratedImage[] = [
  ...CONSTRUCTION,
  ...RESTAURANT,
  ...SAAS,
  ...AGENCY,
  ...PORTFOLIO,
  ...REAL_ESTATE,
  ...LAW,
  ...FITNESS,
  ...BEAUTY,
];

/**
 * Get curated images for a niche, optionally filtered by role.
 */
export function getCuratedImages(niche: Niche, role?: ImageRole): CuratedImage[] {
  let results = ALL_IMAGES.filter((img) => img.niche === niche);
  if (role) {
    results = results.filter((img) => img.role === role);
  }
  return results;
}

/**
 * Get the best hero image for a niche.
 */
export function getHeroImage(niche: Niche): CuratedImage | null {
  const heroes = getCuratedImages(niche, "hero-focal");
  return heroes.length > 0 ? heroes[0] : null;
}

/**
 * Build the curated image block for the prompt. Instead of telling the
 * model to free-pick Unsplash IDs, we give it a curated menu.
 */
export function renderCuratedImageMenu(niche: Niche): string {
  const images = getCuratedImages(niche);
  if (images.length === 0) return "";

  const lines = images.map((img) =>
    `  - [${img.role}] ${img.brief}\n    URL: ${img.url}\n    Aspect: ${img.aspectRatio} | Mood: ${img.mood}`
  ).join("\n");

  return `=== CURATED IMAGE LIBRARY (USE THESE — do NOT free-pick Unsplash) ===

For this ${niche} site, use ONLY images from this curated library. Each image has been validated for niche correctness, composition quality, and role fit.

AVAILABLE IMAGES:
${lines}

RULES:
1. Pick images from this library that match the section's role requirement.
2. You MUST use the exact URL provided — do not modify the photo ID or parameters.
3. For hero, use an image tagged [hero-focal].
4. For showcase/gallery, use images tagged [project-showcase] or [editorial-narrative].
5. For team/chef/founder sections, use images tagged [team-portrait].
6. For atmosphere/gallery, use images tagged [ambient-atmosphere].
7. If no curated image fits a section, you MAY use a specific Unsplash URL, but ONLY if:
   - the image clearly matches the niche (no wrong-industry filler)
   - the image serves a composition role (not decorative)
   - you include the full Unsplash URL with specific photo ID
8. NEVER use a generic scenic photo (mountains, lakes, bridges, sunsets) unless the niche is explicitly outdoor/nature.
9. NEVER leave an image slot empty or broken.

=== END CURATED IMAGE LIBRARY ===`;
}
