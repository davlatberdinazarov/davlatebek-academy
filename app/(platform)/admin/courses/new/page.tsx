import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "@/components/admin/create-course-form";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Create New Course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course details</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
