import { z } from "zod";

export const reelFormatSchema = z.enum([
  "real-estate-presenter",
  "automotive-narrated",
  "automotive-viral",
  "food-showcase",
]);

export type ReelFormat = z.infer<typeof reelFormatSchema>;
