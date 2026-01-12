import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const isLoggedIn = Boolean((await cookies()).get('auth')?.value);
  redirect(isLoggedIn ? '/dashboard' : '/signin');
}
