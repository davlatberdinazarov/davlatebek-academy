import { NextResponse } from "next/server";
import { hasAdminAccess, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress } from "@/lib/progress";

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string } }
) {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (hasAdminAccess(user.role)) {
    return NextResponse.json({ error: "Admins do not have course progress" }, { status: 403 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: params.courseId
      }
    }
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const progress = await getCourseProgress(user.id, params.courseId);
  return NextResponse.json(progress);
}
