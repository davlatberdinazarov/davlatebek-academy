import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateModuleForm } from "@/components/admin/create-module-form";
import { CreateLessonForm } from "@/components/admin/create-lesson-form";
import { LessonAttachmentUploader } from "@/components/admin/lesson-attachment-uploader";
import { CourseSettingsForm } from "@/components/admin/course-settings-form";

export default async function ManageCoursePage({ params }: { params: { courseId: string } }) {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: {
      id: params.courseId
    },
    include: {
      modules: {
        orderBy: {
          position: "asc"
        },
        include: {
          lessons: {
            orderBy: {
              position: "asc"
            },
            select: {
              id: true,
              title: true,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseSettingsForm
            courseId={course.id}
            initialDescription={course.description ?? ""}
            initialPublished={course.published}
            initialTitle={course.title}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Module</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateModuleForm courseId={course.id} />
        </CardContent>
      </Card>

      {course.modules.map((module) => (
        <Card key={module.id}>
          <CardHeader>
            <CardTitle>
              Module {module.position}: {module.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CreateLessonForm moduleId={module.id} />

            {!module.lessons.length ? (
              <p className="text-sm text-muted-foreground">No lessons in this module.</p>
            ) : (
              <div className="space-y-3">
                {module.lessons.map((lesson) => (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl" key={lesson.id}>
                    <p className="font-medium">Lesson {lesson.position}: {lesson.title}</p>
                    <p className="text-sm text-muted-foreground">Vimeo ID: {lesson.videoId}</p>
                    <p className="text-sm text-muted-foreground">Points: {lesson.points}</p>

                    <div className="mt-3">
                      <LessonAttachmentUploader lessonId={lesson.id} />
                    </div>

                    <div className="mt-3 space-y-2">
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
