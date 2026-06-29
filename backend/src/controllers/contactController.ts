import { Context } from 'hono';
import * as contactService from '../services/contactService.ts';
import catchAsync from '../utils/catchAsync.ts';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const submitContact = catchAsync(async (c: Context) => {
  const body = await c.req.json();
  const validatedData = contactSchema.parse(body);

  await contactService.createContactMessage(validatedData);

  return c.json({
    success: true,
    message: 'Thank you for your message! We will get back to you soon.',
  }, 201);
});
