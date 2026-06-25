import { NextResponse } from "next/server";
import { createClient } from "../../../../../../../lib/supabase/server";

const BUCKET = "project-assets";

// POST (multipart): upload a user-provided image to Storage for this asset.
export async function POST(
  request: Request,
  { params }: { params: { projectId: string; assetId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${params.projectId}/${params.assetId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: `上传失败：${uploadError.message}` },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await supabase
    .from("assets")
    .update({ image_url: publicUrl, status: "uploaded" })
    .eq("id", params.assetId)
    .eq("project_id", params.projectId);

  return NextResponse.json({ imageUrl: publicUrl });
}
