import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress } from "@/lib/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const user = await requireStudent();
  const { courseId } = params;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId
      }
    }
  });

  if (!enrollment) {
    notFound();
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
              position: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const progress = await getCourseProgress(user.id, courseId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{course.description}</p>
          <Progress value={progress.percent} />
          <p className="text-xs text-muted-foreground">
            {progress.completedLessons}/{progress.totalLessons} lessons • {progress.completedModules}/{progress.totalModules} modules completed
          </p>
        </CardContent>
      </Card>

      {course.modules.map((module) => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle className="text-base">Module {module.position}: {module.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {module.lessons.map((lesson) => (
              <Link
                className="block rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
                href={`/courses/${course.id}/lessons/${lesson.id}`}
                key={lesson.id}
              >
                Lesson {lesson.position}: {lesson.title}
              </Link>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
