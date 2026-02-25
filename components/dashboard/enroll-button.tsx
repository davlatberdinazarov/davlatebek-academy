"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type EnrollButtonProps = {
  courseId: string;
};

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onEnroll = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Enrollment failed");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={onEnroll}>
      {loading ? "Enrolling..." : "Enroll"}
    </Button>
  );
}
