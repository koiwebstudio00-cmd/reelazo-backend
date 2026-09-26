import type { GenerateReelJob } from "../domain/jobs.js";

export type GeneratedScript = {
  key: string;
  linesBySceneId: Record<string, string>;
};

export interface ScriptProvider {
  generate(data: GenerateReelJob): Promise<GeneratedScript>;
}

export interface ClipProvider {
  generate(data: GenerateReelJob): Promise<Record<string, string>>;
}

export interface VoiceProvider {
  generate(data: GenerateReelJob, script: GeneratedScript): Promise<string>;
}

export interface RenderProvider {
  composeManifest(data: GenerateReelJob): Promise<string>;
  render(data: GenerateReelJob, manifestKey: string): Promise<string>;
  validate(data: GenerateReelJob, outputKey: string): Promise<void>;
}

export type PipelineProviders = {
  script: ScriptProvider;
  clips: ClipProvider;
  voice: VoiceProvider;
  render: RenderProvider;
};
