import { NextResponse } from "next/server";
import { hasAdminAccess, requireApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress, isLessonLocked } from "@/lib/progress";

export async function POST(
  _req: Request,
  { params }: { params: { lessonId: string } }
) {
  const user = await requireApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (hasAdminAccess(user.role)) {
    return NextResponse.json({ error: "Admins cannot complete lessons" }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      module: true
    }
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: lesson.module.courseId
      }
    }
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const lockState = await isLessonLocked(user.id, lesson.module.courseId, lesson.id);
  if (lockState.locked) {
    return NextResponse.json(
      {
        error: "Complete previous lesson first",
        previousLessonId: lockState.previousLessonId
      },
      { status: 403 }
    );
  }

  const existingProgress = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId: lesson.id
      }
    }
  });

  if (!existingProgress) {
    await prisma.$transaction(async (tx) => {
      await tx.progress.create({
        data: {
          userId: user.id,
          courseId: lesson.module.courseId,
          moduleId: lesson.moduleId,
          lessonId: lesson.id
        }
      });

      await tx.points.upsert({
        where: {
          userId: user.id
        },
        create: {
          userId: user.id,
          total: lesson.points
        },
        update: {
          total: {
            increment: lesson.points
          }
        }
      });
    });
  }

  const progress = await getCourseProgress(user.id, lesson.module.courseId);
  const points = await prisma.points.findUnique({ where: { userId: user.id } });

  return NextResponse.json({
    completed: true,
    progress,
    points: points?.total ?? 0
  });
}
