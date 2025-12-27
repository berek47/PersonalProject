"use client";

import { markLessonComplete } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, CircleIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  nextLessonSlug?: string;
  courseSlug: string;
}

export function MarkCompleteButton({
  lessonId,
  courseId,
  isCompleted,
  nextLessonSlug,
  courseSlug,
}: MarkCompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMarkComplete() {
    if (isCompleted) return;

    startTransition(async () => {
      try {
        const result = await markLessonComplete(lessonId, courseId);

        if (result.courseCompleted) {
          toast.success("Congratulations! You have completed the course!");
          router.push(`/certificates/${result.enrollmentId}`);
        } else {
          toast.success("Lesson marked as complete");
          if (nextLessonSlug) {
            router.push(`/learn/${courseSlug}/${nextLessonSlug}`);
          } else {
            router.refresh();
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to mark lesson complete"
        );
      }
    });
  }

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircleIcon className="size-5" />
        <span className="font-medium">Lesson Completed</span>
      </div>
    );
  }

  return (
    <Button onClick={handleMarkComplete} disabled={isPending}>
      {isPending ? (
        <Loader2Icon className="mr-2 size-4 animate-spin" />
      ) : (
        <CircleIcon className="mr-2 size-4" />
      )}
      Mark as Complete
    </Button>
  );
}
