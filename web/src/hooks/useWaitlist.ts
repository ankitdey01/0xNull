import { useState, useCallback, useEffect } from "react";
import {
  validateEmail,
  submitToWaitlist,
  WaitlistValidationError,
} from "../lib/waitlist";

export type WaitlistState = "idle" | "loading" | "success" | "error";

export interface UseWaitlistReturn {
  state: WaitlistState;
  email: string;
  error: string | null;
  setEmail: (email: string) => void;
  handleSubmit: () => Promise<void>;
}

export function useWaitlist(onSuccess?: () => void): UseWaitlistReturn {
  const [state, setState] = useState<WaitlistState>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSetEmail = useCallback((newEmail: string) => {
    setEmail(newEmail);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  const handleSubmit = useCallback(async () => {
    // Clear any previous errors
    setError(null);

    // Validate email
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Set loading state and attempt submission
    setState("loading");
    try {
      await submitToWaitlist(email);
      setState("success");
    } catch {
      setState("error");
      setError("Something went wrong. Please try again.");
    }
  }, [email]);

  // Call onSuccess callback when state changes to success
  useEffect(() => {
    if (state === "success" && onSuccess) {
      // Delay the callback slightly to allow UI to update
      const timer = setTimeout(onSuccess, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, onSuccess]);

  return {
    state,
    email,
    error,
    setEmail: handleSetEmail,
    handleSubmit,
  };
}
