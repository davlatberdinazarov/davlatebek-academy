# Davlatbek Academy LMS

Production-level LMS scaffold using Next.js 14, MongoDB + Prisma, Clerk auth, UploadThing, and Vimeo.

## Features

- Clerk authentication (email/password + Google + GitHub via Clerk dashboard)
- Role-based access (`ADMIN`, `STUDENT`)
- Dashboard with enrolled courses and progress
- Course structure: Course -> Module -> Lesson
- Locked lesson flow (must complete previous lesson first)
- Lesson completion awards points
- Admin panel for creating courses/modules/lessons
- Lesson attachment upload with UploadThing
- Vimeo video playback by `videoId`
- Middleware route protection for auth and admin routes

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure Clerk:

- Enable Email/Password in Clerk dashboard
- Enable Google and GitHub OAuth in Clerk dashboard
- Add role metadata to admins: `publicMetadata.role = "ADMIN"`

4. Push Prisma schema:

```bash
npx prisma generate
npx prisma db push
```

5. Run app:

```bash
npm run dev
```

## Routes

- `/dashboard`: student dashboard
- `/courses`: enrolled courses
- `/courses/[courseId]/lessons/[lessonId]`: lesson page with lock logic
- `/admin`: admin panel

## Folder Structure

```text
app/
  (auth)/
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  (platform)/
    dashboard/page.tsx
    courses/[courseId]/lessons/[lessonId]/page.tsx
    admin/courses/new/page.tsx
  api/
    admin/courses/route.ts
    admin/modules/route.ts
    admin/lessons/route.ts
    lessons/[lessonId]/complete/route.ts
    courses/[courseId]/progress/route.ts
    uploadthing/route.ts
components/
  admin/
  dashboard/
  layout/
  ui/
lib/
  auth.ts
  progress.ts
  prisma.ts
prisma/
  schema.prisma
middleware.ts
```
