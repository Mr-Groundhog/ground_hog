import { RegisterCard } from "./register-card";
import { AuthModal } from "@/components/auth/auth-modal";

export default function RegisterPage() {
  return (
    <AuthModal>
      <RegisterCard />
    </AuthModal>
  );
}
