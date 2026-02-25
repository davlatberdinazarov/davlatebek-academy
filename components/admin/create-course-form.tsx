"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CreateCourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error("Failed to create course");
      }

      const course = await response.json();
      router.push(`/admin/courses/${course.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mx-auto max-w-3xl space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1">
        <Label htmlFor="title">Course title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>

      <Button disabled={loading} type="submit">
        {loading ? "Creating..." : "Create Course"}
      </Button>
    </form>
  );
}
