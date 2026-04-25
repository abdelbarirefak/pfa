import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // right-side slot for action buttons
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 mb-6',
        className
      )}
    >
      <div>
        <h1 className="text-xl font-semibold text-navy-900 text-[#0F1B2D]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex-shrink-0 flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
