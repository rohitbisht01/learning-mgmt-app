import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
  "Digital Marketing",
  "Business",
  "Finance",
  "Personal Development",
  "Health & Fitness",
  "Language Learning",
  "Photography",
  "Music",
  "Game Development",
  "Software Testing",
  "Project Management",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Course title must be at least 3 characters long" })
    .max(100, { message: "Course title must not exceed 100 characters" }),

  description: z.string().min(3, {
    message: "Course description must be at least 3 characters long",
  }),

  fileKey: z
    .string()
    .min(1, { message: "Video upload is required (fileKey is missing)" }),

  price: z.coerce.number().min(1, { message: "Price must be positive number" }),

  duration: z.coerce
    .number()
    .min(1, { message: "Course duration must be at least 1 hour" })
    .max(500, { message: "Course duration must not exceed 500 hours" }),

  level: z.enum(courseLevels, {
    errorMap: () => ({
      message: "Course level must be Beginner, Intermediate, or Advanced",
    }),
  }),

  category: z.enum(courseCategories, {
    message: "Course category is required",
  }),

  smallDescription: z
    .string()
    .min(3, { message: "Short description must be at least 3 characters" })
    .max(200, { message: "Short description must not exceed 200 characters" }),

  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters (used in URL)" }),

  status: z.enum(courseStatus, {
    errorMap: () => ({
      message: "Course status must be Draft, Published, or Archived",
    }),
  }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
