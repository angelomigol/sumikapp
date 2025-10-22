"use client";

import React, { useState } from "react";

import { Building, Check, CircleCheckBig, Mail, User } from "lucide-react";
import * as motion from "motion/react-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const steps = [
  {
    id: 1,
    icon: User,
    title: "Personal Information",
    description:
      "Enter your basic personal details like your first name and last name",
  },
  {
    id: 2,
    icon: Mail,
    title: "Contact Details",
    description:
      "Provide your contact information including email and phone number.",
  },
  {
    id: 3,
    icon: Building,
    title: "Company Details",
    description: "Fill out your company or organization's details ",
  },
  { id: 4, icon: CircleCheckBig, title: "All Done", description: "" },
];

export default function AccountSetupContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
  });

  const StepIcon = steps[currentStep - 1].icon;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <StepIcon className="text-muted-foreground size-4 md:size-5" />
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="mb-4 md:mb-6">
            <label className="mb-2 block text-xs font-medium md:text-sm">
              Your Name
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </CardContent>

          <CardFooter className="justify-between gap-2">
            <Button
              size={"lg"}
              variant={"ghost"}
              onClick={handleBack}
              disabled={currentStep === 1}
              className="transition-none"
              asChild
            >
              <motion.button whileTap={{ scale: 0.85 }}>Back</motion.button>
            </Button>
            <Button
              size={"lg"}
              onClick={handleContinue}
              className="transition-none"
              asChild
            >
              <motion.button whileTap={{ scale: 0.85 }}>
                {currentStep === steps.length ? "Get Started" : "Continue"}
              </motion.button>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
