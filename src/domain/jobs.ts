import { z } from "zod";

export const reelFormatSchema = z.enum([
  "real-estate-presenter",
  "automotive-narrated",
  "automotive-viral",
  "food-showcase",
]);

export type ReelFormat = z.infer<typeof reelFormatSchema>;

export const sceneSchema = z.object({
  sceneId: z.uuid(),
  sourceAssetKey: z.string().trim().min(1),
  label: z.string().trim().min(1).max(120),
  facts: z.record(z.string(), z.string().trim().min(1)).default({}),
});

export const generateReelJobSchema = z.object({
  organizationId: z.uuid(),
  reelId: z.uuid(),
  revisionId: z.uuid(),
  format: reelFormatSchema,
  scenes: z.array(sceneSchema).min(1).max(40),
  requestedAt: z.iso.datetime(),
});

export type GenerateReelJob = z.infer<typeof generateReelJobSchema>;

export const pipelineStageSchema = z.enum([
  "validate-input",
  "generate-script",
  "generate-clips",
  "generate-voice",
  "compose-manifest",
  "render-video",
  "validate-output",
]);

export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export type JobProgress = {
  stage: PipelineStage;
  percent: number;
  completedStages: PipelineStage[];
};

export type ReelJobResult = {
  revisionId: string;
  outputKey: string;
  manifestKey: string;
  scriptKey?: string;
  voiceKey?: string;
  clipKeys: Record<string, string>;
};

export function isNarratedFormat(format: ReelFormat): boolean {
  return format === "real-estate-presenter" || format === "automotive-narrated";
}
