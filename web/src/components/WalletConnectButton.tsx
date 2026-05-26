import { useState } from "react";
import { useClerk } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";

type EthereumProvider = {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletConnectButtonProps {
  children?: string;
  size?: "base" | "lg";
}

const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

function formatAuthError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "MetaMask connection was cancelled or could not be completed.";
}

function getMetaMaskProvider() {
  const ethereum = window.ethereum;
  if (!ethereum) return null;

  const providers = Array.isArray(ethereum.providers) ? ethereum.providers : [ethereum];
  return providers.find((provider) => provider.isMetaMask) ?? null;
}

async function runWithMetaMaskProvider<T>(provider: EthereumProvider, callback: () => Promise<T>) {
  if (window.ethereum === provider) {
    return callback();
  }

  const originalDescriptor = Object.getOwnPropertyDescriptor(window, "ethereum");

  try {
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      writable: true,
      value: provider,
    });
  } catch {
    throw new Error("MetaMask is installed, but another wallet is controlling this browser. Disable the other wallet extension, then try again.");
  }

  try {
    return await callback();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(window, "ethereum", originalDescriptor);
    } else {
      delete window.ethereum;
    }
  }
}

export function WalletConnectButton({
  children = "Connect Wallet",
  size = "lg",
}: WalletConnectButtonProps) {
  const clerk = useClerk();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const metaMaskProvider = getMetaMaskProvider();

      if (!metaMaskProvider) {
        setError("MetaMask extension is required. Install MetaMask, then refresh this page.");
        return;
      }

      const currentPath = `${window.location.pathname || "/wallet"}${window.location.search}${window.location.hash}`;
      const returnUrl = `${window.location.origin}${currentPath}`;

      await runWithMetaMaskProvider(metaMaskProvider, () => {
        return clerk.authenticateWithMetamask({
          redirectUrl: returnUrl,
          signUpContinueUrl: returnUrl,
          unsafeMetadata: {
            source: "web",
            product: "0xnull",
          },
        });
      });
    } catch (authError) {
      setError(formatAuthError(authError));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-auth-control">
      <button
        type="button"
        className={`cta-button cta-button-${size}`}
        onClick={connect}
        disabled={isConnecting}
      >
        <span>{isConnecting ? "Connecting..." : children}</span>
        <span className="cta-icon">
          <ArrowRight aria-hidden="true" size={20} />
        </span>
      </button>
      {error && (
        <p className="wallet-auth-error">
          {error}{" "}
          {error.includes("MetaMask extension is required") && (
            <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noreferrer">
              Download MetaMask
            </a>
          )}
        </p>
      )}
    </div>
  );
}

