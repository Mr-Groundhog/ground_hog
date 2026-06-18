import { redirect } from 'next/navigation';

export default function RegisterInterceptPage() {
  redirect('/api/logto/sign-in');
}
