import { Review, CreateReviewDTO, UpdateReviewDTO, ReviewWithDetails } from '../entities/review.entity';

export interface IReviewRepository {
  create(data: CreateReviewDTO): Promise<Review>;
  findById(id: string): Promise<ReviewWithDetails | null>;
  findByUserAndCourse(userId: string, courseId: string): Promise<Review | null>;
  findByCourse(courseId: string, page: number, limit: number): Promise<{ reviews: ReviewWithDetails[]; total: number }>;
  update(id: string, data: UpdateReviewDTO): Promise<Review>;
  delete(id: string): Promise<void>;
  getAverageRating(courseId: string): Promise<number>;
}
