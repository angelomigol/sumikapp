"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, MailPlus, Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { useRevalidateFetchUsers } from "@/hooks/use-users";

import { roleFilterOptions } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  SendEmailInviteData,
  sendEmailInviteSchema,
} from "../schema/send-email-invite-schema";

export default function InviteUserDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const revalidateFetchUsers = useRevalidateFetchUsers();

  const form = useForm<SendEmailInviteData>({
    resolver: zodResolver(sendEmailInviteSchema),
    defaultValues: {
      email: "",
      role: undefined,
    },
  });

  async function onSubmit(data: SendEmailInviteData) {}

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} variant={"outline"}>
          <MailPlus />
          Invite User
        </Button>
      </DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MailPlus className="size-5" />
                Invite User
              </DialogTitle>
              <DialogDescription>
                Invite new user by sending them an email invitation. Assign a
                role to define their access level. Click "invite" when you're
                done.
              </DialogDescription>
              <fieldset className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roleFilterOptions.map((role, index) => (
                            <SelectItem key={index} value={role.value}>
                              <role.icon />
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button size={"sm"} variant={"outline"}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" size={"sm"}>
                Invite
                <Send className="size-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}

function SuccessAlert() {
  return (
    <Alert>
      <CheckIcon className={"h-4"} />

      <AlertTitle className={cn("line-clamp-2")}>
        Invitation successfully sent!
      </AlertTitle>
    </Alert>
  );
}
