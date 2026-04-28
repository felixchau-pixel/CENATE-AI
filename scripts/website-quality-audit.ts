import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { streamText } from "ai";
import { buildWebsiteProjectPrompt } from "../lib/ai/prompts-website";
import { getLanguageModel } from "../lib/ai/providers";
import { parseProjectContent } from "../lib/project-manifest";
import { runCritic, renderCriticReport } from "../lib/ai/website/critic";

type AuditPrompt = {
  slug: string;
  title: string;
};

const prompts: AuditPrompt[] = [
  {
    slug: "restaurant",
    title:
      "Build a premium restaurant website for Noma House. Include hero, menu highlights, chef story, reservation CTA, testimonials, gallery, location, and footer. Make it elegant, editorial, luxurious, and image-led with strong typography and a dark premium palette.",
  },
  {
    slug: "saas",
    title:
      "Build a premium AI productivity SaaS landing page for FlowState. Include hero, feature grid, workflow section, testimonials, pricing teaser, CTA, and footer. Make it modern, sharp, premium, and visually dynamic.",
  },
  {
    slug: "portfolio",
    title:
      "Build a high-end creative portfolio website for Lina Moreau. Include hero, selected work, about, testimonials, process, contact CTA, and footer. Make it editorial, minimal, luxurious, and image-led.",
  },
];

async function generate(title: string) {
  const startedAt = Date.now();
  const built = buildWebsiteProjectPrompt(title);
  const result = streamText({
    model: getLanguageModel("anthropic/claude-sonnet-4-20250514"),
    system: built.prompt,
    prompt: title,
  });
  const text = await result.text;
  const parsed = parseProjectContent(text);
  const critic = runCritic(built.niche, text);

  return {
    durationMs: Date.now() - startedAt,
    raw: text,
    parsed,
    niche: built.niche,
    critic,
  };
}

async function main() {
  const round = process.argv[2] ?? "round1";
  const outDir = path.join(process.cwd(), ".tmp", "website-quality", round);
  mkdirSync(outDir, { recursive: true });

  const summary: Record<string, unknown> = {};

  for (const prompt of prompts) {
    const generated = await generate(prompt.title);
    const basePath = path.join(outDir, prompt.slug);

    writeFileSync(`${basePath}.txt`, generated.raw, "utf8");
    writeFileSync(
      `${basePath}.json`,
      JSON.stringify(
        {
          slug: prompt.slug,
          prompt: prompt.title,
          niche: generated.niche,
          durationMs: generated.durationMs,
          meta: generated.parsed.meta,
          files: generated.parsed.files.map((file) => ({
            path: file.path,
            language: file.language,
            size: file.content.length,
          })),
          assets: generated.parsed.assets,
          isComplete: generated.parsed.isComplete,
          critic: generated.critic,
        },
        null,
        2
      ),
      "utf8"
    );

    console.log(renderCriticReport(generated.critic));

    summary[prompt.slug] = {
      niche: generated.niche,
      durationMs: generated.durationMs,
      meta: generated.parsed.meta,
      fileCount: generated.parsed.files.length,
      assetCount: generated.parsed.assets.length,
      isComplete: generated.parsed.isComplete,
      critic: generated.critic,
    };
  }

  writeFileSync(
    path.join(outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
