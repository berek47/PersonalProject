"use client";

import { createReview, deleteReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Loader2Icon, StarIcon, Trash2Icon, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewSectionProps {
  courseId: string;
  reviews: Review[];
  isEnrolled: boolean;
  currentUserId?: string;
}

export function ReviewSection({
  courseId,
  reviews,
  isEnrolled,
  currentUserId,
}: ReviewSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const userReview = reviews.find((r) => r.user.id === currentUserId);
  const canReview = isEnrolled && !userReview;

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createReview(courseId, {
          rating,
          comment: comment || undefined,
        });
        toast.success("Review submitted successfully");
        setComment("");
        setRating(5);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to submit review"
        );
      }
    });
  }

  function handleDeleteReview(reviewId: string) {
    startTransition(async () => {
      try {
        await deleteReview(reviewId);
        toast.success("Review deleted");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete review"
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
        <CardDescription>
          {reviews.length === 0
            ? "No reviews yet"
            : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {canReview && (
          <form onSubmit={handleSubmitReview} className="space-y-4 border-b pb-6">
            <div>
              <label className="mb-2 block text-sm font-medium">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1"
                  >
                    <StarIcon
                      className={`size-6 ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                Your Review (optional)
              </label>
              <Textarea
                id="comment"
                placeholder="Share your experience with this course..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
              Submit Review
            </Button>
          </form>
        )}

        {/* Prompt for non-enrolled users */}
        {!isEnrolled && !currentUserId && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              Sign in and enroll in this course to leave a review.
            </p>
          </div>
        )}

        {!isEnrolled && currentUserId && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              Enroll in this course to share your experience and leave a review.
            </p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 && isEnrolled && !userReview && (
          <p className="py-4 text-center text-muted-foreground">
            Be the first to review this course!
          </p>
        )}

        {/* Reviews List - Show reviews if there are any, regardless of enrollment status */}
        {reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      {review.user.image ? (
                        <Image
                          src={review.user.image}
                          alt={review.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <UserIcon className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`size-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.user.id === currentUserId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={isPending}
                    >
                      <Trash2Icon className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
