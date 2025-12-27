import { getCourseBySlug } from "@/actions/courses";
import { getEnrollmentWithProgress } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireAuth } from "@/lib/auth-helpers";
import { ArrowLeftIcon, CheckCircleIcon, CircleIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReactNode } from "react";

interface LearnLayoutProps {
  children: ReactNode;
  params: Promise<{ courseSlug: string }>;
}

export default async function LearnLayout({
  children,
  params,
}: LearnLayoutProps) {
  await requireAuth();
  const { courseSlug } = await params;

  let course;
  try {
    course = await getCourseBySlug(courseSlug);
  } catch {
    notFound();
  }

  let enrollment;
  try {
    enrollment = await getEnrollmentWithProgress(course.id);
  } catch {
    // Not enrolled, redirect to course page
    redirect(`/courses/${courseSlug}`);
  }

  const publishedLessons = course.lessons.filter((l) => l.isPublished);
  const completedLessonIds = new Set(
    enrollment.lessonProgress.map((p) => p.lessonId)
  );
  const progressPercent =
    publishedLessons.length > 0
      ? Math.round(
          (completedLessonIds.size / publishedLessons.length) * 100
        )
      : 0;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-r md:block">
        <div className="sticky top-0 bg-background p-4 border-b">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/my-courses">
              <ArrowLeftIcon className="mr-1 size-4" />
              Back to My Courses
            </Link>
          </Button>
          <h2 className="font-semibold line-clamp-2">{course.title}</h2>
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        <nav className="p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
            Lessons
          </p>
          <div className="space-y-1">
            {publishedLessons.map((lesson, index) => {
              const isCompleted = completedLessonIds.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${courseSlug}/${lesson.slug}`}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="size-5 shrink-0 text-green-600" />
                  ) : (
                    <CircleIcon className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="line-clamp-2">{lesson.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {enrollment.completedAt && (
          <div className="border-t p-4">
            <Button className="w-full" asChild>
              <Link href={`/certificates/${enrollment.id}`}>
                View Certificate
              </Link>
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
