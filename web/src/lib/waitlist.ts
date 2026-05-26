const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

if (!GOOGLE_APPS_SCRIPT_URL) {
  throw new Error(
    "VITE_GOOGLE_APPS_SCRIPT_URL is not defined. Please set it in your .env file."
  );
}

export interface WaitlistValidationError {
  type: "empty" | "invalid" | "too_long";
  message: string;
}

export interface WaitlistPayload {
  email: string;
  wallet: string;
  source: string;
}

/**
 * Validates email format and length
 * Returns null if valid, otherwise returns validation error
 */
export function validateEmail(email: string): WaitlistValidationError | null {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      type: "empty",
      message: "Please enter your email",
    };
  }

  if (trimmed.length > 254) {
    return {
      type: "too_long",
      message: "Email is too long",
    };
  }

  // Basic email validation: must contain @ and at least one .
  const hasAt = trimmed.includes("@");
  const hasDot = trimmed.includes(".");
  const atIndex = trimmed.indexOf("@");
  const lastDotIndex = trimmed.lastIndexOf(".");

  if (!hasAt || !hasDot || atIndex === -1 || lastDotIndex === -1) {
    return {
      type: "invalid",
      message: "Please enter a valid email",
    };
  }

  // @ must come before . and not at the end
  if (atIndex >= lastDotIndex || lastDotIndex === trimmed.length - 1) {
    return {
      type: "invalid",
      message: "Please enter a valid email",
    };
  }

  return null;
}

/**
 * Submits email to Google Apps Script waitlist
 * Returns true if successful, throws error if network fails
 */
export async function submitToWaitlist(email: string): Promise<boolean> {
  const trimmed = email.trim();

  const payload: WaitlistPayload = {
    email: trimmed,
    wallet: "",
    source: "web",
  };

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // With no-cors mode, we can't read the response body.
    // If the fetch didn't throw, assume the request succeeded.
    return true;
  } catch (error) {
    throw new Error("Network request failed");
  }
}
