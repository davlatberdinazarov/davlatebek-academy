import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description.trim() : undefined;
  const published = typeof body?.published === "boolean" ? body.published : undefined;

  const existing = await prisma.course.findUnique({
    where: { id: params.courseId },
    select: { id: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const course = await prisma.course.update({
    where: { id: params.courseId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(published !== undefined ? { published } : {})
    }
  });

  return NextResponse.json(course);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.course.findUnique({
    where: { id: params.courseId },
    select: { id: true }
  });
  if (!existing) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  await prisma.course.delete({
    where: { id: params.courseId }
  });

  return NextResponse.json({ success: true });
}
