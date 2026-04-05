import { RegisterCard } from "./register-card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <RegisterCard />
      </div>
    </div>
  );
}
