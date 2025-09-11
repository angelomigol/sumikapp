import { useEffect, useState } from "react";

import { FieldValues, UseFormReturn } from "react-hook-form";

interface UseUnsavedChangesProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  originalValues: T;
  isEditing: boolean;
}

interface UseUnsavedChangesArrayProps<T> {
  currentValues: T[];
  originalValues: T[];
  isEditing: boolean;
}

export function useUnsavedChanges<T extends Record<string, any>>({
  form,
  originalValues,
  isEditing,
}: UseUnsavedChangesProps<T>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const watchedValues = form.watch();

  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }

    if (obj1 === null || obj2 === null) return obj1 === obj2;

    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
      return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  const checkForChanges = () => {
    const currentValues = form.getValues();
    const hasChanges = !deepEqual(currentValues, originalValues);
    setHasUnsavedChanges(hasChanges);
  };

  useEffect(() => {
    if (isEditing) {
      checkForChanges();
    } else {
      setHasUnsavedChanges(false);
    }
  }, [watchedValues, isEditing]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditing) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  const resetToOriginal = () => {
    form.reset(originalValues);
    setHasUnsavedChanges(false);
  };

  return {
    hasUnsavedChanges,
    resetToOriginal,
    setHasUnsavedChanges,
  };
}

export function useUnsavedChangesArray<T>({
  currentValues,
  originalValues,
  isEditing,
}: UseUnsavedChangesArrayProps<T>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }

    if (obj1 === null || obj2 === null) return obj1 === obj2;

    if (typeof obj1 !== "object" || typeof obj2 !== "object") {
      return obj1 === obj2;
    }

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((item, index) => deepEqual(item, obj2[index]));
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  const checkForChanges = () => {
    const hasChanges = !deepEqual(currentValues, originalValues);
    setHasUnsavedChanges(hasChanges);
  };

  useEffect(() => {
    if (isEditing) {
      checkForChanges();
    } else {
      setHasUnsavedChanges(false);
    }
  }, [currentValues, isEditing]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && isEditing) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isEditing]);

  const resetToOriginal = () => {
    setHasUnsavedChanges(false);
    // Note: You'd need to handle resetting the state in the parent component
    // since this hook doesn't directly manage the state
  };

  return {
    hasUnsavedChanges,
    resetToOriginal,
    setHasUnsavedChanges,
  };
}
