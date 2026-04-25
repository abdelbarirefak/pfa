'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  academicAffiliation: string;
  country?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        academicAffiliation: data.academicAffiliation,
        country: data.country,
      });
      toast.success('Account created! Please log in.');
      router.push('/login');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* First Name */}
        <div>
          <label htmlFor="reg-firstname" className="block text-sm font-medium text-slate-700 mb-1">
            First Name
          </label>
          <input
            id="reg-firstname"
            type="text"
            placeholder="Jane"
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
              errors.firstName ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('firstName', { required: 'Required.' })}
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="reg-lastname" className="block text-sm font-medium text-slate-700 mb-1">
            Last Name
          </label>
          <input
            id="reg-lastname"
            type="text"
            placeholder="Smith"
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
              errors.lastName ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('lastName', { required: 'Required.' })}
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
          Academic Email
        </label>
        <input
          id="reg-email"
          type="email"
          placeholder="j.smith@university.edu"
          className={cn(
            'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
            errors.email ? 'border-red-400' : 'border-slate-300'
          )}
          {...register('email', {
            required: 'Email is required.',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
          })}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Affiliation */}
      <div>
        <label htmlFor="reg-affiliation" className="block text-sm font-medium text-slate-700 mb-1">
          Academic Affiliation
        </label>
        <input
          id="reg-affiliation"
          type="text"
          placeholder="MIT — Department of Computer Science"
          className={cn(
            'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
            errors.academicAffiliation ? 'border-red-400' : 'border-slate-300'
          )}
          {...register('academicAffiliation', { required: 'Affiliation is required.' })}
        />
        {errors.academicAffiliation && (
          <p className="mt-1 text-xs text-red-500">{errors.academicAffiliation.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="reg-password"
            type="password"
            placeholder="••••••••"
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
              errors.password ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Minimum 8 characters.' },
            })}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password
          </label>
          <input
            id="reg-confirm"
            type="password"
            placeholder="••••••••"
            className={cn(
              'w-full px-3 py-2 text-sm border rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition',
              errors.confirmPassword ? 'border-red-400' : 'border-slate-300'
            )}
            {...register('confirmPassword', {
              required: 'Please confirm your password.',
              validate: (v) => v === password || 'Passwords do not match.',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0F1B2D] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
