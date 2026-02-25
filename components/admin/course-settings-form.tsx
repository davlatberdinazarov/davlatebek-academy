"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type CourseSettingsFormProps = {
  courseId: string;
  initialTitle: string;
  initialDescription: string;
  initialPublished: boolean;
};

export function CourseSettingsForm({
  courseId,
  initialTitle,
  initialDescription,
  initialPublished
}: CourseSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [published, setPublished] = useState(initialPublished);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          published
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Could not update course");
      }

      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update course");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setError(null);
    const confirmDelete = window.confirm(
      "Kursni o'chirsangiz uning barcha modullari, darslari va progress ma'lumotlari ham o'chadi. Davom etasizmi?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Could not delete course");
      }

      router.push("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete course");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSave}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-1">
          <Label htmlFor={`course-title-${courseId}`}>Course title</Label>
          <Input
            id={`course-title-${courseId}`}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </div>
        <label className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4">
          <span className="text-sm font-medium">Published</span>
          <input
            checked={published}
            className="h-4 w-4 accent-indigo-500"
            onChange={(event) => setPublished(event.target.checked)}
            type="checkbox"
          />
        </label>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`course-description-${courseId}`}>Description</Label>
        <Textarea
          id={`course-description-${courseId}`}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          value={description}
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={saving || deleting} type="submit">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button disabled={saving || deleting} onClick={onDelete} type="button" variant="outline">
          {deleting ? "Deleting..." : "Delete Course"}
        </Button>
      </div>
    </form>
  );
}
