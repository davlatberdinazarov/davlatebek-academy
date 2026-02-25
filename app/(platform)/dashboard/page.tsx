import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminAccess, requireAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCourseProgress } from "@/lib/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnrollButton } from "@/components/dashboard/enroll-button";
import { BookMarked, CheckCircle2, Trophy } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  if (hasAdminAccess(user.role)) {
    redirect("/admin");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const enrolledCoursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const progress = await getCourseProgress(user.id, enrollment.courseId);
      return {
        ...enrollment.course,
        progress
      };
    })
  );

  const enrolledCourseIds = enrollments.map((entry) => entry.courseId);
  const discoverCourseWhere = enrolledCourseIds.length
    ? {
        published: true,
        id: {
          notIn: enrolledCourseIds
        }
      }
    : {
        published: true
      };

  const discoverCourses = await prisma.course.findMany({
    where: discoverCourseWhere,
    orderBy: {
      createdAt: "desc"
    }
  });

  const points = await prisma.points.findUnique({
    where: {
      userId: user.id
    }
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Enrolled Courses</CardDescription>
                <CardTitle>{enrollments.length}</CardTitle>
              </div>
              <span className="rounded-xl border border-primary/35 bg-primary/15 p-2 text-primary shadow-[0_0_16px_rgba(103,116,255,0.35)]">
                <BookMarked className="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Total Points</CardDescription>
                <CardTitle>{points?.total ?? 0}</CardTitle>
              </div>
              <span className="rounded-xl border border-primary/35 bg-primary/15 p-2 text-primary shadow-[0_0_16px_rgba(103,116,255,0.35)]">
                <Trophy className="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Completed Lessons</CardDescription>
                <CardTitle>
                  {enrolledCoursesWithProgress.reduce((total, item) => total + item.progress.completedLessons, 0)}
                </CardTitle>
              </div>
              <span className="rounded-xl border border-primary/35 bg-primary/15 p-2 text-primary shadow-[0_0_16px_rgba(103,116,255,0.35)]">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">My Courses</h2>
        {!enrolledCoursesWithProgress.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You are not enrolled in any course yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrolledCoursesWithProgress.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={course.progress.percent} />
                  <p className="text-xs text-muted-foreground">
                    {course.progress.completedLessons}/{course.progress.totalLessons} lessons completed •{" "}
                    {course.progress.completedModules}/{course.progress.totalModules} modules completed
                  </p>
                  <Link className="text-sm font-medium text-primary transition-colors hover:text-primary/80" href={`/courses/${course.id}`}>
                    Continue learning
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Discover Courses</h2>
        {!discoverCourses.length ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">No new published course available.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {discoverCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <EnrollButton courseId={course.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
