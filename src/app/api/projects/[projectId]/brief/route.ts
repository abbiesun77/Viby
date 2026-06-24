import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    brief: {
      genre: "科幻剧情",
      tone: "克制、轻微荒诞、电影感",
      goal: "先稳定角色和便利店场景，再展开镜头",
    },
  });
}
