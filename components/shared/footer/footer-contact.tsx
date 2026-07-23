import type { ReactNode } from "react";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type FooterContactInfo = {
  address: string;
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  /** Optional Google Maps URL — wraps the address when present. */
  mapsUrl?: string | null;
  /** Embeddable Maps iframe src derived from `mapsUrl`. */
  mapsEmbedUrl?: string | null;
  clinicName?: string | null;
  emergencyLabel?: string;
  emergencyPhone?: string;
  emergencyPhoneHref?: string;
};

/** Placeholder contact — used only when Footer receives no `contact` prop. */
export const DEFAULT_FOOTER_CONTACT: FooterContactInfo = {
  address: "123 Smile Avenue, Suite 100, Your City, ST 00000",
  phone: "+1 (555) 123-4567",
  phoneHref: "tel:+15551234567",
  email: "hello@kratidental.care",
  hours: "Monday – Saturday · 9:00 AM – 7:00 PM",
  emergencyLabel: "Emergency Contact",
  emergencyPhone: "+1 (555) 987-6543",
  emergencyPhoneHref: "tel:+15559876543",
};

type ContactRowProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
};

function ContactRow({ icon: Icon, label, children }: ContactRowProps) {
  return (
    <div className="flex gap-3 rounded-xl bg-white/50 px-3 py-3 sm:bg-transparent sm:px-0 sm:py-0">
      <span
        className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue sm:size-9"
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[0.6875rem] font-medium tracking-[0.12em] text-brand-muted uppercase sm:text-xs sm:tracking-wide">
          {label}
        </p>
        <div className="mt-1 text-[0.9375rem] leading-relaxed text-brand-dark sm:text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export type FooterContactProps = {
  contact?: FooterContactInfo;
  className?: string;
};

/**
 * Contact block — mobile uses soft card rows for easier tapping/reading.
 */
export function FooterContact({
  contact = DEFAULT_FOOTER_CONTACT,
  className,
}: FooterContactProps) {
  const hasEmergency =
    Boolean(contact.emergencyPhone) && Boolean(contact.emergencyPhoneHref);

  return (
    <div
      className={cn(
        "flex flex-col items-stretch text-center sm:items-start sm:text-left",
        className,
      )}
    >
      <h3 className="text-xs font-semibold tracking-[0.16em] text-brand-dark uppercase sm:text-sm sm:tracking-wide">
        Contact
      </h3>

      <address className="mt-4 flex w-full flex-col gap-2.5 not-italic sm:max-w-none sm:gap-4">
        <ContactRow icon={MapPin} label="Address">
          {contact.mapsUrl ? (
            <a
              href={contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-6 transition-colors duration-200 hover:text-brand-blue focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
            >
              {contact.address}
            </a>
          ) : (
            <p>{contact.address}</p>
          )}
        </ContactRow>

        <ContactRow icon={Phone} label="Phone">
          <a
            href={contact.phoneHref}
            className="inline-flex min-h-6 items-center transition-colors duration-200 hover:text-brand-blue focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
          >
            {contact.phone}
          </a>
        </ContactRow>

        <ContactRow icon={Mail} label="Email">
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex min-h-6 break-all transition-colors duration-200 hover:text-brand-blue focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
          >
            {contact.email}
          </a>
        </ContactRow>

        <ContactRow icon={Clock} label="Working Hours">
          <p>{contact.hours}</p>
        </ContactRow>

        {hasEmergency ? (
          <a
            href={contact.emergencyPhoneHref}
            className={cn(
              "mt-1 flex items-center gap-3 rounded-xl border border-brand-blue/25 bg-brand-blue/10 px-3 py-3.5 text-left transition-colors duration-200",
              "hover:border-brand-blue/40 hover:bg-brand-blue/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2",
              "sm:mt-0 sm:border-0 sm:bg-transparent sm:p-0 sm:hover:bg-transparent",
            )}
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue sm:size-9 sm:bg-brand-blue/10 sm:text-brand-blue"
              aria-hidden
            >
              <PhoneCall className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.6875rem] font-medium tracking-[0.12em] text-brand-muted uppercase sm:text-xs">
                {contact.emergencyLabel ?? "Emergency Contact"}
              </span>
              <span className="mt-1 block text-[0.9375rem] font-semibold text-brand-blue sm:text-sm sm:font-medium">
                {contact.emergencyPhone}
              </span>
            </span>
          </a>
        ) : null}
      </address>
    </div>
  );
}
