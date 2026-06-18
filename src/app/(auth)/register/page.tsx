import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/api/logto/sign-in');
}
