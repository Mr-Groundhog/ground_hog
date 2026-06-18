import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AdminLayoutClient } from './components/admin-layout-client';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/api/logto/sign-in');
  }

  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}
