import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { projectId: string } },
) {
  return NextResponse.json({
    scenes: [
      {
        id: "scene_1",
        projectId: params.projectId,
        title: "便利店夜班的异常重逢",
        summary: "主角在凌晨便利店值夜班时，遇见穿着旧宇航服的未来自己。",
        status: "draft",
      },
      {
        id: "scene_2",
        projectId: params.projectId,
        title: "来自未来的任务交接",
        summary: "未来的自己留下一个必须在天亮前完成的选择题。",
        status: "draft",
      },
    ],
    nextStep: "继续细化镜头清单",
  });
}
