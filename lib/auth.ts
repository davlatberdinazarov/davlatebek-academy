import { Prisma, UserRole, type User } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SUPERADMIN_EMAILS = new Set(["davlatberdinazarov0708@gmail.com"]);

function metadataRoleToDbRole(role: unknown): UserRole {
  const normalizedRole = typeof role === "string" ? role.toUpperCase() : "";

  if (normalizedRole === "SUPERADMIN") {
    return UserRole.SUPERADMIN;
  }
  return normalizedRole === "ADMIN" ? UserRole.ADMIN : UserRole.STUDENT;
}

export function hasAdminAccess(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
}

function resolveRole({
  existingRole,
  roleFromMetadata,
  isSuperAdmin
}: {
  existingRole?: UserRole;
  roleFromMetadata: UserRole;
  isSuperAdmin: boolean;
}): UserRole {
  // Keep storage-compatible role for admin-level access.
  // SUPERADMIN email/users are persisted as ADMIN because permissions are identical.
  if (isSuperAdmin || roleFromMetadata === UserRole.SUPERADMIN) {
    return UserRole.ADMIN;
  }
  if (roleFromMetadata === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }
  if (existingRole === UserRole.SUPERADMIN) {
    return UserRole.ADMIN;
  }
  return existingRole ?? UserRole.STUDENT;
}

function isUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function getCurrentDbUser(): Promise<User | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return null;
  }

  const clerk = await currentUser();
  const email = (clerk?.primaryEmailAddress?.emailAddress ?? `${userId}@clerk.local`).toLowerCase();
  const roleFromMetadata = metadataRoleToDbRole(
    (sessionClaims?.metadata as { role?: string } | undefined)?.role
  );
  const name = [clerk?.firstName, clerk?.lastName].filter(Boolean).join(" ") || null;
  const imageUrl = clerk?.imageUrl ?? null;
  const knownEmails = new Set([email]);
  for (const emailAddress of clerk?.emailAddresses ?? []) {
    knownEmails.add(emailAddress.emailAddress.toLowerCase());
  }
  const knownEmailsList = [...knownEmails];
  const isSuperAdmin = knownEmailsList.some((knownEmail) => SUPERADMIN_EMAILS.has(knownEmail));

  // Multiple server components can hit auth sync in parallel for one login request.
  // Retry on unique conflicts so race conditions never bubble up to users.
  for (let attempt = 0; attempt < 3; attempt++) {
    const [existingByClerkId, existingByEmail] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkId: userId }
      }),
      prisma.user.findUnique({
        where: { email }
      })
    ]);

    if (existingByClerkId) {
      const canUpdateEmail = !existingByEmail || existingByEmail.id === existingByClerkId.id;

      try {
        return await prisma.user.update({
          where: { id: existingByClerkId.id },
          data: {
            ...(canUpdateEmail ? { email } : {}),
            name,
            imageUrl,
            role: resolveRole({
              existingRole: existingByClerkId.role,
              roleFromMetadata,
              isSuperAdmin
            })
          }
        });
      } catch (error) {
        if (!isUniqueConstraintError(error) || attempt === 2) {
          throw error;
        }
        continue;
      }
    }

    const existingByKnownEmail =
      existingByEmail ??
      (await prisma.user.findFirst({
        where: {
          email: {
            in: knownEmailsList
          }
        }
      }));

    if (existingByKnownEmail) {
      try {
        return await prisma.user.update({
          where: { id: existingByKnownEmail.id },
          data: {
            clerkId: userId,
            email,
            name,
            imageUrl,
            role: resolveRole({
              existingRole: existingByKnownEmail.role,
              roleFromMetadata,
              isSuperAdmin
            })
          }
        });
      } catch (error) {
        if (!isUniqueConstraintError(error) || attempt === 2) {
          throw error;
        }
        continue;
      }
    }

    try {
      return await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          imageUrl,
          role: resolveRole({
            roleFromMetadata,
            isSuperAdmin
          })
        }
      });
    } catch (error) {
      if (!isUniqueConstraintError(error) || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Could not synchronize user profile");
}

export async function requireAuthUser(): Promise<User> {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuthUser();
  if (!hasAdminAccess(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireStudent(): Promise<User> {
  const user = await requireAuthUser();
  if (hasAdminAccess(user.role)) {
    redirect("/admin");
  }
  return user;
}

export async function requireApiUser(): Promise<User | null> {
  return getCurrentDbUser();
}

export async function requireApiAdmin(): Promise<User | null> {
  const user = await getCurrentDbUser();
  if (!user || !hasAdminAccess(user.role)) {
    return null;
  }
  return user;
}

export async function requireApiStudent(): Promise<User | null> {
  const user = await getCurrentDbUser();
  if (!user || hasAdminAccess(user.role)) {
    return null;
  }
  return user;
}
