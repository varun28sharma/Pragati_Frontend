import { LoginCard } from '../components/LoginCard';

export default function GovernmentLoginPage() {
  return (
    <LoginCard
      role="GOVERNMENT"
      title="Government sign in"
      subtitle="View district-wide reports and scheme analytics."
      redirectPath="/government"
    />
  );
}
