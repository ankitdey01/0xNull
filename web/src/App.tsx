import { MouseEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Waitlist } from "./sections/Waitlist";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { useWalletAddress } from "./hooks/useWalletAddress";

type RouteName = "" | "network" | "ecosystem" | "security" | "help" | "wallet";
type Target = { kind: "route"; path: RouteName } | { kind: "section"; id: string };

type Brand = {
  name: string;
  fontFamily: string;
  fontWeight: number;
  letterSpacing: string;
  fontSize: string;
  fontStyle?: string;
  textTransform?: "uppercase";
};

const heroVideo = "/assets/halo-hero.mp4";
const heroBg = "/assets/bg.png";

// Toggle: Set to false to use background image instead of video
const useVideo = false;
const card1Image =
  "/assets/card1.png";
const card2Image =
  "/assets/card2.png";

const navItems = [
  { label: "Features", path: "network", section: "network" },
  { label: "How It Works", path: "ecosystem", section: "ecosystem" },
  { label: "Security", path: "security", section: "security" },
  { label: "Help", path: "help", section: "help" },
] as const;

const platformBrands: Brand[] = [
  { name: "MetaMask", fontFamily: "Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em", fontSize: "15px" },
  { name: "Base", fontFamily: "Arial, sans-serif", fontWeight: 900, letterSpacing: "0.08em", fontSize: "13px", textTransform: "uppercase" },
  { name: "Walrus", fontFamily: "Trebuchet MS, sans-serif", fontWeight: 600, letterSpacing: "0.01em", fontSize: "15px", fontStyle: "italic" },
  { name: "Sui", fontFamily: "Courier New, monospace", fontWeight: 700, letterSpacing: "0.12em", fontSize: "13px", textTransform: "uppercase" },
  { name: "Solidity", fontFamily: 'Palatino, "Book Antiqua", serif', fontWeight: 400, letterSpacing: "-0.01em", fontSize: "16px" },
  { name: "Web3Auth", fontFamily: 'Impact, "Arial Narrow", sans-serif', fontWeight: 400, letterSpacing: "0.04em", fontSize: "14px" },
  { name: "Cryptography", fontFamily: "Verdana, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fontSize: "13px" },
];

const backerBrands: Brand[] = [
  { name: "OpenZeppelin", fontFamily: "Times New Roman, serif", fontWeight: 400, letterSpacing: "0.02em", fontSize: "14px" },
  { name: "Ledger", fontFamily: '"Arial Black", sans-serif', fontWeight: 900, letterSpacing: "0.08em", fontSize: "16px" },
  { name: "Ethereum", fontFamily: "Impact, sans-serif", fontWeight: 700, letterSpacing: "0.05em", fontSize: "18px" },
  { name: "Polygon", fontFamily: "Georgia, serif", fontWeight: 600, letterSpacing: "-0.02em", fontSize: "17px" },
  { name: "Gitcoin", fontFamily: "Helvetica, Arial, sans-serif", fontWeight: 700, letterSpacing: "-0.01em", fontSize: "15px" },
  { name: "TheBlock", fontFamily: "Verdana, sans-serif", fontWeight: 700, letterSpacing: "0.06em", fontSize: "14px", textTransform: "uppercase" },
  { name: "CoinMarketCap", fontFamily: "Courier New, monospace", fontWeight: 700, letterSpacing: "0.18em", fontSize: "14px" },
  { name: "Paradigm", fontFamily: "Palatino, serif", fontWeight: 500, letterSpacing: "0.03em", fontSize: "15px" },
];

function routePath(path: RouteName) {
  return path ? `/${path}` : "/";
}

function sectionHash(id: string) {
  return `#${id}`;
}

function parseLocation(): { kind: "route"; path: RouteName } | { kind: "section"; id: string } | null {
  // Check if there's a hash fragment (section reference)
  if (window.location.hash) {
    const id = window.location.hash.replace(/^#/, "");
    return { kind: "section", id };
  }
  
  // Parse the pathname for routes
  const pathname = window.location.pathname;
  if (pathname === "/" || pathname === "") {
    return null;
  }
  
  const path = pathname.replace(/^\/|\/$/g, "") as RouteName;
  return { kind: "route", path };
}

function scrollToSection(id: string, behavior: ScrollBehavior = "smooth") {
  const element = document.getElementById(id);
  if (!element) return false;
  element.scrollIntoView({ behavior, block: "start" });
  return true;
}

function useRoute(defaultRoute: RouteName = "") {
  const [route, setRoute] = useState<RouteName>(() => {
    if (typeof window === "undefined") return defaultRoute;
    const location = parseLocation();
    return location?.kind === "route" ? location.path : defaultRoute;
  });

  useEffect(() => {
    const sync = () => {
      const location = parseLocation();
      if (!location) {
        setRoute(defaultRoute);
        return;
      }
      if (location.kind === "route") {
        setRoute(location.path);
        return;
      }
      scrollToSection(location.id);
      setRoute(defaultRoute);
    };

    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [defaultRoute]);

  return route;
}

function handleTarget(event: MouseEvent<HTMLAnchorElement>, target: Target) {
  event.preventDefault();
  if (target.kind === "route") {
    const path = routePath(target.path);
    window.history.pushState(null, "", path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Dispatch popstate event to trigger route sync
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  // For section navigation, first go to homepage if not there
  if (target.kind === "section") {
    const currentRoute = parseLocation();
    if (currentRoute?.kind === "route" && currentRoute.path !== "") {
      // Navigate to homepage first
      window.history.pushState(null, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
      // Use setTimeout to allow state update before scrolling
      setTimeout(() => {
        scrollToSection(target.id);
        window.history.replaceState(null, "", sectionHash(target.id));
      }, 0);
    } else {
      // Already on homepage, just scroll
      if (scrollToSection(target.id)) {
        window.history.replaceState(null, "", sectionHash(target.id));
      }
    }
  }
}

function targetHref(target: Target) {
  return target.kind === "route" ? routePath(target.path) : sectionHash(target.id);
}

function TargetLink({
  target,
  className,
  children,
  editable,
}: {
  target: Target;
  className?: string;
  children: ReactNode;
  editable?: boolean;
}) {
  return (
    <a
      href={targetHref(target)}
      className={className}
      onClick={(event) => handleTarget(event, target)}
      data-editable={editable ? "true" : undefined}
    >
      {children}
    </a>
  );
}

function CtaButton({
  children,
  route,
  section,
  size = "lg",
  onClick,
}: {
  children: ReactNode;
  route?: RouteName;
  section?: string;
  size?: "base" | "lg";
  onClick?: () => void;
}) {
  const target: Target | undefined = route ? { kind: "route", path: route } : section ? { kind: "section", id: section } : undefined;
  const button = (
    <>
      <span>{children}</span>
      <span className="cta-icon">
        <ArrowRight aria-hidden="true" size={20} />
      </span>
    </>
  );
  const className = `cta-button cta-button-${size}`;

  if (!target) {
    return (
      <motion.button whileTap={{ scale: 0.97 }} type="button" className={className} onClick={onClick} data-editable="true">
        {button}
      </motion.button>
    );
  }

  return (
    <motion.span whileTap={{ scale: 0.97 }} className="motion-inline">
      <TargetLink target={target} className={className} editable>
        {button}
      </TargetLink>
    </motion.span>
  );
}

function HaloMark({ className = "halo-mark" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className} aria-hidden="true">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

function Navbar() {
  const route = useRoute("");
  const { isLoaded, isSignedIn, walletAddress } = useWalletAddress();
  const showWalletUser = isLoaded && isSignedIn && walletAddress;

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <TargetLink target={{ kind: "route", path: "" }} className="brand" editable>
          <img src="/assets/logo.svg" alt="0xNull" className="logo-image" />
          <span className="brand-wordmark">0xNull</span>
        </TargetLink>

        <div className="nav-links">
          {navItems.map((item) => (
            <TargetLink
              key={item.path}
              target={{ kind: "section", id: item.section }}
              className={`nav-link ${route === item.path ? "active" : ""}`}
              editable
            >
              {item.label}
            </TargetLink>
          ))}
        </div>

        {showWalletUser ? (
          <div className="wallet-user-button nav-wallet-user-button" aria-label="Wallet account menu">
            <span className="nav-wallet-address">{walletAddress.slice(0, 7)}...{walletAddress.slice(-5)}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <TargetLink target={{ kind: "route", path: "wallet" }} className="wallet-button" editable>
            Connect Wallet
          </TargetLink>
        )}
      </div>
    </nav>
  );
}

function BrandMarquee({
  brands,
  trackClass,
  itemClass = "brand-item",
}: {
  brands: Brand[];
  trackClass: string;
  itemClass?: string;
}) {
  const items = useMemo(() => [...brands, ...brands], [brands]);

  return (
    <div className="marquee-shell">
      <div className={trackClass}>
        {items.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            className={itemClass}
            style={{
              fontFamily: brand.fontFamily,
              fontWeight: brand.fontWeight,
              letterSpacing: brand.letterSpacing,
              fontSize: brand.fontSize,
              fontStyle: brand.fontStyle,
              textTransform: brand.textTransform,
            }}
            data-editable="true"
          >
            {brand.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function WaitlistFormModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <h2 data-editable="true">Join the Waitlist.</h2>
        <p data-editable="true">Be the first to know when 0xNull launches.</p>
        <Waitlist onSuccess={onClose} />
      </motion.div>
    </div>
  );
}

function HeroSection({ onWaitlistClick }: { onWaitlistClick: () => void }) {
  return (
    <section className="hero-section">
      <div id="network" className="hero-card">
        {useVideo ? (
          <video className="hero-video" src={heroVideo} autoPlay muted loop playsInline />
        ) : (
          <img className="hero-video" src={heroBg} alt="Hero background" />
        )}
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h1 className="hero-title" data-editable="true">
            Share Secrets
            <br />
            Securely.
          </h1>
          <p className="hero-copy" data-editable="true">
            Encrypt locally. Commit on-chain. Team secrets with zero plaintext ever leaving your device.
          </p>
          <CtaButton onClick={onWaitlistClick}>Join waitlist</CtaButton>
          <div className="hero-marquee">
            <BrandMarquee brands={platformBrands} trackClass="marquee-track" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section id="ecosystem" className="section ecosystem-section">
      <div className="wide-container">
        <div className="intro-grid">
          <div>
            <h2 className="section-title with-margin" data-editable="true">
              How 0xNull Works.
            </h2>
            <CtaButton size="base" section="security">
              Discover it
            </CtaButton>
          </div>
          <p className="intro-copy" data-editable="true">
            0xNull is a decentralized credentials vault where API keys and secrets are encrypted on your device before leaving your browser, verified by smart contracts.
          </p>
        </div>

        <div id="security" className="feature-grid">
          <article className="feature-card featured-card" style={{ backgroundImage: `url(${card1Image})` }}>
            <h3 data-editable="true">Client-Side Encryption</h3>
            <p data-editable="true">AES-256-GCM encryption happens on your device. Plaintext never touches our servers.</p>
          </article>
          <article className="feature-card frost-blue-card">
            <h3 data-editable="true">
              On-Chain
              <br />
              Verification.
            </h3>
            <p data-editable="true">Team membership and access control live on a Solidity smart contract on Base.</p>
          </article>
          <article className="feature-card frost-blue-card">
            <h3 data-editable="true">
              Immutable
              <br />
              Audit Trail
            </h3>
            <p data-editable="true">Every credential add and member invite is recorded on-chain with timestamps and signatures.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function NetworkSummary() {
  return (
    <section className="section network-summary">
      <div className="wide-container">
        <h2 className="section-title" data-editable="true">
          Trustless Secrets
        </h2>
        <p className="summary-copy" data-editable="true">
          Wallet-based login, Walrus decentralized storage, and on-chain team management ensure secrets are shared trustlessly across your team.
        </p>
      </div>
    </section>
  );
}

function BackersSection() {
  return (
    <section id="news" className="backers-section">
      <div className="wide-container backers-grid">
        <p className="backers-kicker" data-editable="true">
          Built for developers
          <br />
          who demand security.
        </p>
        <div className="backers-marquee-wrap">
          <BrandMarquee brands={backerBrands} trackClass="backers-track" itemClass="backer-item" />
        </div>
      </div>
    </section>
  );
}

function HelpSection() {
  return (
    <section id="help" className="section help-section">
      <div className="wide-container help-grid">
        <div className="help-copy-wrap">
          <p className="eyebrow" data-editable="true">0xNull for Teams</p>
          <h2 className="use-title" data-editable="true">Use Cases</h2>
          <p className="use-copy" data-editable="true">
            Perfect for indie teams, hackathons, and Web3 projects needing trustless credential sharing with zero plaintext exposure
          </p>
        </div>

        <div className="commerce-card" style={{ backgroundImage: `url(${card2Image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="commerce-content">
            <h3 data-editable="true">Team Secrets</h3>
            <p data-editable="true">
              Securely share API keys, database URLs, and webhook secrets across your dev team with cryptographic proof and immutable audit trails.
            </p>
            <TargetLink target={{ kind: "section", id: "ecosystem" }} className="text-arrow-link" editable>
              Know more
              <span>
                <ArrowRight aria-hidden="true" size={16} />
              </span>
            </TargetLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecurityPage() {
  return (
    <PageWithOffset>
      <section className="section security-page-section">
        <div className="wide-container">
          <h2 className="section-title with-margin-small" data-editable="true">
            0xNull Security
          </h2>
          <p className="large-copy" data-editable="true">
            AES-256-GCM encryption on your device, SHA-256 credential commitments on-chain, and zero-knowledge proofs ensure your team secrets stay private while maintaining tamper-proof access.
          </p>
          <div className="info-card-grid">
            <article className="info-card">
              <h3 data-editable="true">Zero Plaintext</h3>
              <p data-editable="true">Encryption happens on your device. We never see your secrets.</p>
            </article>
            <article className="info-card">
              <p data-editable="true">No passwords. Just MetaMask and your team's smart contract.</p>
            </article>
          </div>
          <div className="spaced-top">
            <CtaButton size="base" route="wallet">
              Connect Wallet
            </CtaButton>
          </div>
        </div>
      </section>
    </PageWithOffset>
  );
}

function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <h2 data-editable="true">Join the Waitlist</h2>
        <p data-editable="true">Sign up to be notified when 0xNull launches.</p>
        <Waitlist onSuccess={onClose} />
      </motion.div>
    </div>
  );
}

function WalletPage() {
  const { isLoaded, walletAddress } = useWalletAddress();

  return (
    <PageWithOffset>
      <section id="wallet" className="wallet-section" aria-label="Wallet">
        <div className="wide-container centered">
          <h2 data-editable="true">Connect your wallet</h2>
          <p data-editable="true">Link MetaMask to join your team's vault, manage credentials, and verify on-chain access control.</p>
          <div className="wallet-panel">
            {!isLoaded && <p className="wallet-status">Checking wallet session...</p>}
            <SignedOut>
              <WalletConnectButton size="base">Connect MetaMask</WalletConnectButton>
            </SignedOut>
            <SignedIn>
              {walletAddress ? (
                <>
                  <p className="wallet-status">Connected as {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
                  <div className="wallet-user-button">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </>
              ) : (
                <>
                  <p className="wallet-status">Your Clerk session is active, but no MetaMask wallet is linked yet.</p>
                  <WalletConnectButton size="base">Connect MetaMask</WalletConnectButton>
                </>
              )}
            </SignedIn>
          </div>
        </div>
      </section>
    </PageWithOffset>
  );
}

function PageWithOffset({ children }: { children: ReactNode }) {
  return (
    <div className="page-offset">
      <Navbar />
      {children}
    </div>
  );
}

function HomePage() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="home-page">
      <Navbar />
      <HeroSection onWaitlistClick={() => setShowWaitlist(true)} />
      <EcosystemSection />
      <HelpSection />
      <WaitlistFormModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </div>
  );
}

function NetworkPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div className="network-page">
      <div className="network-hero-lockup">
        <Navbar />
        <HeroSection onWaitlistClick={() => setShowWaitlist(true)} />
      </div>
      <NetworkSummary />
      <WaitlistFormModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </div>
  );
}

function EcosystemPage() {
  return (
    <PageWithOffset>
      <EcosystemSection />
    </PageWithOffset>
  );
}

function HelpPage() {
  return (
    <PageWithOffset>
      <HelpSection />
    </PageWithOffset>
  );
}

export default function App() {
  const route = useRoute("");

  const routes: Record<RouteName, ReactNode> = {
    "": <HomePage />,
    network: <NetworkPage />,
    ecosystem: <EcosystemPage />,
    security: <SecurityPage />,
    help: <HelpPage />,
    wallet: <WalletPage />,
  };

  return <main className="app-shell">{routes[route] ?? routes[""]}</main>;
}
