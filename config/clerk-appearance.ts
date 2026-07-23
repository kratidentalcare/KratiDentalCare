/**
 * Shared Clerk UI appearance aligned with the public marketing brand.
 * Used by ClerkProvider, SignIn / SignUp, and UserButton.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#0B8EC8",
    colorText: "#0A1F44",
    colorTextSecondary: "#5A6A7C",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0A1F44",
    colorDanger: "#DC2626",
    colorModalBackdrop: "rgba(10, 31, 68, 0.48)",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full",
    modalBackdrop: "clerk-modal-backdrop",
    modalContent: "clerk-modal-content",
    cardBox: "clerk-card-box",
    card: "clerk-card rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_8px_30px_rgba(10,31,68,0.08)]",
    modalCloseButton:
      "clerk-modal-close-button focus-visible:ring-2 focus-visible:ring-[#0B8EC8]/40",
    headerTitle: "font-montserrat text-[#0A1F44]",
    headerSubtitle: "font-montserrat text-[#5A6A7C]",
    socialButtonsBlockButton:
      "min-h-11 rounded-xl border-[#E2E8F0] font-montserrat text-[#0A1F44] hover:bg-[#F7FAFC]",
    formButtonPrimary:
      "min-h-11 rounded-xl bg-[#0B8EC8] font-montserrat font-semibold shadow-none hover:bg-[#0978AB]",
    formFieldInput:
      "min-h-11 rounded-xl border-[#E2E8F0] font-montserrat text-base focus:border-[#0B8EC8] focus:ring-[#0B8EC8]/30",
    footer: "clerk-auth-footer",
    footerAction: "clerk-auth-footer-action",
    footerActionText: "font-montserrat text-[#5A6A7C]",
    footerActionLink:
      "rounded-md px-1 py-2 font-semibold text-[#0B8EC8] hover:text-[#0978AB] focus-visible:ring-2 focus-visible:ring-[#0B8EC8]/40",
    identityPreviewEditButton: "text-[#0B8EC8]",
    userButtonAvatarBox: "size-9 sm:size-10",
    userButtonPopoverCard:
      "clerk-user-popover rounded-xl border border-[#E2E8F0] font-montserrat shadow-[0_8px_30px_rgba(10,31,68,0.1)]",
    userButtonPopoverActionButton:
      "min-h-11 font-montserrat text-[#0A1F44] hover:bg-[#F7FAFC]",
    userButtonPopoverActionButtonText: "font-montserrat",
    userButtonPopoverFooter: "hidden",
  },
};
