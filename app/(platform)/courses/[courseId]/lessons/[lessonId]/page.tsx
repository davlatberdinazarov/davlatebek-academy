import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress, isLessonLocked } from "@/lib/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CompleteLessonButton } from "@/components/dashboard/complete-lesson-button";

export default async function LessonPage({
  params
}: {
  params: { courseId: string; lessonId: string };
}) {
  const user = await requireStudent();
  const { courseId, lessonId } = params;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    }
  });

  if (!enrollment) {
    redirect("/dashboard");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
              videoId: true,
              points: true,
              attachments: {
                select: {
                  id: true,
                  name: true,
                  url: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const orderedLessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title
    }))
  );
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex === -1) {
    notFound();
  }

  const lesson = orderedLessons[currentIndex];
  const nextLesson = orderedLessons[currentIndex + 1] ?? null;
  const lockState = await isLessonLocked(user.id, courseId, lessonId);
  const isCompleted = await prisma.progress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId
      }
    }
  });
  const progress = await getCourseProgress(user.id, courseId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progress.percent} />
          <p className="text-xs text-muted-foreground">
            {progress.completedLessons}/{progress.totalLessons} lessons completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {lesson.moduleTitle} • Lesson {lesson.position}: {lesson.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
          {lockState.locked ? (
            <div className="rounded-2xl border border-dashed border-primary/35 bg-primary/10 p-6 text-sm text-muted-foreground">
              Lesson locked. Complete the previous lesson first.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/70">
              <iframe
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
                src={`https://player.vimeo.com/video/${lesson.videoId}`}
                title={lesson.title}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium">Points: +{lesson.points}</p>
            {!isCompleted ? <CompleteLessonButton disabled={lockState.locked} lessonId={lesson.id} /> : null}
            {isCompleted ? <p className="text-sm font-medium text-green-600">Completed</p> : null}
            {isCompleted && nextLesson ? (
              <Link
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                href={`/courses/${course.id}/lessons/${nextLesson.id}`}
              >
                Next Lesson
              </Link>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Attachments</p>
            {!lesson.attachments.length ? (
              <p className="text-sm text-muted-foreground">No attachments uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {lesson.attachments.map((attachment) => (
                  <a
                    className="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
                    href={attachment.url}
                    key={attachment.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {attachment.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
