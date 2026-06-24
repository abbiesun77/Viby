import { NextResponse } from "next/server";
import { createProjectSchema } from "../../../lib/validators/project";

export async function POST(request: Request) {
  const body = createProjectSchema.parse(await request.json());

  return NextResponse.json(
    {
      project: {
        id: "proj_test_1",
        entryMode: body.entryMode,
        title: body.title,
        rawInput: body.rawInput,
        currentState: "brief",
      },
    },
    { status: 201 },
  );
}
