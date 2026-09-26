import {
  generateReelJobSchema,
  isNarratedFormat,
  type GenerateReelJob,
  type JobProgress,
  type PipelineStage,
  type ReelJobResult,
} from "../domain/jobs.js";
import type { PipelineProviders } from "../providers/contracts.js";

type PipelineOptions = {
  providers: PipelineProviders;
  onProgress?: (progress: JobProgress) => Promise<void>;
};

export function getPipelineStages(data: GenerateReelJob): PipelineStage[] {
  const stages: PipelineStage[] = ["validate-input"];
  if (isNarratedFormat(data.format)) stages.push("generate-script");
  stages.push("generate-clips");
  if (isNarratedFormat(data.format)) stages.push("generate-voice");

  return [...stages, "compose-manifest", "render-video", "validate-output"];
}

export async function runGenerationPipeline(
  input: GenerateReelJob,
  options: PipelineOptions,
): Promise<ReelJobResult> {
  const data = generateReelJobSchema.parse(input);
  const stages = getPipelineStages(data);
  const completedStages: PipelineStage[] = [];

  const runStage = async <T>(stage: PipelineStage, operation: () => Promise<T>) => {
    const result = await operation();
    completedStages.push(stage);
    await options.onProgress?.({
      stage,
      percent: Math.round((completedStages.length / stages.length) * 100),
      completedStages: [...completedStages],
    });
    return result;
  };

  await runStage("validate-input", async () => undefined);
  const script = isNarratedFormat(data.format)
    ? await runStage("generate-script", () => options.providers.script.generate(data))
    : undefined;
  const clipKeys = await runStage("generate-clips", () =>
    options.providers.clips.generate(data),
  );
  const voiceKey = script
    ? await runStage("generate-voice", () => options.providers.voice.generate(data, script))
    : undefined;
  const manifestKey = await runStage("compose-manifest", () =>
    options.providers.render.composeManifest(data),
  );
  const outputKey = await runStage("render-video", () =>
    options.providers.render.render(data, manifestKey),
  );
  await runStage("validate-output", () => options.providers.render.validate(data, outputKey));

  return {
    revisionId: data.revisionId,
    outputKey,
    manifestKey,
    scriptKey: script?.key,
    voiceKey,
    clipKeys,
  };
}
