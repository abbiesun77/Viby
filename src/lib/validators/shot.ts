import { z } from "zod";

// Shot card fields per spec v2.2: 景别 · 主体 · 动作 · 氛围
export const shotUpdateSchema = z.object({
  framing: z.string().optional(),
  subject: z.string().optional(),
  action: z.string().optional(),
  mood: z.string().optional(),
});

export type ShotUpdateInput = z.infer<typeof shotUpdateSchema>;
