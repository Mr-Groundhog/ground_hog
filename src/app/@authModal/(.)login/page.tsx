import { redirect } from 'next/navigation';

export default function LoginInterceptPage() {
  redirect('/api/logto/sign-in');
}
