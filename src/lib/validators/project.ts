import { z } from "zod";

export const createProjectSchema = z.object({
  entryMode: z.enum(["idea", "paragraph", "script"]),
  title: z.string().trim().min(1, "请输入项目标题"),
  rawInput: z.string().trim().min(1, "请输入项目内容"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
