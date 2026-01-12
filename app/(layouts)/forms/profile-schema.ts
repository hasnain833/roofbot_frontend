import { z } from 'zod';

export const getProfileSchema = () => {
    return z.object({
        firstName: z
            .string()
            .min(2, { message: 'First Name must be at least 2 characters long.' })
            .min(1, { message: 'First Name is required.' }),
        lastName: z
            .string()
            .min(2, { message: 'Last Name must be at least 2 characters long.' })
            .min(1, { message: 'Last Name is required.' }),
        email: z
            .string()
            .email({ message: 'Please enter a valid email address.' })
            .min(1, { message: 'Email is required.' }),
    });
};

export type ProfileSchemaType = z.infer<ReturnType<typeof getProfileSchema>>;
