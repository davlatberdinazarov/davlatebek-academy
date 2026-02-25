import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const moduleId = body?.moduleId;
  const title = body?.title?.trim();
  const description = body?.description?.trim();
  const videoId = body?.videoId?.trim();
  const points = Number(body?.points ?? 10);

  if (!moduleId || !title || !videoId) {
    return NextResponse.json({ error: "moduleId, title and videoId are required" }, { status: 400 });
  }

  const moduleRecord = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!moduleRecord) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const lessonsCount = await prisma.lesson.count({ where: { moduleId } });

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title,
      description,
      videoId,
      points: Number.isFinite(points) && points > 0 ? points : 10,
      isPublished: true,
      position: lessonsCount + 1
    }
  });

  return NextResponse.json(lesson);
}
