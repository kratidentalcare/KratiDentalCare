import type { LucideIcon } from "lucide-react";
import { Mail, MapPin, Phone, PhoneCall } from "lucide-react";

import { PageContainer } from "@/components/layout";
import type { PublicContactInfo } from "@/features/contact/types";
import { cn } from "@/lib/utils";

import { CONTACT_PAGE } from "./contact-page-data";

export type ContactInfoCardsProps = {
  contact: PublicContactInfo | null;
  className?: string;
};

type ContactCardItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  href?: string;
  tone?: "default" | "emergency";
};

/**
 * Address / phone / email / emergency cards from Clinic Settings.
 */
export function ContactInfoCards({
  contact,
  className,
}: ContactInfoCardsProps) {
  const cards: ContactCardItem[] = contact
    ? [
        {
          id: "address",
          label: "Address",
          icon: MapPin,
          value: contact.address,
          href: contact.googleMapsUrl ?? undefined,
        },
        {
          id: "phone",
          label: "Phone",
          icon: Phone,
          value: contact.phone,
          href: contact.phoneHref,
        },
        {
          id: "email",
          label: "Email",
          icon: Mail,
          value: contact.email,
          href: `mailto:${contact.email}`,
        },
        ...(contact.emergencyContact && contact.emergencyContactHref
          ? [
              {
                id: "emergency",
                label: "Emergency Contact",
                icon: PhoneCall,
                value: contact.emergencyContact,
                href: contact.emergencyContactHref,
                tone: "emergency" as const,
              },
            ]
          : [
              {
                id: "emergency",
                label: "Emergency Contact",
                icon: PhoneCall,
                value: "Available on request during clinic hours",
                tone: "emergency" as const,
              },
            ]),
      ]
    : [
        {
          id: "address",
          label: "Address",
          icon: MapPin,
          value: "Clinic address will appear once settings are configured.",
        },
        {
          id: "phone",
          label: "Phone",
          icon: Phone,
          value: "Phone number coming soon",
        },
        {
          id: "email",
          label: "Email",
          icon: Mail,
          value: "Email coming soon",
        },
        {
          id: "emergency",
          label: "Emergency Contact",
          icon: PhoneCall,
          value: "Emergency contact coming soon",
          tone: "emergency" as const,
        },
      ];

  return (
    <section
      id="contact-details"
      aria-labelledby="contact-details-heading"
      className={cn(
        "relative overflow-hidden bg-white font-montserrat",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/4 -left-24 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_10%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <header className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center sm:mb-12">
          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.2em]"
            )}
          >
            {CONTACT_PAGE.cardsEyebrow}
          </p>
          <h2
            id="contact-details-heading"
            className={cn(
              "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
              "sm:mt-5 sm:text-4xl"
            )}
          >
            {CONTACT_PAGE.cardsHeading}
          </h2>
          <div className="mt-4 h-1 w-12 rounded-full bg-brand-red" aria-hidden />
        </header>

        <ul
          className={cn(
            "grid list-none grid-cols-1 gap-4",
            "sm:grid-cols-2 sm:gap-5",
            "lg:grid-cols-4 lg:gap-6"
          )}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            const isEmergency = card.tone === "emergency";
            const content = (
              <>
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full",
                    isEmergency ? "bg-brand-teal/12" : "bg-brand-blue/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      isEmergency ? "text-brand-teal" : "text-brand-blue"
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
                <span className="mt-4 block text-[0.6875rem] font-bold tracking-[0.14em] text-brand-muted uppercase">
                  {card.label}
                </span>
                <span
                  className={cn(
                    "mt-2 block text-sm leading-relaxed font-medium text-brand-dark",
                    "sm:text-[0.9375rem]",
                    isEmergency && "text-brand-teal"
                  )}
                >
                  {card.value}
                </span>
              </>
            );

            const classNameCard = cn(
              "flex h-full flex-col rounded-2xl border border-brand-blue/10 bg-brand-surface",
              "px-5 py-6 transition-shadow duration-300",
              "hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--brand-blue)_10%,transparent)]",
              isEmergency && "border-brand-teal/20 bg-brand-teal/[0.04]"
            );

            return (
              <li key={card.id}>
                {card.href ? (
                  <a
                    href={card.href}
                    target={card.id === "address" ? "_blank" : undefined}
                    rel={
                      card.id === "address" ? "noopener noreferrer" : undefined
                    }
                    className={cn(
                      classNameCard,
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
                    )}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={classNameCard}>{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </section>
  );
}
