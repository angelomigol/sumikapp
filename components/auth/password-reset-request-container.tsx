'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useRequestResetPassword } from '@/utils/supabase/hooks/use-request-reset-password';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { If } from '@/components/sumikapp/if';

import { useCaptchaToken } from '@/utils/captcha/client/use-captcha-token';
import { AuthErrorAlert } from './auth-error-alert';

const PasswordResetSchema = z.object({
  email: z.string().email(),
});

export function PasswordResetRequestContainer(params: {
  redirectPath: string;
}) {
  const resetPasswordMutation = useRequestResetPassword();
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  const error = resetPasswordMutation.error;
  const success = resetPasswordMutation.data;

  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <>
      <If condition={success}>
        <Alert>
          <AlertDescription>
            Check your Inbox! We emailed you a link for resetting your Password.
          </AlertDescription>
        </Alert>
      </If>

      <If condition={!resetPasswordMutation.data}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(({ email }) => {
              const redirectTo = new URL(
                params.redirectPath,
                window.location.origin
              ).href;

              return resetPasswordMutation
                .mutateAsync({
                  email,
                  redirectTo,
                  captchaToken,
                })
                .catch(() => {
                  resetCaptchaToken();
                });
            })}
            className={'w-full'}
          >
            <div className={'flex flex-col space-y-4'}>
              <div>
                <p className={'text-muted-foreground text-sm'}>
                  Enter your email address below. You will receive a link to
                  reset your password.
                </p>
              </div>

              <AuthErrorAlert error={error} />

              <FormField
                name={'email'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email Address</FormLabel>

                    <FormControl>
                      <Input
                        className={cn(
                          'text-foreground dark:text-background bg-white dark:bg-white'
                        )}
                        required
                        type="email"
                        placeholder={'your@email.com'}
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className={cn(
                  'bg-[#fab300] font-bold text-black hover:bg-[#d49000] hover:text-black'
                )}
                disabled={resetPasswordMutation.isPending}
                type="submit"
              >
                Reset Password
              </Button>
            </div>
          </form>
        </Form>
      </If>
    </>
  );
}
