import { RegisterCard } from "@/app/(auth)/register/register-card";
import { AuthModal } from "@/components/auth/auth-modal";

export default function RegisterInterceptPage() {
  return (
    <AuthModal>
      <RegisterCard />
    </AuthModal>
  );
}
