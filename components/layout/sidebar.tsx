"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { BookOpen, LayoutDashboard, ShieldCheck } from "lucide-react";
import { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  studentOnly?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen, studentOnly: true },
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, adminOnly: true }
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const canAccessAdmin = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;

  return (
    <aside className="hidden w-72 shrink-0 p-4 md:block">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_18px_44px_rgba(0,0,0,0.4)]">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/90">NeuroSpace</p>
          <p className="mt-1 text-lg font-semibold text-foreground">LMS Command</p>
        </div>

        <nav className="space-y-2.5 text-sm">
          {navItems
            .filter((item) => {
              if (item.adminOnly && !canAccessAdmin) {
                return false;
              }
              if (item.studentOnly && canAccessAdmin) {
                return false;
              }
              return true;
            })
            .map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-200",
                    isActive
                      ? "border-primary/55 bg-primary/15 text-foreground shadow-[0_0_0_1px_rgba(123,97,255,0.35),0_0_26px_rgba(72,107,255,0.22)]"
                      : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/8 hover:text-foreground"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  <span
                    className={cn(
                      "h-8 w-8 rounded-xl border border-white/10 bg-white/5 p-2 text-muted-foreground transition-all duration-200",
                      isActive && "border-primary/50 bg-primary/20 text-primary"
                    )}
                  >
                    <Icon className="h-full w-full" />
                  </span>
                  <span className="font-medium tracking-[0.01em]">{item.label}</span>
                  {isActive ? (
                    <span className="absolute right-3 h-6 w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-blue-400 shadow-[0_0_12px_rgba(93,120,255,0.85)]" />
                  ) : null}
                </Link>
              );
            })}
        </nav>
      </div>
    </aside>
  );
}
