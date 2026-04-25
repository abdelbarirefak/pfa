import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/register-form';

export const metadata: Metadata = { title: 'Create Account' };

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#0F1B2D]">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Join AcademicConf to submit papers and participate in conferences.
        </p>
      </div>
      <RegisterForm />
    </>
  );
}
