import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const admin = await requireApiAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = body?.title?.trim();
  const description = body?.description?.trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      createdById: admin.id,
      published: true
    }
  });

  return NextResponse.json(course);
}
