import { UserButton } from "@clerk/nextjs";
import { Cpu } from "lucide-react";
import { UserRole } from "@prisma/client";

type TopNavProps = {
  role: UserRole;
};

export function TopNav({ role }: TopNavProps) {
  return (
    <header className="sticky top-4 z-20 mx-4 mb-5 mt-2 flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:mx-5">
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-primary/45 bg-primary/15 p-2 text-primary shadow-[0_0_20px_rgba(93,120,255,0.35)]">
          <Cpu className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Active Role</p>
          <p className="text-sm font-semibold">{role}</p>
        </div>
      </div>
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}
