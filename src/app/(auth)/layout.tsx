import type { Metadata } from 'next';
import { GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded bg-[#0F1B2D]">
          <GraduationCap className="w-5 h-5 text-[#B8860B]" />
        </div>
        <span className="text-lg font-semibold text-[#0F1B2D] tracking-tight">
          AcademicConf
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded shadow-sm p-8">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-slate-400">
        © {new Date().getFullYear()} AcademicConf. All rights reserved.
      </p>
    </div>
  );
}
