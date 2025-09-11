import { z } from "zod";

/**
 * Password requirements
 * These are the requirements for the password when signing up or changing the password
 */
const requirements = {
  minLength: 8,
  maxLength: 99,
  specialChars:
    process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_SPECIAL_CHARS === "true",
  numbers: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_NUMBERS === "true",
  uppercase: process.env.NEXT_PUBLIC_PASSWORD_REQUIRE_UPPERCASE === "true",
};

/**
 * Password schema
 * This is used to validate the password on sign in (for existing users when requirements are not enforced)
 */
export const PasswordSchema = z
  .string()
  .min(requirements.minLength)
  .max(requirements.maxLength);

/**
 * Refined password schema with additional requirements
 * This is required to validate the password requirements on sign up and password change
 */
export const RefinedPasswordSchema = z.string().check((ctx) => {
  const password = ctx.value;

  if (requirements.specialChars) {
    const specialCharsCount =
      password.match(/[!@#$%^&*(),.?":{}|<>]/g)?.length ?? 0;
    if (specialCharsCount < 1) {
      ctx.issues.push({
        code: "custom",
        message: "Password must contain at least one special character",
        input: password,
      });
    }
  }

  if (requirements.numbers) {
    const numbersCount = password.match(/\d/g)?.length ?? 0;
    if (numbersCount < 1) {
      ctx.issues.push({
        code: "custom",
        message: "Password must contain at least one number",
        input: password,
      });
    }
  }

  if (requirements.uppercase) {
    if (!/[A-Z]/.test(password)) {
      ctx.issues.push({
        code: "custom",
        message: "Password must contain at least one uppercase letter",
        input: password,
      });
    }
  }
});

export function refineRepeatPassword(ctx: {
  value: { password: string; repeatPassword: string };
  issues: any[];
}): void {
  if (ctx.value.password !== ctx.value.repeatPassword) {
    ctx.issues.push({
      code: "custom",
      message: "auth:errors.passwordsDoNotMatch",
      path: ["repeatPassword"],
      input: ctx.value,
    });
  }
}
