"use client";

import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateUser } from "@/hooks/use-users";

import { roleFilterOptions } from "@/lib/constants";

import { formatPhone } from "@/utils/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { If } from "@/components/sumikapp/if";

import {
  AddAccountFormValues,
  addAccountSchema,
} from "../../schema/add-account.schema";

export default function ManualAddUserTab() {
  const addUserMutation = useCreateUser();

  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      role: undefined,

      studentIdNumber: "",
      course: undefined,
      section: "",
      address: "",
      mobileNumber: "",
      coordinatorDepartment: undefined,
      position: "",
      supervisorDepartment: "",
      telephoneNumber: "",
      companyName: "",
      companyContactNo: "",
      companyAddress: "",
      natureOfBusiness: "",
    },
  });

  const role = form.watch("role");

  async function onSubmit(data: AddAccountFormValues) {
    const promise = addUserMutation.mutateAsync(data);

    toast.promise(promise, {
      loading: "Creating user account...",
      success: (result) => {
        form.reset();
        return result.message || "User created successfully";
      },
      error: (err) => {
        if (err instanceof Error) {
          return err.message;
        }
        return "Sorry, we encountered an error while creating account. Please try again.";
      },
    });
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <fieldset
              className="space-y-4"
              disabled={addUserMutation.isPending}
            >
              {/* base fields */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="email" />
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
                        value={field.value ?? ""}
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
              </div>

              <If condition={role === "trainee"}>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="studentIdNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID Number</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={11} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="course"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["BSIT-MWA", "BSCS"].map((course, index) => (
                                <SelectItem key={index} value={course}>
                                  {course}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    name="section"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="mobileNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input
                            value={formatPhone(field.value ?? "")}
                            placeholder="Optional"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={13}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              field.onChange(raw);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </If>

              <If condition={role === "coordinator"}>
                <FormField
                  name="coordinatorDepartment"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a school department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["SECA"].map((course, index) => (
                              <SelectItem key={index} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </If>

              <If condition={role === "supervisor"}>
                <div className="space-y-4">
                  <FormField
                    name="position"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="supervisorDepartment"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="telephoneNumber"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone Number</FormLabel>
                        <FormControl>
                          <Input
                            value={formatPhone(field.value ?? "")}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={13}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              field.onChange(raw);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="companyName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="companyContactNo"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Contact No</FormLabel>
                        <FormControl>
                          <Input
                            value={formatPhone(field.value ?? "")}
                            placeholder="Optional"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={13}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              field.onChange(raw);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="companyAddress"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="natureOfBusiness"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nature of Business</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </If>
            </fieldset>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => form.reset()}
                disabled={addUserMutation.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addUserMutation.isPending}
              >
                {addUserMutation.isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
