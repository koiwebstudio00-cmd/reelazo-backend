import type { JobProgress, ReelJobResult } from "../domain/jobs.js";

export interface WorkflowStore {
  markStarted(revisionId: string, attempt: number): Promise<void>;
  saveProgress(revisionId: string, progress: JobProgress): Promise<void>;
  markCompleted(revisionId: string, result: ReelJobResult): Promise<void>;
  markFailed(revisionId: string, error: Error): Promise<void>;
}

export const noOpWorkflowStore: WorkflowStore = {
  async markStarted() {},
  async saveProgress() {},
  async markCompleted() {},
  async markFailed() {},
};
