"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateModuleFormProps = {
  courseId: string;
};

export function CreateModuleForm({ courseId }: CreateModuleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/admin/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ courseId, title })
      });

      if (!response.ok) {
        throw new Error("Failed to create module");
      }

      setTitle("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="max-w-3xl space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-1">
          <Label htmlFor="module-title">New module title</Label>
          <Input id="module-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <Button className="md:min-w-[140px]" disabled={loading} type="submit" variant="secondary">
          {loading ? "Saving..." : "Add Module"}
        </Button>
      </div>
    </form>
  );
}
