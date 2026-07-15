import { SignUp } from "@clerk/nextjs";

import { ROUTES } from "@/constants/routes";

export default function SignUpPage() {
  return (
    <SignUp
      path={ROUTES.SIGN_UP}
      routing="path"
      signInUrl={ROUTES.SIGN_IN}
      fallbackRedirectUrl={ROUTES.HOME}
    />
  );
}
