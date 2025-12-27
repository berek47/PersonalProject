import { getCourseBySlug } from "@/actions/courses";
import { getEnrollmentWithProgress } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireAuth } from "@/lib/auth-helpers";
import {
  AwardIcon,
  BookOpenIcon,
  CheckCircleIcon,
  PlayCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface LearnCoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export const metadata: Metadata = {
  title: "Continue Learning",
};

export default async function LearnCoursePage({ params }: LearnCoursePageProps) {
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
    redirect(`/courses/${courseSlug}`);
  }

  const publishedLessons = course.lessons.filter((l) => l.isPublished);
  const completedLessonIds = new Set(
    enrollment.lessonProgress.map((p) => p.lessonId)
  );

  // Find next lesson (first uncompleted lesson)
  const nextLesson = publishedLessons.find(
    (lesson) => !completedLessonIds.has(lesson.id)
  );

  const completedCount = completedLessonIds.size;
  const totalCount = publishedLessons.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>by {course.instructor.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>Your progress</span>
                <span>
                  {completedCount} of {totalCount} lessons completed
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            {enrollment.completedAt ? (
              <div className="rounded-lg bg-green-50 p-6 text-center dark:bg-green-950/20">
                <AwardIcon className="mx-auto size-12 text-green-600" />
                <h3 className="mt-2 text-lg font-semibold text-green-800 dark:text-green-400">
                  Congratulations!
                </h3>
                <p className="text-green-700 dark:text-green-500">
                  You have completed this course
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/certificates/${enrollment.id}`}>
                    View Certificate
                  </Link>
                </Button>
              </div>
            ) : nextLesson ? (
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">
                  {completedCount === 0
                    ? "Ready to start learning?"
                    : "Continue where you left off"}
                </p>
                <Button size="lg" asChild>
                  <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
                    <PlayCircleIcon className="mr-2 size-5" />
                    {completedCount === 0
                      ? "Start First Lesson"
                      : "Continue Learning"}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <BookOpenIcon className="mx-auto size-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No lessons available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {publishedLessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${courseSlug}/${lesson.slug}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <div
                      className={`flex size-8 items-center justify-center rounded-full ${
                        isCompleted ? "bg-green-100 dark:bg-green-900" : "bg-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="size-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{lesson.title}</p>
                      {lesson.duration && (
                        <p className="text-muted-foreground text-sm">
                          {lesson.duration} min
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
