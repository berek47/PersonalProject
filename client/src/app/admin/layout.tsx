import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  FileTextIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ShieldIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/applications", label: "Applications", icon: FileTextIcon },
  { href: "/admin/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <ShieldIcon className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to site */}
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/">
                <ChevronLeftIcon className="mr-2 size-4" />
                Back to Site
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        <div className="border-b bg-card px-8 py-4">
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.name}</span>
          </p>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
