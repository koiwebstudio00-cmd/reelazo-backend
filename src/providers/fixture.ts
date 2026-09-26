import type { GenerateReelJob } from "../domain/jobs.js";
import type {
  ClipProvider,
  GeneratedScript,
  PipelineProviders,
  RenderProvider,
  ScriptProvider,
  VoiceProvider,
} from "./contracts.js";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

class FixtureScriptProvider implements ScriptProvider {
  constructor(private readonly delayMs: number) {}

  async generate(data: GenerateReelJob): Promise<GeneratedScript> {
    await wait(this.delayMs);
    return {
      key: `fixtures/${data.revisionId}/script.json`,
      linesBySceneId: Object.fromEntries(
        data.scenes.map((scene) => [scene.sceneId, scene.label]),
      ),
    };
  }
}

class FixtureClipProvider implements ClipProvider {
  constructor(private readonly delayMs: number) {}

  async generate(data: GenerateReelJob): Promise<Record<string, string>> {
    await wait(this.delayMs);
    return Object.fromEntries(
      data.scenes.map((scene) => [
        scene.sceneId,
        `fixtures/${data.revisionId}/clips/${scene.sceneId}.mp4`,
      ]),
    );
  }
}

class FixtureVoiceProvider implements VoiceProvider {
  constructor(private readonly delayMs: number) {}

  async generate(data: GenerateReelJob, _script: GeneratedScript): Promise<string> {
    await wait(this.delayMs);
    return `fixtures/${data.revisionId}/voice.mp3`;
  }
}

class FixtureRenderProvider implements RenderProvider {
  constructor(private readonly delayMs: number) {}

  async composeManifest(data: GenerateReelJob): Promise<string> {
    await wait(this.delayMs);
    return `fixtures/${data.revisionId}/manifest.json`;
  }

  async render(data: GenerateReelJob, _manifestKey: string): Promise<string> {
    await wait(this.delayMs);
    return `fixtures/${data.revisionId}/reel.mp4`;
  }

  async validate(_data: GenerateReelJob, _outputKey: string): Promise<void> {
    await wait(this.delayMs);
  }
}

export function createFixtureProviders(delayMs: number): PipelineProviders {
  return {
    script: new FixtureScriptProvider(delayMs),
    clips: new FixtureClipProvider(delayMs),
    voice: new FixtureVoiceProvider(delayMs),
    render: new FixtureRenderProvider(delayMs),
  };
}
