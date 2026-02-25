import { prisma } from "@/lib/prisma";

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  percent: number;
};

export async function getCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true }
          }
        }
      }
    }
  });

  if (!course) {
    return {
      completedLessons: 0,
      totalLessons: 0,
      completedModules: 0,
      totalModules: 0,
      percent: 0
    };
  }

  const allLessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const totalLessons = allLessonIds.length;

  if (!totalLessons) {
    return {
      completedLessons: 0,
      totalLessons: 0,
      completedModules: 0,
      totalModules: course.modules.length,
      percent: 0
    };
  }

  const completed = await prisma.progress.findMany({
    where: {
      userId,
      lessonId: { in: allLessonIds }
    },
    select: {
      lessonId: true,
      moduleId: true
    }
  });

  const completedLessonIds = new Set(completed.map((item) => item.lessonId));
  const completedLessons = completedLessonIds.size;

  const completedModules = course.modules.filter((module) => {
    if (!module.lessons.length) {
      return false;
    }
    return module.lessons.every((lesson) => completedLessonIds.has(lesson.id));
  }).length;

  return {
    completedLessons,
    totalLessons,
    completedModules,
    totalModules: course.modules.length,
    percent: Math.round((completedLessons / totalLessons) * 100)
  };
}

export async function isLessonLocked(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<{ locked: boolean; previousLessonId: string | null }> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: { id: true }
          }
        }
      }
    }
  });

  if (!course) {
    return { locked: true, previousLessonId: null };
  }

  const orderedLessons = course.modules.flatMap((module) => module.lessons);
  const lessonIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);

  if (lessonIndex <= 0) {
    return { locked: false, previousLessonId: null };
  }

  const previousLessonId = orderedLessons[lessonIndex - 1]?.id ?? null;
  if (!previousLessonId) {
    return { locked: false, previousLessonId: null };
  }

  const completed = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId: previousLessonId
      }
    }
  });

  return {
    locked: !completed,
    previousLessonId
  };
}
