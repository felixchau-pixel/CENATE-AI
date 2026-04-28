import { generateDummyPassword } from "./db/utils";

export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const guestRegex = /^guest-\d+$/;

/**
 * Temporary kill-switch for all OpenAI API calls.
 * Set DISABLE_OPENAI=1 in .env.local when OpenAI quota is exhausted.
 * When true: OpenAI models are hidden from the UI, image generation
 * skips the API and returns placeholders immediately.
 */
export const OPENAI_DISABLED =
  process.env.DISABLE_OPENAI === "1" || process.env.DISABLE_OPENAI === "true";

export const DUMMY_PASSWORD = generateDummyPassword();

export const suggestions = [
  "Build a premium SaaS landing page with a sharp hero and product UI",
  "Create a luxury restaurant website with menu, gallery, and reservations",
  "Design a construction company site with services, project proof, and quote CTA",
  "Make a boutique hotel homepage with rooms, amenities, and booking CTA",
  "Create a modern agency site with case studies, testimonials, and contact section",
  "Design an ecommerce product page with gallery, reviews, and sticky buy section",
];
