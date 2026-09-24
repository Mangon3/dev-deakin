import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});

export const subscribeSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .max(254, "That email address is too long."),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .regex(/^\S+\s+\S+/, "Please enter both your first and last name."),
    email: z.email("Please enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const MAX_TAGS = 3;

// Tags are entered comma-separated
export function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

const tagsSchema = z
  .string()
  .trim()
  .min(1, "Please add at least one tag.")
  .refine(
    (value) => splitTags(value).length <= MAX_TAGS,
    `Please add no more than ${MAX_TAGS} tags.`
  )
  .refine(
    (value) => splitTags(value).every((tag) => tag.length <= 20),
    "Each tag must be 20 characters or fewer."
  );

// Firestore caps document at 1 MiB
export const MAX_IMAGE_BYTES = 900_000;

const planSchema = z.enum(["free", "paid"], {
  message: "Please choose a post plan.",
});

// Images held as base64
const imageSchema = z
  .string()
  .regex(
    /^data:image\/(png|jpeg|webp);base64,/,
    "Please upload a PNG, JPEG or WebP image."
  )
  .max(MAX_IMAGE_BYTES, "That image is too large, please choose a smaller one.");

export const questionPostSchema = z.object({
  postType: z.literal("question"),
  postPlan: planSchema,
  image: imageSchema.optional(),
  title: z
    .string()
    .trim()
    .min(10, "Please give your question a title of at least 10 characters.")
    .max(120, "Titles must be 120 characters or fewer."),
  problem: z
    .string()
    .trim()
    .min(20, "Please describe your problem in at least 20 characters."),
  tags: tagsSchema,
});

export const articlePostSchema = z.object({
  postType: z.literal("article"),
  postPlan: planSchema,
  image: imageSchema.optional(),
  title: z
    .string()
    .trim()
    .min(10, "Please give your article a title of at least 10 characters.")
    .max(120, "Titles must be 120 characters or fewer."),
  abstract: z
    .string()
    .trim()
    .min(20, "Please write an abstract of at least 20 characters.")
    .max(500, "Abstracts must be 500 characters or fewer."),
  articleText: z
    .string()
    .trim()
    .min(50, "Please write at least 50 characters of article text."),
  tags: tagsSchema,
});

// Picks the schema by postType
export const postSchema = z.discriminatedUnion("postType", [
  questionPostSchema,
  articlePostSchema,
]);

export type LoginInput = z.infer<typeof loginSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type PostType = PostInput["postType"];
export type PostPlan = PostInput["postPlan"];

// Checksum used by real card numbers, so obvious typos are caught
function luhn(value: string): boolean {
  let sum = 0;
  let double = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = Number(value[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

function notExpired(value: string): boolean {
  const [month, year] = value.split("/").map(Number);
  const expiry = new Date(2000 + year, month, 0, 23, 59, 59);

  return expiry.getTime() >= Date.now();
}

// Payment details for the plan upgrade. Card data is validated but never stored.
export const paymentSchema = z.object({
  cardName: z
    .string()
    .trim()
    .min(2, "Please enter the name on the card.")
    .regex(/^[A-Za-z][A-Za-z\s'.-]*$/, "Please enter a valid name."),
  cardNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^\d{13,19}$/.test(value), "Please enter a valid card number.")
    .refine(luhn, "That card number is not valid."),
  expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use the format MM/YY.")
    .refine(notExpired, "That card has expired."),
  cvc: z.string().trim().regex(/^\d{3,4}$/, "Please enter a valid CVC."),
});

export type PaymentInput = z.infer<typeof paymentSchema>;


// ----- Jobs layer -----

export const MAX_SKILLS = 6;

// Skills are typed as a comma separated list
export function splitSkills(value: string): string[] {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);
}

const skillsSchema = z
  .string()
  .trim()
  .min(1, "Please list at least one skill.")
  .refine(
    (value) => splitSkills(value).length <= MAX_SKILLS,
    `Please list no more than ${MAX_SKILLS} skills.`
  )
  .refine(
    (value) => splitSkills(value).every((skill) => skill.length <= 24),
    "Each skill must be 24 characters or fewer."
  );

// Deadlines are held as YYYY-MM-DD, compared as strings against today
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const jobSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Please give the job a title of at least 10 characters.")
    .max(120, "Titles must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(40, "Please describe the work in at least 40 characters.")
    .max(4000, "Descriptions must be 4000 characters or fewer."),
  budget: z.coerce
    .number()
    .int("Budgets must be a whole number of dollars.")
    .min(50, "The minimum budget is $50.")
    .max(100000, "The maximum budget is $100,000."),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a deadline.")
    .refine((value) => value >= todayIso(), "The deadline cannot be in the past."),
  skills: skillsSchema,
});

export const proposalSchema = z.object({
  jobId: z.string().min(1),
  note: z
    .string()
    .trim()
    .min(40, "Please write at least 40 characters explaining your approach.")
    .max(2000, "Proposals must be 2000 characters or fewer."),
  quote: z.coerce
    .number()
    .int("Quotes must be a whole number of dollars.")
    .min(50, "The minimum quote is $50.")
    .max(100000, "The maximum quote is $100,000."),
  timeline: z
    .string()
    .trim()
    .min(3, "Please give an estimated timeline, for example '2 weeks'.")
    .max(60, "Please keep the timeline short."),
});

export const messageSchema = z.object({
  proposalId: z.string().min(1),
  text: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .max(2000, "Messages must be 2000 characters or fewer."),
});

export const seekSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .max(600, "Messages must be 600 characters or fewer."),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().max(4000),
      })
    )
    .max(20, "That conversation is too long.")
    .default([]),
});

export type JobInput = z.infer<typeof jobSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
