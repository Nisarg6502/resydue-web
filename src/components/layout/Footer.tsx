import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { Rich } from "@/components/ui/Rich";
import { footerNav, site } from "@/content/site";
import { PatternField } from "./PatternField";

export function Footer() {
  return (
    <footer className="relative bg-ink text-linen" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Site footer
      </h2>
      <div className="container-x grid gap-16 pb-16 pt-24 lg:grid-cols-12 lg:gap-8 lg:pt-32">
        <div className="lg:col-span-5">
          <p className="eyebrow text-gold">Newsletter</p>
          <p className="display-md mt-5 max-w-[14ch]">One email a month.</p>
          <p className="lede mt-5 max-w-md text-linen/70">A packaging tip, a kitchen story and a new test result. Nothing else.</p>
          <NewsletterForm className="mt-8 max-w-md" />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-linen/65">{col.title}</p>
              <ul className="mt-5 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block py-1.5 text-[1.02rem] text-linen/85 transition-colors duration-200 hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow text-linen/65">Talk to us</p>
            <ul className="mt-5 space-y-3 text-[1.02rem] text-linen/85">
              <li>
                <span className="block text-sm text-linen/65">WhatsApp</span>
                <Rich text={site.contact.whatsapp} />
              </li>
              <li>
                <span className="block text-sm text-linen/65">Email</span>
                <Rich text={site.contact.email} />
              </li>
              <li>
                <span className="block text-sm text-linen/65">Phone</span>
                <Rich text={site.contact.phone} />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <PatternField className="h-40 sm:h-56" />

      <div className="container-x flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <Link href="/" aria-label="Resydue home" className="text-linen">
          <Logo variant="primary" className="h-9 w-auto sm:h-11" decorative />
        </Link>
        <div className="flex flex-col gap-2 text-sm text-linen/65 sm:items-end">
          <p>Plastic-free food packaging. No plastic lining.</p>
          <p>© 2026 Resydue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
