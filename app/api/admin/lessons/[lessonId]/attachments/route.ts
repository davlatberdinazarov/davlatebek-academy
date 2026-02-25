import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { lessonId: string } }
) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = body?.name?.trim();
  const url = body?.url?.trim();

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const attachment = await prisma.attachment.create({
    data: {
      lessonId: params.lessonId,
      name,
      url
    }
  });

  return NextResponse.json(attachment);
}
