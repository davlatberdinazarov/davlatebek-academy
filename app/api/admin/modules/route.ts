import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const courseId = body?.courseId;
  const title = body?.title?.trim();

  if (!courseId || !title) {
    return NextResponse.json({ error: "courseId and title are required" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const modulesCount = await prisma.module.count({ where: { courseId } });

  const moduleRecord = await prisma.module.create({
    data: {
      courseId,
      title,
      position: modulesCount + 1
    }
  });

  return NextResponse.json(moduleRecord);
}
