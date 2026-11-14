import { z } from 'zod';

export const createComplaintSchema = z.object({
  categoryId: z.string().uuid('Valid category ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  latitude: z.number().min(-90).max(90, 'Invalid latitude coordinates'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude coordinates'),
  addressText: z.string().max(255).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  media: z
    .array(
      z.object({
        secureUrl: z.string().url('Invalid image URL'),
        publicId: z.string().min(1),
        format: z.string().optional(),
        bytes: z.number().optional(),
      })
    )
    .max(5, 'Maximum 5 images per complaint')
    .optional(),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
