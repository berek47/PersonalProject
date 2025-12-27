import { getUserEnrollments } from "@/actions/enrollments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireAuth } from "@/lib/auth-helpers";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlayCircleIcon,
  RocketIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Learning",
  description: "Continue your learning journey",
};

export default async function MyCoursesPage() {
  await requireAuth();
  const enrollments = await getUserEnrollments();

  const completedCourses = enrollments.filter((e) => e.completedAt);
  const inProgressCourses = enrollments.filter((e) => !e.completedAt);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 sm:py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAyIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My Learning
              </h1>
              <p className="mt-2 text-muted-foreground">
                Continue where you left off and track your progress
              </p>
            </div>
            {enrollments.length > 0 && (
              <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                  <BookOpenIcon className="size-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{enrollments.length}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
                  <TrophyIcon className="size-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{completedCourses.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {enrollments.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center">
            <div className="mx-auto mb-8 flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <RocketIcon className="size-16 text-primary" />
            </div>
            <h2 className="mb-3 text-2xl font-bold">Start Your Learning Journey</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">
              You haven&apos;t enrolled in any courses yet. Explore our catalog and find
              the perfect course to kickstart your learning.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link href="/courses">
                <SparklesIcon className="size-5" />
                Browse Courses
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* In Progress Section */}
            {inProgressCourses.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <ClockIcon className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Continue Learning</h2>
                  <Badge variant="secondary" className="ml-2">
                    {inProgressCourses.length}
                  </Badge>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((enrollment) => (
                    <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedCourses.length > 0 && (
              <div>
                <div className="mb-6 flex items-center gap-2">
                  <CheckCircle2Icon className="size-5 text-green-500" />
                  <h2 className="text-xl font-semibold">Completed</h2>
                  <Badge variant="secondary" className="ml-2">
                    {completedCourses.length}
                  </Badge>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((enrollment) => (
                    <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

interface CourseProgressCardProps {
  enrollment: {
    id: string;
    completedAt: Date | null;
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail: string | null;
      instructor: {
        name: string;
      };
      _count: {
        lessons: number;
      };
    };
    _count: {
      lessonProgress: number;
    };
  };
}

function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const totalLessons = enrollment.course._count.lessons;
  const completedLessons = enrollment._count.lessonProgress;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isCompleted = enrollment.completedAt !== null;

  return (
    <Link
      href={`/learn/${enrollment.course.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <BookOpenIcon className="size-12 text-primary" />
          </div>
        )}

        {/* Progress Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Status Badge */}
        <div className="absolute right-3 top-3">
          {isCompleted ? (
            <Badge className="bg-green-500 text-white hover:bg-green-600">
              <CheckCircle2Icon className="mr-1 size-3" />
              Completed
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-background/90">
              {progressPercent}% Complete
            </Badge>
          )}
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
            <PlayCircleIcon className="size-8" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 bg-black/20">
            <div
              className={`h-full transition-all ${
                isCompleted ? "bg-green-500" : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 font-semibold leading-tight group-hover:text-primary">
          {enrollment.course.title}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {enrollment.course.instructor.name}
        </p>

        {/* Progress Info */}
        <div className="mt-auto">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedLessons} of {totalLessons} lessons
            </span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress
            value={progressPercent}
            className={`h-2 ${isCompleted ? "[&>div]:bg-green-500" : ""}`}
          />
        </div>

        {/* Action Button */}
        <Button
          className="mt-4 w-full gap-2"
          variant={isCompleted ? "outline" : "default"}
        >
          <PlayCircleIcon className="size-4" />
          {isCompleted
            ? "Review Course"
            : progressPercent > 0
              ? "Continue"
              : "Start Learning"}
        </Button>
      </div>
    </Link>
  );
}
