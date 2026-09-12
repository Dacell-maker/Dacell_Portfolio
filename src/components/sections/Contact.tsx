import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'motion/react';
import { site } from '@/data/site';
import { EASE, fadeUp, staggerContainer, viewportOnce } from '@/lib/motion';
import { cursorProps } from '@/lib/cursor';
import SectionHead from '@/components/ui/SectionHead';
import MagneticButton from '@/components/ui/MagneticButton';

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const CHANNELS = [
  {
    label: 'Email',
    value: site.email,
    href: `mailto:${site.email}`,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="m3 6 7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Phone',
    value: site.phone,
    href: site.phoneHref,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3 11.4 8.6 17 15.4 17a1.5 1.5 0 0 0 1.6-1.5v-2l-3.5-1.2-1.6 1.9a11.6 11.6 0 0 1-4.7-4.7l1.9-1.6L6.5 3Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    value: site.githubHandle,
    href: site.github,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: site.linkedinHandle,
    href: site.linkedin,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M4.5 3a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM3 8h3v9H3V8Zm5.5 0H11v1.3h.05c.35-.63 1.2-1.3 2.5-1.3 2.65 0 3.15 1.7 3.15 3.95V17h-3v-4.4c0-1.05-.02-2.4-1.5-2.4s-1.7 1.15-1.7 2.32V17h-3V8Z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!FORMSPREE_ID) {
      // No form service configured yet — fall back to the visitor's mail client.
      const form = event.currentTarget;
      const name = (form.elements.namedItem('name') as HTMLInputElement | null)?.value ?? '';
      const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value ?? '';
      const body = (form.elements.namedItem('message') as HTMLTextAreaElement | null)?.value ?? '';
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        `Portfolio enquiry from ${name || 'a visitor'}`,
      )}&body=${encodeURIComponent(`${body}\n\n— ${name}\n${email}`)}`;
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.currentTarget),
      });

      if (response.ok) {
        setStatus('sent');
        event.currentTarget.reset();
      } else {
        setStatus('error');
        setMessage('Something went wrong sending that message. Please email me directly.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please email me directly.');
    }
  }

  return (
    <section id="contact" className="section contact">
      <div className="contact__glow" aria-hidden="true" />
      <div className="container">
        <SectionHead
          eyebrow="Contact"
          title={
            <>
              Have a project in mind?
              <br />
              <span className="contact__accent">Let&rsquo;s build something people remember.</span>
            </>
          }
          lede="An opportunity, a product idea, or just a hello — my inbox is always open."
        />

        <div className="contact__grid">
          <motion.div
            className="contact__info"
            variants={staggerContainer(0, 0.09)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            <ul className="channels">
              {CHANNELS.map((channel) => (
                <motion.li key={channel.label} variants={fadeUp}>
                  <a
                    className="channel"
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer noopener"
                    {...cursorProps('link')}
                  >
                    <span className="channel__icon">{channel.icon}</span>
                    <span className="channel__text">
                      <em>{channel.label}</em>
                      <strong>{channel.value}</strong>
                    </span>
                    <span className="channel__arrow" aria-hidden="true">
                      <svg viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 12L12 4M12 4H5.5M12 4v6.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <motion.blockquote className="contact__quote" variants={fadeUp}>
              <p>&ldquo;{site.quote}&rdquo;</p>
              <footer>— {site.quoteAttribution}</footer>
            </motion.blockquote>

            <motion.div className="contact__cv" variants={fadeUp}>
              <MagneticButton href={site.cvUrl} download cursor="link" magnetic={12}>
                Download CV
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 2v9m0 0 3.5-3.5M8 11 4.5 7.5M2.5 13.5h11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </MagneticButton>
              <span className="contact__cv-note">PDF · updated on request</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="contact__form-wrap"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.85, ease: EASE }}
          >
            <div className="contact__form-head">
              <h3>Send me a message</h3>
              <p>{site.responseTime}</p>
            </div>

            <form className="contact__form" onSubmit={handleSubmit} noValidate={false}>
              <div className="field">
                <label className="field__label" htmlFor="contact-name">
                  Your name
                </label>
                <input
                  className="input"
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="contact-email">
                  Your email
                </label>
                <input
                  className="input"
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@company.com"
                  required
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  className="textarea"
                  id="contact-message"
                  name="message"
                  placeholder="Tell me about the project, the timeline and what success looks like…"
                  required
                  minLength={10}
                />
              </div>

              {/* Honeypot — bots fill it, humans never see it */}
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="sr-only" />

              <MagneticButton type="submit" variant="primary" className="btn--block" cursor="send" magnetic={10}>
                {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Message sent ✓' : 'Send Message'}
              </MagneticButton>

              <p className="contact__form-note" role="status" aria-live="polite">
                {status === 'sent'
                  ? 'Thanks — your message is on its way. I’ll reply shortly.'
                  : status === 'error'
                    ? message
                    : FORMSPREE_ID
                      ? 'Delivered straight to my inbox via Formspree.'
                      : `This opens your email client — no data is stored anywhere. (Add VITE_FORMSPREE_ID to enable direct sending.)`}
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
