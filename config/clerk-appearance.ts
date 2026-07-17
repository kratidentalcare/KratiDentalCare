/**
 * Shared Clerk UI appearance aligned with the public marketing brand.
 * Used by ClerkProvider, SignIn / SignUp, and UserButton.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#0A84C6",
    colorText: "#1F2937",
    colorTextSecondary: "#6B7280",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1F2937",
    colorDanger: "#DC2626",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-montserrat), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(31,41,55,0.08)]",
    headerTitle: "font-montserrat text-[#1F2937]",
    headerSubtitle: "font-montserrat text-[#6B7280]",
    socialButtonsBlockButton:
      "border-[#E5E7EB] font-montserrat text-[#1F2937] hover:bg-[#F8FBFD]",
    formButtonPrimary:
      "bg-[#0A84C6] font-montserrat font-semibold shadow-none hover:bg-[#0870A8]",
    formFieldInput:
      "rounded-xl border-[#E5E7EB] font-montserrat focus:border-[#0A84C6] focus:ring-[#0A84C6]/30",
    footerActionLink: "text-[#0A84C6] hover:text-[#0870A8]",
    identityPreviewEditButton: "text-[#0A84C6]",
    userButtonAvatarBox: "size-9 sm:size-10",
    userButtonPopoverCard:
      "rounded-xl border border-[#E5E7EB] font-montserrat shadow-[0_8px_30px_rgba(31,41,55,0.1)]",
    userButtonPopoverActionButton:
      "font-montserrat text-[#1F2937] hover:bg-[#F8FBFD]",
    userButtonPopoverActionButtonText: "font-montserrat",
    userButtonPopoverFooter: "hidden",
  },
};
