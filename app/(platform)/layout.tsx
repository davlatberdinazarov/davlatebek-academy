import { requireAuthUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";

export default async function PlatformLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthUser();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopNav role={user.role} />
        <main className="px-4 pb-6 md:px-5">{children}</main>
      </div>
    </div>
  );
}
