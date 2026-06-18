import { redirect } from 'next/navigation';

export default function AdminLoginPage() {
  redirect('/api/logto/sign-in');
}
