import { getUserEnrollments } from "@/actions/enrollments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/user-avatar";
import { getServerSession } from "@/lib/get-session";
import { format } from "date-fns";
import {
  AwardIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  MailIcon,
  PlayCircleIcon,
  RocketIcon,
  ShieldIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) unauthorized();

  const enrollments = await getUserEnrollments();
  const completedCourses = enrollments.filter((e) => e.completedAt);
  const inProgressCourses = enrollments.filter((e) => !e.completedAt);

  // Calculate total progress across all courses
  const totalLessons = enrollments.reduce((acc, e) => acc + e.course._count.lessons, 0);
  const completedLessons = enrollments.reduce((acc, e) => acc + e._count.lessonProgress, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAyIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <UserAvatar
                name={user.name}
                image={user.image}
                className="size-20 border-4 border-background shadow-xl sm:size-24"
              />
              <div>
                <p className="text-muted-foreground">Welcome back,</p>
                <h1 className="text-2xl font-bold sm:text-3xl">{user.name}</h1>
                <div className="mt-2 flex items-center gap-2">
                  {user.role && (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldIcon className="size-3" />
                      {user.role}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <CalendarDaysIcon className="size-3" />
                    Joined {format(user.createdAt, "MMM yyyy")}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
              <Button asChild>
                <Link href="/courses">
                  <SparklesIcon className="mr-2 size-4" />
                  Browse Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!user.emailVerified && <EmailVerificationAlert />}

        {/* Stats Grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={BookOpenIcon}
            label="Enrolled Courses"
            value={enrollments.length.toString()}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatsCard
            icon={TrophyIcon}
            label="Completed"
            value={completedCourses.length.toString()}
            color="text-yellow-500"
            bgColor="bg-yellow-500/10"
          />
          <StatsCard
            icon={TrendingUpIcon}
            label="In Progress"
            value={inProgressCourses.length.toString()}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatsCard
            icon={AwardIcon}
            label="Overall Progress"
            value={`${overallProgress}%`}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Continue Learning - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Continue Learning</h2>
              <Button variant="ghost" asChild className="gap-1">
                <Link href="/my-courses">
                  View All
                  <ChevronRightIcon className="size-4" />
                </Link>
              </Button>
            </div>

            {inProgressCourses.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <RocketIcon className="size-10 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Start Your Journey</h3>
                <p className="mb-6 text-muted-foreground">
                  You haven&apos;t started any courses yet. Explore our catalog!
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressCourses.slice(0, 3).map((enrollment) => {
                  const totalLessons = enrollment.course._count.lessons;
                  const completed = enrollment._count.lessonProgress;
                  const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

                  return (
                    <Link
                      key={enrollment.id}
                      href={`/learn/${enrollment.course.slug}`}
                      className="group flex gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg sm:w-40">
                        {enrollment.course.thumbnail ? (
                          <Image
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <BookOpenIcon className="size-8 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div>
                          <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.course.instructor.name}
                          </p>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {completed} of {totalLessons} lessons
                            </span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      <div className="hidden items-center sm:flex">
                        <Button size="sm" className="gap-2">
                          <PlayCircleIcon className="size-4" />
                          Continue
                        </Button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <GraduationCapIcon className="size-5 text-primary" />
                Achievements
              </h3>
              {completedCourses.length > 0 ? (
                <div className="space-y-4">
                  {completedCourses.slice(0, 3).map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-yellow-500/10">
                        <TrophyIcon className="size-5 text-yellow-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {enrollment.course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completed
                        </p>
                      </div>
                    </div>
                  ))}
                  {completedCourses.length > 3 && (
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/my-courses">
                        View all {completedCourses.length} certificates
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                    <TrophyIcon className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete courses to earn certificates!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="mb-4 font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/courses">
                    <SparklesIcon className="size-4" />
                    Explore Courses
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/my-courses">
                    <BookOpenIcon className="size-4" />
                    My Learning
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/profile">
                    <ShieldIcon className="size-4" />
                    Account Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatsCard({ icon: Icon, label, value, color, bgColor }: StatsCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-4">
        <div className={`flex size-12 items-center justify-center rounded-xl ${bgColor}`}>
          <Icon className={`size-6 ${color}`} />
        </div>
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmailVerificationAlert() {
  return (
    <div className="mb-8 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-yellow-500/20">
            <MailIcon className="size-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Verify your email address
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Access all features by verifying your email
            </p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link href="/verify-email">Verify Now</Link>
        </Button>
      </div>
    </div>
  );
}
