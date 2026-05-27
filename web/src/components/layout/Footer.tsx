import { motion } from "framer-motion";
import { Twitter, Instagram } from "lucide-react";

export function Footer({ onOpenWaitlist }: { onOpenWaitlist: () => void }) {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <motion.div 
          className="footer-main"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="footer-title" data-editable="true">Coming Soon</h2>
          <p className="footer-description" data-editable="true">
            0xNull is building the future of credential verification. Join our waitlist to be the first to know when we launch.
          </p>
          
          <button className="footer-cta" onClick={onOpenWaitlist} data-editable="true">
            Join Waitlist Now
          </button>
        </motion.div>

        <motion.div 
          className="footer-divider"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ transformOrigin: "left" }}
        />

        <motion.div 
          className="footer-social"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="footer-label" data-editable="true">Follow me!</p>
          <div className="social-links">
            <a 
              href="https://x.com/ankitdey01" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter/X"
              data-editable="true"
            >
              <Twitter size={20} />
              <span>x.com/ankitdey01</span>
            </a>
            <a 
              href="https://instagram.com/livankit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
              data-editable="true"
            >
              <Instagram size={20} />
              <span>@livankit</span>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright" data-editable="true">
          © 2026 0xNull. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
