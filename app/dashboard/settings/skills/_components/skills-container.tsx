"use client";

import React, { useState } from "react";

import { X } from "lucide-react";

import {
  useAddSkill,
  useFetchSkills,
  useRemoveSkill,
} from "@/hooks/use-skills";

import { suggestedSkills } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/sumikapp/loading-overlay";

export default function SkillsContainer() {
  const [newSkill, setNewSkill] = useState("");

  const { data: skills = [], isLoading } = useFetchSkills();
  const addSkillMutation = useAddSkill();
  const removeSkillMutation = useRemoveSkill();

  const handleAddSkill = (skillName: string) => {
    if (!skillName.trim()) return;

    const skillExists = skills.some(
      (skill) => skill.name.toLowerCase() === skillName.toLowerCase()
    );

    if (skillExists) return;

    addSkillMutation.mutate(skillName.trim());
    setNewSkill("");
  };

  const handleRemoveSkill = (skillId: string) => {
    removeSkillMutation.mutate(skillId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(newSkill);
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Skills & Interests</CardTitle>
          <CardDescription>
            Add skills you already know or are interested in learning.
            {/* This helps us recommend better opportunities for you. */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} className="gap-1">
                  {skill.name}
                  <Button
                    variant={"destructive"}
                    className={cn("h-fit bg-transparent py-0 has-[>svg]:px-0")}
                    onClick={() => handleRemoveSkill(skill.id)}
                    disabled={
                      addSkillMutation.isPending ||
                      removeSkillMutation.isPending
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="skills">Skill</Label>
            <Input
              id="skills"
              type="search"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={
                addSkillMutation.isPending || removeSkillMutation.isPending
              }
            />
            <span className="text-muted-foreground text-sm">
              Press <kbd className="text-foreground font-semibold">Enter</kbd>{" "}
              to add a custom skill
            </span>
          </div>

          <div className="bg-primary/20 flex flex-col space-y-2 rounded-md p-4">
            <p className="font-medium">Suggested skills</p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {suggestedSkills.map((skill, index) => {
                const isAlreadyAdded = skills.some(
                  (userSkill) =>
                    userSkill.name.toLowerCase() === skill.toLowerCase()
                );

                return (
                  <Button
                    key={index}
                    size="sm"
                    className={`h-6 text-xs`}
                    onClick={() => handleAddSkill(skill)}
                    disabled={
                      isAlreadyAdded ||
                      addSkillMutation.isPending ||
                      removeSkillMutation.isPending
                    }
                  >
                    {skill}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
