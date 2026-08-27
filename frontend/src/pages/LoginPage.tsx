import { SignIn } from '@clerk/clerk-react';
import LoginForm from '../components/auth/LoginForm';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default function LoginPage() {
  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex w-full justify-center">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          fallbackRedirectUrl="/"
        />
      </div>
    );
  }

  return <LoginForm />;
}
