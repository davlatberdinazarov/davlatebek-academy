"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type CreateLessonFormProps = {
  moduleId: string;
};

export function CreateLessonForm({ moduleId }: CreateLessonFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");
  const [points, setPoints] = useState(10);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          moduleId,
          title,
          description,
          videoId,
          points
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create lesson");
      }

      setTitle("");
      setDescription("");
      setVideoId("");
      setPoints(10);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-5"
      onSubmit={onSubmit}
    >
      <p className="text-sm font-semibold">Add lesson</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`lesson-title-${moduleId}`}>Title</Label>
          <Input id={`lesson-title-${moduleId}`} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`lesson-video-${moduleId}`}>Vimeo videoId</Label>
          <Input
            id={`lesson-video-${moduleId}`}
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
        <div className="space-y-1">
          <Label htmlFor={`lesson-description-${moduleId}`}>Description</Label>
          <Textarea
            id={`lesson-description-${moduleId}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`lesson-points-${moduleId}`}>Points</Label>
          <Input
            id={`lesson-points-${moduleId}`}
            value={points}
            min={1}
            onChange={(e) => setPoints(Number(e.target.value) || 1)}
            type="number"
            required
          />
        </div>
      </div>
      <Button disabled={loading} type="submit" variant="secondary">
        {loading ? "Saving..." : "Create Lesson"}
      </Button>
    </form>
  );
}
