import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";
import { getServerSession } from "@/lib/get-session";
import { BookOpenIcon, GraduationCapIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";

export async function Navbar() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl transition-colors hover:text-primary"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCapIcon className="size-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">LearnHub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/courses" className="gap-2">
              <BookOpenIcon className="size-4" />
              Browse Courses
            </Link>
          </Button>
          {user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/my-courses" className="gap-2">
                  My Learning
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="gap-2">
                  <LayoutDashboardIcon className="size-4" />
                  Dashboard
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="flex items-center justify-center gap-1 border-t px-4 py-2 md:hidden">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">Courses</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-courses">My Learning</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
