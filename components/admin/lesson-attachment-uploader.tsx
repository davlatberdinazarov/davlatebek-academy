"use client";

import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/lib/uploadthing";

type LessonAttachmentUploaderProps = {
  lessonId: string;
};

export function LessonAttachmentUploader({ lessonId }: LessonAttachmentUploaderProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Upload attachment</p>
      <UploadDropzone
        endpoint="lessonAttachment"
        onClientUploadComplete={async (files) => {
          if (!files?.length) {
            return;
          }

          await Promise.all(
            files.map((file) =>
              fetch(`/api/admin/lessons/${lessonId}/attachments`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: file.name,
                  url: file.url
                })
              })
            )
          );

          router.refresh();
        }}
      />
    </div>
  );
}
