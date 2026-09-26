import { describe, expect, it } from "vitest";

import type { GenerateReelJob } from "../domain/jobs.js";
import { buildReelJobId } from "./queue.js";

describe("buildReelJobId", () => {
  it("produce una clave estable por organización y revisión", () => {
    const data = {
      organizationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      revisionId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    } as GenerateReelJob;

    expect(buildReelJobId(data)).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa-cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    );
  });
});
