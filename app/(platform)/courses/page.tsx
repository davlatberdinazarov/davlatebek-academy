import Link from "next/link";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress } from "@/lib/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function CoursesPage() {
  const user = await requireStudent();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        include: {
          modules: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                take: 1,
                select: {
                  id: true
                }
              }
            }
          }
        }
      }
    }
  });

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => ({
      ...enrollment.course,
      progress: await getCourseProgress(user.id, enrollment.courseId)
    }))
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">My Enrolled Courses</h1>
      {!coursesWithProgress.length ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">Enroll from dashboard to start learning.</CardContent>
        </Card>
      ) : (
        coursesWithProgress.map((course) => {
          const firstLesson = course.modules.flatMap((module) => module.lessons)[0];
          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={course.progress.percent} />
                <p className="text-xs text-muted-foreground">
                  {course.progress.completedLessons}/{course.progress.totalLessons} lessons completed
                </p>
                {firstLesson ? (
                  <Link
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    href={`/courses/${course.id}/lessons/${firstLesson.id}`}
                  >
                    Open course
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground">Course has no lessons yet.</p>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
