import { NextResponse } from "next/server";
import { hasAdminAccess, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (hasAdminAccess(user.role)) {
    return NextResponse.json({ error: "Admins manage courses and cannot enroll" }, { status: 403 });
  }

  const course = await prisma.course.findUnique({ where: { id: params.courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: params.courseId
      }
    },
    create: {
      userId: user.id,
      courseId: params.courseId
    },
    update: {}
  });

  return NextResponse.json(enrollment);
}
