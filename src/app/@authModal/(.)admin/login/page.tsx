import { redirect } from 'next/navigation';

export default function AdminLoginInterceptPage() {
  redirect('/api/logto/sign-in');
}
