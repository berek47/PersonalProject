import { getCourseBySlug } from "@/actions/courses";
import { getEnrollmentWithProgress } from "@/actions/enrollments";
import { getLessonBySlug } from "@/actions/lessons";
import { requireAuth } from "@/lib/auth-helpers";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MarkCompleteButton } from "./mark-complete-button";
import { Button } from "@/components/ui/button";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export const metadata: Metadata = {
  title: "Lesson",
};

export default async function LessonPage({ params }: LessonPageProps) {
  await requireAuth();
  const { courseSlug, lessonSlug } = await params;

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

  let lesson;
  try {
    lesson = await getLessonBySlug(lessonSlug);
  } catch {
    notFound();
  }

  // Verify lesson belongs to this course
  if (lesson.courseId !== course.id) {
    notFound();
  }

  const publishedLessons = course.lessons.filter((l) => l.isPublished);
  const currentIndex = publishedLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? publishedLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < publishedLessons.length - 1
      ? publishedLessons[currentIndex + 1]
      : null;

  const completedLessonIds = new Set(
    enrollment.lessonProgress.map((p) => p.lessonId)
  );
  const isCompleted = completedLessonIds.has(lesson.id);

  // Extract video ID for embedding
  function getYouTubeEmbedUrl(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  const embedUrl = lesson.videoUrl ? getYouTubeEmbedUrl(lesson.videoUrl) : null;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl">
        {/* Lesson Header */}
        <div className="mb-6">
          <p className="text-muted-foreground mb-1 text-sm">
            Lesson {currentIndex + 1} of {publishedLessons.length}
          </p>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {lesson.duration && (
            <p className="text-muted-foreground mt-1">
              {lesson.duration} minutes
            </p>
          )}
        </div>

        {/* Video Player */}
        {embedUrl && (
          <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={embedUrl}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        )}

        {/* Lesson Content */}
        {lesson.content && (
          <div className="prose prose-neutral dark:prose-invert mb-8 max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: lesson.content.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        )}

        {/* Mark Complete & Navigation */}
        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <MarkCompleteButton
            lessonId={lesson.id}
            courseId={course.id}
            isCompleted={isCompleted}
            nextLessonSlug={nextLesson?.slug}
            courseSlug={courseSlug}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!prevLesson}
              asChild={!!prevLesson}
            >
              {prevLesson ? (
                <Link href={`/learn/${courseSlug}/${prevLesson.slug}`}>
                  <ChevronLeftIcon className="mr-1 size-4" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeftIcon className="mr-1 size-4" />
                  Previous
                </>
              )}
            </Button>
            <Button
              variant="outline"
              disabled={!nextLesson}
              asChild={!!nextLesson}
            >
              {nextLesson ? (
                <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
                  Next
                  <ChevronRightIcon className="ml-1 size-4" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRightIcon className="ml-1 size-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
