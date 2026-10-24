import { z } from "zod";

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  userId: z.string().uuid(),
  venueId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, "Ulasan minimal 5 karakter"),
  reply: z.string().nullable().optional(),
  repliedAt: z.string().datetime().nullable().optional(),
  isVisible: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  // Relasi
  userName: z.string().optional(),
  userAvatar: z.string().nullable().optional(),
  venueName: z.string().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const CreateReviewInputSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1, "Berikan rating 1-5").max(5),
  comment: z.string().min(5, "Tulis ulasan minimal 5 karakter"),
});

export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>;

export const ReplyReviewInputSchema = z.object({
  reply: z.string().min(3, "Balasan ulasan minimal 3 karakter"),
});

export type ReplyReviewInput = z.infer<typeof ReplyReviewInputSchema>;
