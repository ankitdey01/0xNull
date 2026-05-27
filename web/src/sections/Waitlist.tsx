import { useWaitlist } from "../hooks/useWaitlist";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { WalletConnectButton } from "../components/WalletConnectButton";
import { useWalletAddress } from "../hooks/useWalletAddress";
import { motion } from "framer-motion";

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
      <motion.div 
        className="success-message"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <CheckCircle2 size={48} strokeWidth={1.5} />
        <h3>Already waitlisted.</h3>
        <p>Stay tuned.</p>
      </motion.div>
    );
  }

  // Success state: show success message, hide form
  if (state === "success") {
    return (
      <motion.div 
        className="success-message"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <CheckCircle2 size={48} strokeWidth={1.5} />
        <h3>You're on the list.</h3>
        <p>Check your email for updates about 0xNull launch.</p>
      </motion.div>
    );
  }

  // Default, loading, and error states: show form
  return (
    <motion.form 
      className="waitlist-form" 
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* Wallet Status */}
      <motion.p 
        className="wallet-chip"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
      >
        ✓ Wallet {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} connected
      </motion.p>

      {/* Form Inputs Group */}
      <div className="form-group">
        <motion.input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={state === "loading"}
          className="form-input"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
        />
      </div>
      
      {/* Submit Button */}
      <motion.button
        type="submit"
        className="cta-button cta-button-lg form-submit"
        disabled={state === "loading"}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      >
        <span className={state === "loading" ? "loading-text" : ""}>
          {state === "loading" ? "Joining..." : "Join Waitlist"}
        </span>
        <motion.span 
          className="cta-icon"
          animate={state === "loading" ? { rotate: 360 } : { rotate: 0 }}
          transition={state === "loading" ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
        >
          <ArrowRight aria-hidden="true" size={20} />
        </motion.span>
      </motion.button>
      
      {/* Error Message */}
      {error && (
        <motion.p 
          className="waitlist-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  );
}
