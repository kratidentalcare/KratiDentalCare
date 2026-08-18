/**
 * Shared Clerk UI appearance aligned with the public marketing brand.
 * Used by ClerkProvider, SignIn / SignUp, UserProfile, and auth modals.
 */
const BRAND = {
  blue: "#2957a4",
  hover: "#214890",
  navy: "#1a3266",
  muted: "#5a6a7c",
  surface: "#f6f8fc",
  border: "#e2e8f0",
  danger: "#ec3237",
  white: "#ffffff",
} as const;

const layout = {
  logoImageUrl: "/images/logo-navbar.png",
  logoPlacement: "inside" as const,
  socialButtonsPlacement: "top" as const,
  socialButtonsVariant: "blockButton" as const,
  termsPageUrl: "/terms",
  privacyPageUrl: "/privacy",
  shimmer: false,
};

export const clerkAppearance = {
  layout,
  options: layout,
  variables: {
    colorPrimary: BRAND.blue,
    colorText: BRAND.navy,
    colorTextSecondary: BRAND.muted,
    colorBackground: BRAND.white,
    colorInputBackground: BRAND.white,
    colorInputText: BRAND.navy,
    colorNeutral: BRAND.navy,
    colorDanger: BRAND.danger,
    colorSuccess: BRAND.blue,
    colorWarning: BRAND.hover,
    colorModalBackdrop: "rgba(26, 50, 102, 0.22)",
    borderRadius: "1rem",
    fontFamily: "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: "mx-auto w-full",
    modalBackdrop: "clerk-modal-backdrop",
    modalContent: "clerk-modal-content",
    cardBox: "clerk-card-box",
    card: "clerk-card font-montserrat",
    modalCloseButton:
      "clerk-modal-close-button focus-visible:ring-2 focus-visible:ring-[#2957a4]/40",
    logoBox: "mb-1 flex justify-center",
    logoImage: "h-9 w-auto max-w-[11.5rem] object-contain sm:h-10",
    header: "mt-1 gap-1 text-center",
    headerTitle:
      "font-montserrat text-xl font-semibold tracking-tight text-[#1a3266]",
    headerSubtitle: "font-montserrat text-sm leading-relaxed text-[#5a6a7c]",
    socialButtons: "gap-2.5",
    socialButtonsBlockButton:
      "min-h-11 rounded-xl border border-[#E2E8F0] bg-white font-montserrat font-medium text-[#1a3266] shadow-none hover:bg-[#F6F8FC]",
    socialButtonsBlockButtonText: "font-montserrat text-sm font-medium",
    dividerRow: "my-1",
    dividerLine: "bg-[#E2E8F0]",
    dividerText: "font-montserrat text-xs font-medium tracking-wide text-[#5a6a7c] uppercase",
    form: "gap-4",
    formFieldLabel: "font-montserrat text-sm font-medium text-[#1a3266]",
    formFieldInput:
      "min-h-11 rounded-xl border-[#E2E8F0] font-montserrat text-base text-[#1a3266] shadow-none focus:border-[#2957a4] focus:ring-[#2957a4]/25",
    formFieldInputShowPasswordButton: "text-[#5a6a7c] hover:text-[#1a3266]",
    formButtonPrimary:
      "mt-1 min-h-11 rounded-xl bg-[#2957a4] font-montserrat font-semibold text-white shadow-none hover:bg-[#214890]",
    footer: "clerk-auth-footer bg-transparent shadow-none",
    footerAction: "clerk-auth-footer-action",
    footerActionText: "font-montserrat text-sm text-[#5a6a7c]",
    footerActionLink:
      "rounded-md px-1 py-1 font-semibold text-[#2957a4] hover:text-[#214890] focus-visible:ring-2 focus-visible:ring-[#2957a4]/40",
    footerPages: "hidden",
    identityPreview:
      "rounded-xl border border-[#E2E8F0] bg-[#F6F8FC] font-montserrat",
    identityPreviewText: "font-montserrat text-sm text-[#1a3266]",
    identityPreviewEditButton: "text-[#2957a4] hover:text-[#214890]",
    formFieldSuccessText: "font-montserrat text-sm text-[#2957a4]",
    formFieldErrorText: "font-montserrat text-sm text-[#ec3237]",
    alert: "rounded-xl font-montserrat",
    otpCodeFieldInput:
      "h-11 w-10 rounded-xl border-[#E2E8F0] text-base text-[#1a3266] focus:border-[#2957a4] focus:ring-[#2957a4]/25",
    userButtonAvatarBox: "size-9 sm:size-10",
    userButtonPopoverCard:
      "clerk-user-popover rounded-xl border border-[#E2E8F0] font-montserrat shadow-[0_8px_30px_rgba(26,50,102,0.1)]",
    userButtonPopoverActionButton:
      "min-h-11 font-montserrat text-[#1a3266] hover:bg-[#F6F8FC]",
    userButtonPopoverActionButtonText: "font-montserrat",
    userButtonPopoverFooter: "hidden",
  },
};
