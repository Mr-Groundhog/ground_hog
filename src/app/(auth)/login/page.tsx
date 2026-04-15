import { LoginCard } from "./login-card";
import { AuthModal } from "@/components/auth/auth-modal";

export default function LoginPage() {
  return (
    <AuthModal>
      <LoginCard />
    </AuthModal>
  );
}
