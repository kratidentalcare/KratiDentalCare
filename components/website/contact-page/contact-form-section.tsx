"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-field";
import { PageContainer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessageAction } from "@/features/contact/actions";
import { cn } from "@/lib/utils";
import {
  contactMessageFormSchema,
  type ContactMessageFormValues,
} from "@/validators/contact-message";

import { CONTACT_PAGE } from "./contact-page-data";

export type ContactFormSectionProps = {
  className?: string;
};

/**
 * Public contact form — Zod + RHF validation, persists via Server Action.
 */
export function ContactFormSection({ className }: ContactFormSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactMessageFormValues>({
    resolver: zodResolver(contactMessageFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await submitContactMessageAction(values);

      if (!result.success) {
        const details = result.error.details;
        if (details?.length) {
          for (const detail of details) {
            const field = detail.field as keyof ContactMessageFormValues;
            if (field in form.getValues()) {
              form.setError(field, { message: detail.message });
            }
          }
        }
        toast.error(result.error.message || "Unable to send your message");
        return;
      }

      form.reset();
      setSubmitted(true);
      toast.success("Message sent — we'll get back to you soon.");
    });
  });

  return (
    <section
      id="contact-form"
      aria-labelledby="contact-form-heading"
      className={cn("relative overflow-hidden bg-white font-montserrat", className)}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-20 bottom-0 size-64 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-teal)_10%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-80"
        )}
        aria-hidden
      />

      <PageContainer size="xl" className="relative public-section-y">
        <div
          className={cn(
            "mx-auto grid max-w-5xl grid-cols-1 gap-10",
            "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:items-start"
          )}
        >
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left lg:pt-4">
            <p
              className={cn(
                "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
                "sm:text-xs sm:tracking-[0.2em]"
              )}
            >
              {CONTACT_PAGE.formEyebrow}
            </p>
            <h2
              id="contact-form-heading"
              className={cn(
                "mt-4 font-serif text-3xl font-medium leading-[1.12] tracking-tight text-brand-dark",
                "sm:mt-5 sm:text-4xl"
              )}
            >
              {CONTACT_PAGE.formHeading}
            </h2>
            <div className="mt-4 h-1 w-12 rounded-full bg-brand-red" aria-hidden />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
              {CONTACT_PAGE.formDescription}
            </p>
          </header>

          <div
            className={cn(
              "rounded-3xl border border-brand-blue/10 bg-brand-surface p-6",
              "shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-blue)_6%,transparent)]",
              "sm:p-8"
            )}
          >
            {submitted ? (
              <div
                className="flex flex-col items-center py-10 text-center"
                role="status"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-brand-teal/12">
                  <CheckCircle2
                    className="size-7 text-brand-teal"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
                <h3 className="mt-5 font-serif text-2xl font-medium text-brand-dark">
                  Thank you
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-muted">
                  Your message has been received. Our team will respond during
                  clinic hours.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 rounded-full"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    id="contact-name"
                    label="Name"
                    required
                    error={form.formState.errors.name?.message}
                  >
                    <Input
                      {...form.register("name")}
                      autoComplete="name"
                      placeholder="Your full name"
                      className="bg-white"
                    />
                  </FormField>

                  <FormField
                    id="contact-email"
                    label="Email"
                    required
                    error={form.formState.errors.email?.message}
                  >
                    <Input
                      {...form.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="bg-white"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    id="contact-phone"
                    label="Phone"
                    required
                    error={form.formState.errors.phone?.message}
                  >
                    <Input
                      {...form.register("phone")}
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 …"
                      className="bg-white"
                    />
                  </FormField>

                  <FormField
                    id="contact-subject"
                    label="Subject"
                    required
                    error={form.formState.errors.subject?.message}
                  >
                    <Input
                      {...form.register("subject")}
                      placeholder="How can we help?"
                      className="bg-white"
                    />
                  </FormField>
                </div>

                <FormField
                  id="contact-message"
                  label="Message"
                  required
                  error={form.formState.errors.message?.message}
                >
                  <Textarea
                    {...form.register("message")}
                    rows={5}
                    placeholder="Tell us a little about your question or concern…"
                    className="min-h-32 bg-white"
                  />
                </FormField>

                <Button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "h-12 w-full rounded-full bg-brand-blue text-base font-semibold text-white",
                    "hover:bg-brand-hover",
                    "sm:w-auto sm:min-w-48"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" aria-hidden />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
