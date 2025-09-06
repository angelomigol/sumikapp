import { z } from "zod";

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string()
    .meta({ description: "The reCAPTCHA site key." })
    .optional(),
  displayTermsCheckbox: z
    .boolean()
    .meta({
      description: "Whether to display the terms checkbox during sign-up.",
    })
    .optional(),
  providers: z.object({
    password: z.boolean().meta({
      description: "Enable password authentication.",
    }),
    magicLink: z.boolean().meta({
      description: "Enable magic link authentication.",
    }),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: This is a public key, so it's safe to expose.
  // Copy the value from the Supabase Dashboard.
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === "false",

  // NB: Enable the providers below in the Supabase Console
  // in your production project
  providers: {
    password: process.env.NEXT_PUBLIC_AUTH_PASSWORD === "true",
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === "true",
  },
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;
