import { SignUp } from '@clerk/clerk-react';
import RegisterForm from '../components/auth/RegisterForm';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export default function RegisterPage() {
  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex w-full justify-center">
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          fallbackRedirectUrl="/"
        />
      </div>
    );
  }

  return <RegisterForm />;
}
