import { logoutAction, getSession } from '@/lib/actions/auth-actions';
import { redirect } from 'next/navigation';
import DashboardContent from '../DashboardContent';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;

  return (
    <DashboardContent user={user} />
  );
}
