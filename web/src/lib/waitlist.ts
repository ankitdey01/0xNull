const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

if (!GOOGLE_APPS_SCRIPT_URL) {
  throw new Error(
    "VITE_GOOGLE_APPS_SCRIPT_URL is not defined. Please set it in your .env file."
  );
}

export interface WaitlistValidationError {
  type: "empty" | "invalid" | "too_long" | "wallet_required";
  message: string;
}

export interface WaitlistPayload {
  email: string;
  wallet: string;
  source: string;
}

export interface WaitlistLookupResult {
  success: boolean;
  found: boolean;
  error?: string;
  row?: {
    email: string;
    wallet: string;
    timestamp: string;
  };
}

export class WaitlistRateLimitError extends Error {}
export class WaitlistDuplicateSubmissionError extends Error {}

const WAITLIST_STORAGE_PREFIX = "0xnull.waitlist";
const WAITLIST_COOLDOWN_MS = 60_000;

function normalizeWallet(wallet: string) {
  return wallet.trim().toLowerCase();
}

function getStorageValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage is only a local duplicate guard; failed writes should not block signups.
  }
}

function removeStorageValue(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

function submissionKey(email: string, wallet: string) {
  return `${WAITLIST_STORAGE_PREFIX}.submitted.${normalizeWallet(wallet)}.${email.toLowerCase()}`;
}

function walletSubmissionKey(wallet: string) {
  return `${WAITLIST_STORAGE_PREFIX}.wallet.${normalizeWallet(wallet)}`;
}

function rateLimitKey(wallet: string) {
  return `${WAITLIST_STORAGE_PREFIX}.lastSubmit.${normalizeWallet(wallet)}`;
}

export function isWalletWaitlistedLocally(wallet: string) {
  return Boolean(getStorageValue(walletSubmissionKey(wallet)));
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

export function validateWallet(wallet: string): WaitlistValidationError | null {
  const trimmed = wallet.trim();

  if (!trimmed) {
    return {
      type: "wallet_required",
      message: "Connect MetaMask before joining the waitlist",
    };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      type: "invalid",
      message: "Connect a valid Ethereum wallet before joining the waitlist",
    };
  }

  return null;
}

export async function checkWaitlistStatus(email: string, wallet: string): Promise<boolean> {
  const trimmedEmail = email.trim().toLowerCase();
  const walletValidationError = validateWallet(wallet);

  if (walletValidationError) {
    return false;
  }

  const normalizedWallet = normalizeWallet(wallet);

  if (isWalletWaitlistedLocally(normalizedWallet)) {
    return true;
  }

  const lookupUrl = new URL(GOOGLE_APPS_SCRIPT_URL);
  lookupUrl.searchParams.set("email", trimmedEmail);
  lookupUrl.searchParams.set("wallet", normalizedWallet);

  const response = await fetch(lookupUrl.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Waitlist lookup failed");
  }

  const result = (await response.json()) as WaitlistLookupResult;
  const isWaitlisted = Boolean(result.success && result.found);

  if (isWaitlisted) {
    setStorageValue(walletSubmissionKey(normalizedWallet), "true");
  }

  return isWaitlisted;
}

/**
 * Submits email to Google Apps Script waitlist
 * Returns true if successful, throws error if network fails
 */
export async function submitToWaitlist(email: string, wallet: string): Promise<boolean> {
  const trimmed = email.trim();
  const normalizedWallet = normalizeWallet(wallet);
  const duplicateKey = submissionKey(trimmed, normalizedWallet);
  const throttleKey = rateLimitKey(normalizedWallet);
  const now = Date.now();

  if (isWalletWaitlistedLocally(normalizedWallet)) {
    throw new WaitlistDuplicateSubmissionError("This wallet is already on the waitlist.");
  }

  if (getStorageValue(duplicateKey)) {
    throw new WaitlistDuplicateSubmissionError("This wallet and email are already on the waitlist.");
  }

  const lastSubmitAt = Number(getStorageValue(throttleKey) ?? 0);
  if (lastSubmitAt && now - lastSubmitAt < WAITLIST_COOLDOWN_MS) {
    const retryIn = Math.ceil((WAITLIST_COOLDOWN_MS - (now - lastSubmitAt)) / 1000);
    throw new WaitlistRateLimitError(`Please wait ${retryIn}s before trying again.`);
  }

  setStorageValue(throttleKey, String(now));

  const payload: WaitlistPayload = {
    email: trimmed,
    wallet: normalizedWallet,
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
    setStorageValue(duplicateKey, "true");
    setStorageValue(walletSubmissionKey(normalizedWallet), "true");
    return true;
  } catch (error) {
    removeStorageValue(throttleKey);
    throw new Error("Network request failed");
  }
}
