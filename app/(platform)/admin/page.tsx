import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      modules: {
        select: {
          id: true,
          lessons: {
            select: {
              id: true
            }
          }
        }
      }
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Link href="/admin/courses/new">
          <Button>Create Course</Button>
        </Link>
      </div>

      {!courses.length ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No courses yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle>{course.title}</CardTitle>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${course.published ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}
                  >
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {course.modules.length} modules • {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons
                </p>
                <Link
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  href={`/admin/courses/${course.id}`}
                >
                  Manage
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
