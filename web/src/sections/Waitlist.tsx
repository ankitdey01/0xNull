import { useWaitlist } from "../hooks/useWaitlist";
import { ArrowRight } from "lucide-react";
import { WalletConnectButton } from "../components/WalletConnectButton";
import { useWalletAddress } from "../hooks/useWalletAddress";

interface WaitlistProps {
  onSuccess?: () => void;
}

export function Waitlist({ onSuccess }: WaitlistProps) {
  const { isLoaded, walletAddress } = useWalletAddress();
  const {
    state,
    hasExistingEntry,
    email,
    error,
    setEmail,
    handleSubmit,
  } = useWaitlist(onSuccess, walletAddress);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && state !== "loading" && state !== "success") {
      handleSubmit();
    }
  };

  if (!isLoaded) {
    return <p className="waitlist-helper">Checking wallet session...</p>;
  }

  if (!walletAddress) {
    return (
      <div className="wallet-required">
        <h3>Connect your MetaMask wallet</h3>
        <WalletConnectButton size="lg">Connect Wallet</WalletConnectButton>
      </div>
    );
  }

  if (hasExistingEntry && state !== "success") {
    return (
      <div className="success-message">
        <h3>Already waitlisted.</h3>
        <p>Stay tuned.</p>
      </div>
    );
  }

  // Success state: show success message, hide form
  if (state === "success") {
    return (
      <div className="success-message">
        <h3>You're on the list.</h3>
        <p>Check your email for updates about 0xNull launch.</p>
      </div>
    );
  }

  // Default, loading, and error states: show form
  return (
    <form className="waitlist-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <p className="wallet-chip">Wallet {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} connected!</p>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={state === "loading"}
        className="form-input"
      />
      <button
        type="submit"
        className="cta-button cta-button-lg form-submit"
        disabled={state === "loading"}
      >
        <span>{state === "loading" ? "Joining..." : "Join Waitlist"}</span>
        <span className="cta-icon">
          <ArrowRight aria-hidden="true" size={20} />
        </span>
      </button>
      {error && (
        <p style={{ color: "rgb(220, 38, 38)", fontSize: "14px", margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
