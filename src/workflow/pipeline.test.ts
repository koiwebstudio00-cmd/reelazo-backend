import { describe, expect, it, vi } from "vitest";

import type { GenerateReelJob } from "../domain/jobs.js";
import { createFixtureProviders } from "../providers/fixture.js";
import { getPipelineStages, runGenerationPipeline } from "./pipeline.js";

const baseJob: GenerateReelJob = {
  organizationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  reelId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  revisionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  format: "real-estate-presenter",
  requestedAt: "2026-09-26T12:00:00.000Z",
  scenes: [
    {
      sceneId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      sourceAssetKey: "originals/front.jpg",
      label: "Frente",
      facts: { location: "Tucumán" },
    },
  ],
};

describe("generation pipeline", () => {
  it("ejecuta voz y guion para formatos narrados", async () => {
    const progress = vi.fn();
    const result = await runGenerationPipeline(baseJob, {
      providers: createFixtureProviders(0),
      onProgress: async (value) => void progress(value),
    });

    expect(result.scriptKey).toBeDefined();
    expect(result.voiceKey).toBeDefined();
    expect(result.clipKeys[baseJob.scenes[0].sceneId]).toContain(baseJob.revisionId);
    expect(progress).toHaveBeenLastCalledWith(
      expect.objectContaining({ stage: "validate-output", percent: 100 }),
    );
  });

  it("omite guion y voz en formatos visuales", async () => {
    const data = { ...baseJob, format: "automotive-viral" as const };
    const result = await runGenerationPipeline(data, {
      providers: createFixtureProviders(0),
    });

    expect(getPipelineStages(data)).not.toContain("generate-script");
    expect(getPipelineStages(data)).not.toContain("generate-voice");
    expect(result.scriptKey).toBeUndefined();
    expect(result.voiceKey).toBeUndefined();
  });
});
