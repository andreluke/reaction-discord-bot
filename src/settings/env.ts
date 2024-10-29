import { z } from "zod";

const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    TARGET_USER_ID: z.string(),
    TARGET_USER_ID2: z.string().optional(),
    TARGET_CATEGORY_ID: z.string(),
    TARGET_CHANNEL_ID: z.string()
    // Env vars...
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };