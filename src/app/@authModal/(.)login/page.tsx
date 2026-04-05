import { LoginCard } from "@/app/(auth)/login/login-card";
import { AuthModal } from "@/components/auth/auth-modal";

export default function LoginInterceptPage() {
  return (
    <AuthModal>
      <LoginCard />
    </AuthModal>
  );
}
