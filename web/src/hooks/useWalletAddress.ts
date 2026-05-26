import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";

const SESSION_WALLET_KEY = "0xnull.walletAddress";

function readStoredWallet() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(SESSION_WALLET_KEY) ?? "";
}

export function useWalletAddress() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [storedWallet, setStoredWallet] = useState(readStoredWallet);

  const clerkWallet = useMemo(() => {
    return user?.primaryWeb3Wallet?.web3Wallet ?? user?.web3Wallets[0]?.web3Wallet ?? "";
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (clerkWallet) {
      window.sessionStorage.setItem(SESSION_WALLET_KEY, clerkWallet);
      setStoredWallet(clerkWallet);
      return;
    }

    if (isLoaded && !isSignedIn) {
      window.sessionStorage.removeItem(SESSION_WALLET_KEY);
      setStoredWallet("");
    }
  }, [clerkWallet, isLoaded, isSignedIn]);

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    walletAddress: clerkWallet || storedWallet,
  };
}

