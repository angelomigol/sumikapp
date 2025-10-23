"use client";

import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Check, CircleCheckBig, Mail, User } from "lucide-react";
import * as motion from "motion/react-client";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { If } from "@/components/sumikapp/if";

const steps = [
  {
    id: 1,
    icon: User,
    title: "Personal Information",
    description: "Enter your basic personal details",
    fields: ["firstName", "middleName", "lastName", "role"],
  },
  {
    id: 2,
    icon: Mail,
    title: "Contact Details",
    description:
      "Provide your contact information including email and phone number.",
    fields: ["email", "telephoneNumber"],
  },
  {
    id: 3,
    icon: Building,
    title: "Company Details",
    description: "Fill out your company or organization's details ",
    fields: [
      "companyName",
      "companyAddress",
      "companyContactNo",
      "natureOfBusiness",
      "position",
      "supervisorDepartment",
    ],
  },
  {
    id: 4,
    icon: CircleCheckBig,
    title: "All Done",
    description: "",
    fields: [],
  },
];

const optionalString = z.string().optional().or(z.literal(""));

const supervisorSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  middleName: optionalString,
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: z.email({ error: "Valid email is required" }),
  role: z.literal("supervisor", { error: "Role is required" }),
  position: z.string().min(1, { error: "Position is required" }),
  supervisorDepartment: z.string().min(1, { error: "Department is required" }),
  telephoneNumber: z
    .string()
    .min(1, { error: "Contact number is required" })
    .regex(/^[0-9]+$/, { error: "Contact number must contain only digits" })
    .length(11, {
      error: "Contact number must be 11 digits (e.g. 09xxxxxxxxx)",
    }),
  companyName: z.string().min(1, { error: "Company name is required" }),
  companyContactNo: z
    .string()
    .min(1, { error: "Company contact number is required" })
    .regex(/^[0-9]+$/, {
      error: "Company contact number must contain only digits",
    })
    .length(11, {
      error: "Company contact number must be 11 digits (e.g. 09xxxxxxxxx)",
    }),
  companyAddress: z.string().min(1, { error: "Company address is required" }),
  natureOfBusiness: z
    .string()
    .min(1, { error: "Nature of business is required" }),
});

export default function AccountSetupContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const StepIcon = steps[currentStep - 1].icon;

  const form = useForm<z.infer<typeof supervisorSchema>>({
    resolver: zodResolver(supervisorSchema),
    defaultValues: {
      role: "supervisor",
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      telephoneNumber: "",
      companyName: "",
      companyAddress: "",
      companyContactNo: "",
      natureOfBusiness: "",
      position: "",
      supervisorDepartment: "",
    },
    mode: "all",
  });

  const handleContinue = async () => {
    const isValid = await form.trigger(
      steps[currentStep - 1].fields as Array<
        keyof z.infer<typeof supervisorSchema>
      >
    );
    if (!isValid) return;

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = (data: z.infer<typeof supervisorSchema>) => {
    console.log("Form submitted:", data);
    // Handle form submission here (e.g., API call)
  };

  return (
    <>
      <div className="w-full flex-shrink-0 md:w-56">
        <div className="space-y-2">
          {steps.map((step) => (
            <Button
              key={step.id}
              size={"lg"}
              variant={currentStep === step.id ? "default" : "outline"}
              onClick={() => setCurrentStep(step.id)}
              className={`w-full justify-start`}
              disabled={currentStep < step.id}
            >
              <div
                className={`bg-primary flex size-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white md:size-6`}
              >
                {currentStep > step.id ? <Check className="size-4" /> : step.id}
              </div>
              <span className="font-medium">{step.title}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <FieldSet>
          <FieldLegend className="flex items-center gap-2">
            <StepIcon className="text-muted-foreground size-5" />
            {steps[currentStep - 1].title}
          </FieldLegend>
          <FieldDescription>
            {steps[currentStep - 1].description}
          </FieldDescription>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <If condition={currentStep === 1}>
                <Controller
                  name="firstName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input
                        {...field}
                        id="firstName"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="middleName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel htmlFor="middleName">
                          Middle Name
                        </FieldLabel>
                        <span className="text-muted-foreground text-xs">
                          Optional field
                        </span>
                      </div>
                      <Input
                        {...field}
                        id="middleName"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="lastName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input
                        {...field}
                        id="lastName"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="position"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="position">Position</FieldLabel>
                        <Input
                          {...field}
                          id="position"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="supervisorDepartment"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="supervisorDepartment">
                          Department
                        </FieldLabel>
                        <Input
                          {...field}
                          id="supervisorDepartment"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </If>

              <If condition={currentStep === 2}>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="email">Email Address</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="telephoneNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="telephoneNumber">
                        Contact Number
                      </FieldLabel>

                      <Input
                        {...field}
                        id="telephoneNumber"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="e.g., 09xxxxxxxxx"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </If>

              <If condition={currentStep === 3}>
                <Controller
                  name="companyName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="companyName">
                        Company Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="companyName"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="companyAddress"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="companyAddress">
                        Company Address
                      </FieldLabel>
                      <Input
                        {...field}
                        id="firstName"
                        type="companyAddress"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="companyContactNo"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="companyContactNo">
                          Company Contact No.
                        </FieldLabel>
                        <Input
                          {...field}
                          id="firstName"
                          type="tel"
                          inputMode="numeric"
                          maxLength={11}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="natureOfBusiness"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="natureOfBusiness">
                          Nature of Business
                        </FieldLabel>
                        <Input
                          {...field}
                          id="natureOfBusiness"
                          type="natureOfBusiness"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          required
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </If>

              <If condition={currentStep === 4}>
                <div className="flex flex-col items-center justify-center py-4 md:py-8">
                  <div className="bg-green-3 mb-3 flex size-8 items-center justify-center rounded-full md:mb-4 md:size-20">
                    <Check className="text-green-11 size-8 md:size-10" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold md:mb-3 md:text-2xl">
                    Setup Complete!
                  </h3>
                  <p className="text-center text-xs md:text-sm">
                    Your account has been created successfully.
                  </p>
                </div>
              </If>

              <Field orientation="horizontal" className="justify-between">
                <Button
                  type="button"
                  size={"lg"}
                  variant={"outline"}
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="transition-none"
                  asChild
                >
                  <motion.button whileTap={{ scale: 0.85 }}>Back</motion.button>
                </Button>
                <If
                  condition={currentStep === steps.length}
                  fallback={
                    <Button
                      size={"lg"}
                      onClick={handleContinue}
                      className="transition-none"
                      asChild
                    >
                      <motion.button whileTap={{ scale: 0.85 }}>
                        Continue
                      </motion.button>
                    </Button>
                  }
                >
                  <Button
                    type="submit"
                    size={"lg"}
                    className="transition-none"
                    asChild
                  >
                    <motion.button whileTap={{ scale: 0.85 }}>
                      Get Started
                    </motion.button>
                  </Button>
                </If>
              </Field>
            </FieldGroup>
          </form>
        </FieldSet>
      </div>
    </>
  );
}
