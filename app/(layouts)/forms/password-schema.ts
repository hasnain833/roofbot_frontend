import { z } from 'zod';

export const getPasswordSchema = (minLength = 8) => {
  return z
    .string()
    .min(minLength, {
      message: `Password must be at least ${minLength} characters long.`,
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/\d/, {
      message: 'Password must contain at least one number.',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character.',
    });
};

export const getPasswordChangeSchema = () => {
  return z
    .object({
      password: getPasswordSchema(), // Uses the updated password schema with direct messages
      passwordConfirmation: z.string().min(1, {
        message: 'Password confirmation is required.',
      })
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match.',
      path: ['passwordConfirmation'],
    });
};

export type PasswordChangeSchemaType = z.infer<ReturnType<typeof getPasswordChangeSchema>>;
