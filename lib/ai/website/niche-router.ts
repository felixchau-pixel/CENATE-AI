/**
 * Niche router — deterministic keyword routing for website briefs.
 *
 * Maps a free-text prompt to one of ten niches. The router runs BEFORE
 * generation so the rest of the control stack (profile, asset plan,
 * structural defaults, motion, critic) can specialize on the result.
 *
 * Routing is keyword-based and deterministic — no LLM calls. Order matters:
 * the first niche whose pattern matches wins. More specific niches are
 * checked before more generic ones.
 */

export type Niche =
  | "construction"
  | "restaurant"
  | "saas"
  | "agency"
  | "portfolio"
  | "realEstate"
  | "law"
  | "fitness"
  | "beauty"
  | "generic";

type NicheRule = {
  niche: Niche;
  patterns: RegExp[];
};

// Patterns are checked in order. Multi-word phrases first, then strong
// single keywords. Each pattern is anchored on word boundaries to avoid
// false positives ("law" matching "lawn", "spa" matching "space").
const RULES: NicheRule[] = [
  {
    niche: "realEstate",
    patterns: [
      /\breal[\s-]?estate\b/i,
      /\bproperty\s+(?:listing|listings|firm|group|agency)\b/i,
      /\b(?:luxury|premium)\s+(?:home|homes|property|properties|listings?)\b/i,
      /\brealtor\b/i,
      /\bhome\s+listings?\b/i,
    ],
  },
  {
    niche: "law",
    patterns: [
      /\blaw\s+(?:firm|practice|office|group)\b/i,
      /\battorney(?:s)?\b/i,
      /\blawyer(?:s)?\b/i,
      /\blegal\s+(?:practice|services|counsel|firm|advisor)\b/i,
      /\b(?:litigation|barrister|solicitor)\b/i,
    ],
  },
  {
    niche: "construction",
    patterns: [
      /\bconstruction\b/i,
      /\b(?:general\s+)?contractor\b/i,
      /\bbuilder(?:s)?\b/i,
      /\b(?:home|residential|commercial)\s+building\b/i,
      /\brenovation(?:s)?\b/i,
      /\b(?:roofing|concrete|framing|excavation)\b/i,
    ],
  },
  {
    niche: "restaurant",
    patterns: [
      /\brestaurant\b/i,
      /\b(?:fine|casual)\s+dining\b/i,
      /\bbistro\b/i,
      /\bcaf[eé]\b/i,
      /\bbrasserie\b/i,
      /\beatery\b/i,
      /\b(?:tasting\s+menu|chef'?s?\s+table)\b/i,
      /\bmichelin\b/i,
    ],
  },
  {
    niche: "saas",
    patterns: [
      /\bsaas\b/i,
      /\b(?:ai|software|platform|product)\s+(?:landing|launch)\b/i,
      /\bsoftware\s+platform\b/i,
      /\bworkflow\s+(?:platform|tool|software|automation)\b/i,
      /\bautomation\s+(?:platform|tool|software)\b/i,
      /\bproductivity\s+(?:platform|tool|app)\b/i,
      /\b(?:dashboard|analytics)\s+(?:platform|product)\b/i,
      /\bdeveloper\s+tool(?:s)?\b/i,
      /\bapi\s+(?:platform|product)\b/i,
      /\bdata\s+platform\b/i,
    ],
  },
  {
    niche: "fitness",
    patterns: [
      /\bgym\b/i,
      /\bfitness\b/i,
      /\b(?:personal|strength|mobility)\s+train(?:er|ing)\b/i,
      /\bcrossfit\b/i,
      /\byoga\s+studio\b/i,
      /\bpilates\b/i,
      /\bathletic\s+(?:club|performance)\b/i,
    ],
  },
  {
    niche: "beauty",
    patterns: [
      /\bsalon\b/i,
      /\b(?:day|medical|wellness)\s+spa\b/i,
      /\b(?:beauty|skincare|skin\s+care)\s+(?:brand|studio|clinic|line)\b/i,
      /\b(?:hair|nail|brow|lash)\s+(?:studio|salon|bar)\b/i,
      /\bcosmetic(?:s)?\s+(?:brand|line)\b/i,
      /\baesthetics?\s+(?:clinic|studio)\b/i,
    ],
  },
  {
    niche: "agency",
    patterns: [
      /\b(?:creative|design|branding|digital|marketing|advertising)\s+agency\b/i,
      /\bdesign\s+studio\b/i,
      /\bbrand\s+studio\b/i,
      /\bproduction\s+studio\b/i,
      /\bagency\s+website\b/i,
    ],
  },
  {
    niche: "portfolio",
    patterns: [
      /\bportfolio\b/i,
      /\bpersonal\s+(?:site|website)\b/i,
      /\bcreative\s+(?:portfolio|practice)\b/i,
      /\b(?:photographer|illustrator|designer|art\s+director)\b/i,
      /\b(?:freelance|independent)\s+(?:designer|developer|creative)\b/i,
    ],
  },
];

/**
 * detectNiche — return the most specific niche the prompt matches.
 * Falls back to "generic" if no rule fires.
 */
export function detectNiche(prompt: string): Niche {
  if (!prompt) return "generic";
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(prompt))) {
      return rule.niche;
    }
  }
  return "generic";
}

/**
 * Human-readable niche label, used in critic prompts and reports.
 */
export const NICHE_LABELS: Record<Niche, string> = {
  construction: "Construction / Contractor",
  restaurant: "Restaurant / Fine Dining",
  saas: "SaaS / Product",
  agency: "Creative Agency / Studio",
  portfolio: "Creative Portfolio",
  realEstate: "Luxury Real Estate",
  law: "Law Firm / Legal Practice",
  fitness: "Fitness / Gym / Studio",
  beauty: "Beauty / Spa / Salon",
  generic: "Generic Premium Website",
};
