import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Provide default values for all environment variables
    NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8000"),
    NEXT_PUBLIC_LOCAL_MODE_ENABLED: z.union([z.string().transform((val) => val === "true"), z.boolean()]).default(true),
    NEXT_PUBLIC_PRO_MODE_ENABLED: z.union([z.string().transform((val) => val === "true"), z.boolean()]).default(true),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_LOCAL_MODE_ENABLED: process.env.NEXT_PUBLIC_LOCAL_MODE_ENABLED,
    NEXT_PUBLIC_PRO_MODE_ENABLED: process.env.NEXT_PUBLIC_PRO_MODE_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: true, // Always skip validation for easier development
})

