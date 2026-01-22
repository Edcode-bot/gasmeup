import { AuthGuard } from '@/components/auth-guard';
import { ProfileCheck } from '@/components/profile-check';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ProfileCheck>{children}</ProfileCheck>
    </AuthGuard>
  );
}

