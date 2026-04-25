import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/login-form';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#0F1B2D]">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to access your submissions and reviews.
        </p>
      </div>
      <LoginForm />
    </>
  );
}
