export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewDTO {
  rating: number;
  comment: string;
  userId: string;
  courseId: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
}

export interface ReviewWithDetails extends Review {
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
}
