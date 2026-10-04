import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/site/home/newsletter-form";
import { PublicContainer } from "../primitives/container";

export function NewsletterBand({ title = "Get the Latest Tech Guides in Your Inbox", description = "Fresh guides, tool recommendations and practical tips delivered to your inbox every week." }: { title?: string; description?: string }) {
  return (
    <section className="ps-newsletter-section">
      <PublicContainer>
        <div className="ps-newsletter-band">
          <div className="ps-newsletter-copy">
            <span className="ps-newsletter-icon"><Mail size={22} aria-hidden="true" /></span>
            <div><span className="ps-eyebrow ps-eyebrow-light">Stay updated</span><h2>{title}</h2><p>{description}</p></div>
          </div>
          <div className="ps-newsletter-form-wrap"><NewsletterForm /><p className="ps-newsletter-helper">No spam. Unsubscribe anytime.</p></div>
        </div>
      </PublicContainer>
    </section>
  );
}
