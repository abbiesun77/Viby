import { NextResponse } from "next/server";
import { projectRouteParamsSchema } from "../../../../../lib/validators/project";

export async function POST(
  _request: Request,
  context: { params: { projectId: string } },
) {
  projectRouteParamsSchema.parse(context.params);

  return NextResponse.json({
    brief: {
      genre: "科幻剧情",
      tone: "克制、轻微荒诞、电影感",
      goal: "先稳定角色和便利店场景，再展开镜头",
    },
  });
}
