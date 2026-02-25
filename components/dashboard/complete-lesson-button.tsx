"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CompleteLessonButtonProps = {
  lessonId: string;
  disabled?: boolean;
};

export function CompleteLessonButton({ lessonId, disabled }: CompleteLessonButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onComplete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST"
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Could not complete lesson");
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onComplete} disabled={loading || disabled}>
      {loading ? "Saving..." : "Mark As Completed"}
    </Button>
  );
}
