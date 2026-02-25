import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { requireApiAdmin } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  lessonAttachment: f({
    image: { maxFileSize: "8MB", maxFileCount: 3 },
    text: { maxFileSize: "4MB", maxFileCount: 3 },
    pdf: { maxFileSize: "16MB", maxFileCount: 3 }
  })
    .middleware(async () => {
      const admin = await requireApiAdmin();
      if (!admin) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: admin.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name
      };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
