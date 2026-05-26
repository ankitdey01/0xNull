import { useWaitlist } from "../hooks/useWaitlist";
import { ArrowRight } from "lucide-react";

interface WaitlistProps {
  onSuccess?: () => void;
}

export function Waitlist({ onSuccess }: WaitlistProps) {
  const { state, email, error, setEmail, handleSubmit } = useWaitlist(onSuccess);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && state !== "loading" && state !== "success") {
      handleSubmit();
    }
  };

  // Success state: show success message, hide form
  if (state === "success") {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h3>You're on the list.</h3>
        <p>Check your email for updates about 0xNull launch.</p>
      </div>
    );
  }

  // Default, loading, and error states: show form
  return (
    <form className="waitlist-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
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
