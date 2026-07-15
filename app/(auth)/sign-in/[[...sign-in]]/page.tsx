import { SignIn } from "@clerk/nextjs";

import { ROUTES } from "@/constants/routes";

export default function SignInPage() {
  return (
    <SignIn
      path={ROUTES.SIGN_IN}
      routing="path"
      signUpUrl={ROUTES.SIGN_UP}
      fallbackRedirectUrl={ROUTES.HOME}
    />
  );
}
