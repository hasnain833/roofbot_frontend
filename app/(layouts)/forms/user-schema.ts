import * as z from "zod";

export const getUserProfileSchema = () =>
  z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["user", "admin"]),
  });

export type UserProfileSchemaType = z.infer<ReturnType<typeof getUserProfileSchema>>;

export const getUserPasswordSchema = () =>
  z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirmation: z.string().min(6, "Confirm Password must be at least 6 characters"),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type UserPasswordSchemaType = z.infer<ReturnType<typeof getUserPasswordSchema>>;
