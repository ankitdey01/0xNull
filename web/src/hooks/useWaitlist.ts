import { useState, useCallback } from "react";
import {
  checkWaitlistStatus,
  validateEmail,
  validateWallet,
  submitToWaitlist,
  WaitlistDuplicateSubmissionError,
  WaitlistRateLimitError,
} from "../lib/waitlist";

export type WaitlistState = "idle" | "loading" | "success" | "error";

export interface UseWaitlistReturn {
  state: WaitlistState;
  hasExistingEntry: boolean;
  email: string;
  error: string | null;
  setEmail: (email: string) => void;
  handleSubmit: () => Promise<void>;
}

export function useWaitlist(_onSuccess?: () => void, walletAddress = ""): UseWaitlistReturn {
  const [state, setState] = useState<WaitlistState>("idle");
  const [hasExistingEntry, setHasExistingEntry] = useState(false);
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

    const walletValidationError = validateWallet(walletAddress);
    if (walletValidationError) {
      setError(walletValidationError.message);
      return;
    }

    // Set loading state and attempt submission
    setState("loading");
    try {
      const isAlreadyWaitlisted = await checkWaitlistStatus(email, walletAddress);
      if (isAlreadyWaitlisted) {
        setHasExistingEntry(true);
        setState("idle");
        return;
      }

      await submitToWaitlist(email, walletAddress);
      setHasExistingEntry(true);
      setState("success");
    } catch (submitError) {
      if (submitError instanceof WaitlistDuplicateSubmissionError) {
        setHasExistingEntry(true);
        setState("idle");
        return;
      }

      setState("error");
      if (submitError instanceof WaitlistRateLimitError) {
        setError(submitError.message);
        return;
      }

      setError("Something went wrong. Please try again.");
    }
  }, [email, walletAddress]);

  return {
    state,
    hasExistingEntry,
    email,
    error,
    setEmail: handleSetEmail,
    handleSubmit,
  };
}
