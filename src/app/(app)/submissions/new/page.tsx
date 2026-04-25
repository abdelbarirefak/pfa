import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SubmissionWizard } from '@/features/submissions/submission-wizard';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = { title: 'New Paper Submission' };

export default function NewSubmissionPage() {
  return (
    <div>
      <PageHeader
        title="New Paper Submission"
        subtitle="Follow the steps below to submit your research paper."
        className="mb-6 max-w-3xl mx-auto"
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        }
      >
        <SubmissionWizard />
      </Suspense>
    </div>
  );
}
