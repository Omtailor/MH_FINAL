import { z } from 'zod';

// Age validation: must be integer 0-120
export const ageSchema = z
  .string()
  .min(1, "Age is required")
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && Number.isInteger(num);
  }, "Age must be a whole number")
  .refine((val) => {
    const num = parseInt(val, 10);
    return num >= 0 && num <= 120;
  }, "Age must be between 0 and 120");

// Phone validation: exactly 10 digits (Indian format)
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val) => val.replace(/[\s\-\(\)]/g, ''))
  .refine((val) => /^\d{10}$/.test(val), "Phone must be exactly 10 digits");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const emergencyDescriptionSchema = z
  .string()
  .min(1, "Please describe your emergency")
  .max(2000, "Description must be less than 2000 characters");

export const sosFormSchema = z.object({
  name: nameSchema,
  age: ageSchema,
  phone: phoneSchema,
  description: emergencyDescriptionSchema,
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional(),
});

export type SOSFormData = z.infer<typeof sosFormSchema>;

export const rumourSchema = z.object({
  rumourText: z.string().min(1, "Please enter a rumour to verify").max(1000),
  source: z.string().max(500).optional(),
});

export type RumourFormData = z.infer<typeof rumourSchema>;

export const rescuerLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RescuerLoginData = z.infer<typeof rescuerLoginSchema>;
