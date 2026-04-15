import AdminLoginPage from "@/app/admin/login/page";
import { AuthModal } from "@/components/auth/auth-modal";

export default function AdminLoginInterceptPage() {
  return (
    <AuthModal>
      <AdminLoginPage />
    </AuthModal>
  );
}

