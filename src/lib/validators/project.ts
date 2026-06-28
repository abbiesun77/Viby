import { z } from "zod";

export const createProjectSchema = z.object({
  entryMode: z.enum(["idea", "script"]),
  title: z.string().trim().min(1, "请输入项目标题"),
  rawInput: z.string().trim().min(1, "请输入项目内容"),
  style: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  mood: z.string().trim().optional(),
  contentType: z.string().trim().optional(),
  visualFeel: z.string().trim().optional(),
});

export const projectRouteParamsSchema = z.object({
  projectId: z.string().trim().min(1, "缺少项目 ID"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ProjectRouteParams = z.infer<typeof projectRouteParamsSchema>;
