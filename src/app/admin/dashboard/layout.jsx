import { redirect } from 'next/navigation';

export default function AdminDashboardLayout() {
  // Keep legacy admin as the single source of truth for full menu functionality.
  redirect('/');
}
