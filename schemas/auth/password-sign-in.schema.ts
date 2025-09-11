import { z } from 'zod';

import { PasswordSchema } from './password.schema';

export const PasswordSignInSchema = z.object({
  email: z.email(),
  password: PasswordSchema,
});
