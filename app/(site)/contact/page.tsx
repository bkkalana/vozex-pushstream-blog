import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Facebook,
  Handshake,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircleMore,
  Newspaper,
  Send,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { ContactForm } from "@/components/site/engagement/contact-form";
import { PublicContainer } from "@/components/site/v2/primitives/container";
import { NewsletterBand } from "@/components/site/v2/sections/newsletter-band";
import { getEditorialPageData, type EditorialPageSection } from "@/services/site/about-contact-v2.service";
import { ResponsiveHeroImage } from "@/components/site/v2/primitives/responsive-hero-image";
import { resolveHeroMedia } from "@/services/site/hero-media.service";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Contact PushStream",
  description: "Contact PushStream for questions, suggestions, partnerships, advertising and press enquiries.",
};

function stringConfig(section: EditorialPageSection | undefined, key: string, fallback: string) {
  const value = section?.config[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function contactIcon(name?: string | null) {
  const key = (name ?? "").toLowerCase();
  if (key.includes("partner")) return Handshake;
  if (key.includes("press") || key.includes("media")) return Newspaper;
  if (key.includes("location") || key.includes("remote")) return MapPin;
  if (key.includes("response") || key.includes("clock")) return Clock3;
  if (key.includes("community") || key.includes("people")) return Users;
  if (key.includes("safe") || key.includes("friendly")) return ShieldCheck;
  return Mail;
}

export default async function ContactPage() {
  const data = await getEditorialPageData("contact");
  const hero = data.section("hero");
  const contact = data.section("contact");
  const methods = data.section("methods");
  const faq = data.section("faq");
  const social = data.section("social");
  const newsletter = data.section("newsletter");
  const heroMedia = await resolveHeroMedia(hero);

  const heroBadges = hero?.items.length
    ? hero.items.slice(0, 3)
    : [
        { title: "Quick Responses", subtitle: "We read every message", body: null, icon: "clock", imageId: null, url: null, sortOrder: 10, config: {} },
        { title: "Friendly Support", subtitle: "Clear, human replies", body: null, icon: "friendly", imageId: null, url: null, sortOrder: 20, config: {} },
        { title: "Community Driven", subtitle: "Ideas are welcome", body: null, icon: "community", imageId: null, url: null, sortOrder: 30, config: {} },
      ];

  const methodItems = methods?.items.length
    ? methods.items
    : [
        { title: "Email Us", subtitle: data.settings.adminEmail || "Use the contact form", body: "For general questions and feedback.", icon: "email", url: data.settings.adminEmail ? `mailto:${data.settings.adminEmail}` : null },
        { title: "Our Location", subtitle: "Remote-first", body: "PushStream works online and serves readers globally.", icon: "location", url: null },
        { title: "Partnership Inquiries", subtitle: "Collaborations & sponsorships", body: "Tell us what you have in mind and why it fits our audience.", icon: "partner", url: null },
        { title: "Press & Media", subtitle: "Editorial and media enquiries", body: "Use the form and choose the closest topic.", icon: "press", url: null },
      ];

  const faqItems = faq?.items.length
    ? faq.items
    : [
        { title: "How quickly will you reply?", body: "Response times vary by message volume. We prioritize clear, relevant questions and business enquiries." },
        { title: "Can I suggest an article or tutorial?", body: "Yes. Choose Content Suggestion in the form and include the problem you want the guide to solve." },
        { title: "Do you accept partnerships or sponsorships?", body: "Yes, when they fit PushStream readers and our disclosure standards. Send the details through the form." },
        { title: "Can I report an error in an article?", body: "Absolutely. Send the article URL and the specific section that needs attention." },
        { title: "Can I contribute to PushStream?", body: "You can introduce your expertise and proposed topics through the contact form. Acceptance is editorially reviewed." },
        { title: "Where is PushStream based?", body: "PushStream operates as a remote-first online publication and serves a global audience." },
      ];

  const socialItems = social?.items.length
    ? social.items.filter((item) => item.url)
    : [
        data.settings.facebook ? { title: "Facebook", url: data.settings.facebook } : null,
        data.settings.twitter ? { title: "X / Twitter", url: data.settings.twitter } : null,
        data.settings.linkedin ? { title: "LinkedIn", url: data.settings.linkedin } : null,
        data.settings.youtube ? { title: "YouTube", url: data.settings.youtube } : null,
        data.settings.instagram ? { title: "Instagram", url: data.settings.instagram } : null,
      ].filter(Boolean) as Array<{ title: string; url: string }>;

  const socialIcon = (title: string) => {
    const key = title.toLowerCase();
    if (key.includes("facebook")) return Facebook;
    if (key.includes("linkedin")) return Linkedin;
    if (key.includes("youtube")) return Youtube;
    if (key.includes("instagram")) return Instagram;
    if (key.includes("twitter") || key.includes("x /")) return Twitter;
    return MessageCircleMore;
  };

  return (
    <main className="ps-contact-page">
      {hero ? (
        <section className="ps-contact-hero">
          <PublicContainer className="ps-contact-hero-grid">
            <div>
              <span className="ps-eyebrow">{stringConfig(hero, "eyebrow", "CONTACT PUSHSTREAM")}</span>
              <h1>{hero.heading || "We’d Love to Hear from You"}<span>{stringConfig(hero, "accentText", "Start a Conversation.")}</span></h1>
              <p>{hero.description || "Questions, suggestions, partnership ideas, advertising enquiries or feedback are welcome. Send us a message and choose the topic that best fits."}</p>
              <div className="ps-hero-actions">
                <Link href={stringConfig(hero, "primaryCtaUrl", "#contact-form")} className="ps-button ps-button-primary">{stringConfig(hero, "primaryCtaLabel", "Send a Message")} <ArrowRight size={16} /></Link>
                <Link href={stringConfig(hero, "secondaryCtaUrl", "/about")} className="ps-button ps-button-secondary">{stringConfig(hero, "secondaryCtaLabel", "About PushStream")}</Link>
              </div>
            </div>
            <div className="ps-contact-hero-visual">
              <div className="ps-contact-hero-image"><ResponsiveHeroImage desktop={heroMedia.desktop} mobile={heroMedia.mobile} alt={heroMedia.alt || "Contact PushStream"} desktopPosition={heroMedia.desktopPosition} mobilePosition={heroMedia.mobilePosition} overlay={heroMedia.overlay} sizes="(max-width:900px) 100vw,45vw" fallback={<div className="ps-contact-hero-placeholder"><Send size={46} /><strong>Let’s talk.</strong><span>Questions • ideas • partnerships • feedback</span></div>} /></div>
              {heroBadges.map((item, index) => { const Icon = contactIcon(item.icon || item.title); return <span key={`${item.title}-${index}`} className={`ps-contact-float ps-contact-float-${index + 1}`}><Icon size={17} /><span><strong>{item.title}</strong>{item.subtitle ? <small>{item.subtitle}</small> : null}</span></span>; })}
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {contact ? (
        <section id="contact-form" className="ps-section ps-contact-main">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered"><div><span className="ps-eyebrow">GET IN TOUCH</span><h2 className="ps-section-title">{contact.heading || "Send Us a Message"}</h2>{contact.description ? <p>{contact.description}</p> : <p>Share enough context for us to understand what you need. Please don’t send passwords or private credentials.</p>}</div></div>
            <div className="ps-contact-main-grid">
              <ContactForm />
              <aside className="ps-contact-method-panel">
                <span className="ps-eyebrow">CONTACT INFORMATION</span>
                <h3>{methods?.heading || "Ways to Reach Us"}</h3>
                <div className="ps-contact-method-list">
                  {methodItems.slice(0, methods?.itemCount ?? 4).map((item, index) => { const Icon = contactIcon(item.icon || item.title); const card = <><span className="ps-contact-method-icon"><Icon size={20} /></span><span><strong>{item.title}</strong>{item.subtitle ? <small>{item.subtitle}</small> : null}{item.body ? <p>{item.body}</p> : null}</span></>; return item.url ? <Link key={`${item.title}-${index}`} href={item.url} className="ps-contact-method-card">{card}</Link> : <div key={`${item.title}-${index}`} className="ps-contact-method-card">{card}</div>; })}
                </div>
              </aside>
            </div>
          </PublicContainer>
        </section>
      ) : null}

      {faq ? (
        <section className="ps-section ps-contact-faq">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered"><div><span className="ps-eyebrow">QUICK ANSWERS</span><h2 className="ps-section-title">{faq.heading || "Frequently Asked Questions"}</h2>{faq.description ? <p>{faq.description}</p> : null}</div></div>
            <div className="ps-contact-faq-grid">{faqItems.slice(0, faq.itemCount ?? 6).map((item, index) => <details key={`${item.title}-${index}`} className="ps-contact-faq-item"><summary>{item.title}<span>+</span></summary>{item.body ? <p>{item.body}</p> : null}</details>)}</div>
          </PublicContainer>
        </section>
      ) : null}

      {social ? (
        <section className="ps-section ps-contact-social">
          <PublicContainer>
            <div className="ps-section-heading ps-section-heading-centered"><div><span className="ps-eyebrow">COMMUNITY</span><h2 className="ps-section-title">{social.heading || "Follow & Connect"}</h2>{social.description ? <p>{social.description}</p> : <p>Follow PushStream on the channels you already use.</p>}</div></div>
            {socialItems.length ? <div className="ps-contact-social-grid">{socialItems.slice(0, social.itemCount ?? 5).map((item, index) => { const Icon = socialIcon(item.title || "Social"); return <Link key={`${item.title}-${index}`} href={item.url!} target="_blank" rel="noopener noreferrer" className="ps-contact-social-card"><span><Icon size={22} /></span><strong>{item.title}</strong><small>Follow PushStream</small><ArrowRight size={16} /></Link>; })}</div> : <div className="ps-empty-state">Add social links in Admin → Site Settings to display them here.</div>}
          </PublicContainer>
        </section>
      ) : null}

      {newsletter ? <NewsletterBand title={newsletter.heading || "Stay Connected with PushStream"} description={newsletter.description || "Get practical guides, new tools and useful web ideas in your inbox."} /> : null}
    </main>
  );
}
