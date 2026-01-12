import { z } from 'zod';
import { getPasswordSchema } from './password-schema';

export const getSignupSchema = () => {
  return z
    .object({
      firstName: z
        .string()
        .min(2, { message: 'First Name must be at least 2 characters long.' })
        .min(1, { message: 'First Name is required.' }),
      lastName: z
        .string()
        .min(2, { message: 'Last Name must be at least 2 characters long.' })
        .min(1, { message: 'Last Name is required.' }),
      company: z
        .string()
        .min(2, { message: 'Company Name must be at least 2 characters long.' })
        .min(1, { message: 'Company Name is required.' }),
      email: z
        .string()
        .email({ message: 'Please enter a valid email address.' })
        .min(1, { message: 'Email is required.' }),
      password: getPasswordSchema(), // Uses the updated password schema with direct messages
      passwordConfirmation: z.string().min(1, {
        message: 'Password confirmation is required.',
      }),
      accept: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions.',
      }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match.',
      path: ['passwordConfirmation'],
    });
};

export type SignupSchemaType = z.infer<ReturnType<typeof getSignupSchema>>;
