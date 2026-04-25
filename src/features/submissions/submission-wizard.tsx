'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Stepper } from '@/components/ui/stepper';
import { StepTrackDetails, type TrackDetailsData } from './step-track-details';
import { StepManageAuthors, type AuthorEntry } from './step-manage-authors';
import { StepFileUpload } from './step-file-upload';
import { StepReviewSubmit } from './step-review-submit';
import { submissionsApi } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { Loader2, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Conference, Track } from '@/types';

// ── Wizard Steps Configuration ────────────────────────────────────────────────

const WIZARD_STEPS = [
  { id: 1, label: 'Track & Details', description: 'Paper information' },
  { id: 2, label: 'Authors', description: 'Co-author management' },
  { id: 3, label: 'Manuscript', description: 'File upload' },
  { id: 4, label: 'Review & Submit', description: 'Final confirmation' },
];

// ── Wizard State ──────────────────────────────────────────────────────────────

interface WizardState {
  trackDetails: TrackDetailsData | null;
  authors: AuthorEntry[];
  manuscriptFile: File | null;
  // Draft submission ID returned by API after step 1
  submissionId: string | null;
}

export function SubmissionWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedConferenceId = searchParams.get('conferenceId') ?? undefined;

  // Current step (1-indexed)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Cached API data for review step display
  const [cachedConference, setCachedConference] = useState<Conference | undefined>();
  const [cachedTrack, setCachedTrack] = useState<Track | undefined>();

  // State for the form trigger from parent (step 1 uses its own form)
  const [triggerStep1Submit, setTriggerStep1Submit] = useState(false);

  // Wizard data
  const [state, setState] = useState<WizardState>(() => {
    const me = getStoredUser();
    const initialAuthor: AuthorEntry | null = me
      ? {
          userId: me.id,
          firstName: me.firstName,
          lastName: me.lastName,
          email: me.email,
          academicAffiliation: me.academicAffiliation,
          authorSequenceOrder: 1,
          isCorrespondingAuthor: true,
        }
      : null;

    return {
      trackDetails: null,
      authors: initialAuthor ? [initialAuthor] : [],
      manuscriptFile: null,
      submissionId: null,
    };
  });

  // ── Navigation helpers ──────────────────────────────────────────────────────

  function goToStep(step: number) {
    setCurrentStep(Math.max(1, Math.min(step, WIZARD_STEPS.length)));
  }

  function handleEditStep(step: number) {
    goToStep(step);
  }

  // ── Step 1: Track Details saved (creates draft via API) ───────────────────

  const handleStep1Next = useCallback(
    async (data: TrackDetailsData) => {
      setState((prev) => ({ ...prev, trackDetails: data }));
      setIsSavingDraft(true);
      try {
        // Create (or update) the draft submission
        let submission;
        if (state.submissionId) {
          submission = await submissionsApi.update(state.submissionId, {
            title: data.title,
            abstract: data.abstract,
          });
        } else {
          submission = await submissionsApi.create({
            conferenceId: data.conferenceId,
            trackId: data.trackId,
            title: data.title,
            abstract: data.abstract,
          });
        }
        setState((prev) => ({ ...prev, submissionId: submission.id, trackDetails: data }));
        toast.success('Draft saved successfully.');
        goToStep(2);
      } catch (err: unknown) {
        const message =
          (err as { message?: string })?.message ?? 'Failed to save draft.';
        toast.error(message);
      } finally {
        setIsSavingDraft(false);
      }
    },
    [state.submissionId]
  );

  // ── Step 2: Authors saved ──────────────────────────────────────────────────

  async function handleStep2Next() {
    if (!state.submissionId) {
      toast.error('No submission ID found. Please complete Step 1 first.');
      return;
    }
    if (state.authors.length === 0) {
      toast.error('At least one author is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submissionsApi.updateAuthors(state.submissionId, {
        authorships: state.authors.map((a) => ({
          userId: a.userId,
          authorSequenceOrder: a.authorSequenceOrder,
          isCorrespondingAuthor: a.isCorrespondingAuthor,
        })),
      });
      toast.success('Authors saved.');
      goToStep(3);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Failed to save authors.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Step 3: File uploaded ──────────────────────────────────────────────────

  async function handleStep3Next() {
    if (!state.submissionId) {
      toast.error('No submission ID found.');
      return;
    }
    if (!state.manuscriptFile) {
      toast.error('Please upload your manuscript before continuing.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submissionsApi.uploadManuscript(state.submissionId, state.manuscriptFile);
      toast.success('Manuscript uploaded.');
      goToStep(4);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Upload failed.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Step 4: Final Submit ───────────────────────────────────────────────────

  async function handleFinalSubmit() {
    if (!state.submissionId) {
      toast.error('No submission ID found.');
      return;
    }
    if (!state.manuscriptFile) {
      toast.error('A manuscript file is required to submit.');
      return;
    }
    setIsSubmitting(true);
    try {
      await submissionsApi.update(state.submissionId, { status: 'SUBMITTED' });
      toast.success('🎉 Paper submitted successfully! The PC Chairs have been notified.');
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Submission failed.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Next button handler (dispatches to correct step handler) ──────────────

  function handleNext() {
    if (currentStep === 1) {
      // Trigger the form inside StepTrackDetails
      const form = document.getElementById('step1-form') as HTMLFormElement | null;
      form?.requestSubmit();
      return;
    }
    if (currentStep === 2) { handleStep2Next(); return; }
    if (currentStep === 3) { handleStep3Next(); return; }
    if (currentStep === 4) { handleFinalSubmit(); return; }
  }

  const canGoBack = currentStep > 1;
  const isLastStep = currentStep === WIZARD_STEPS.length;
  const isWorking = isSubmitting || isSavingDraft;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="bg-white border border-slate-200 rounded p-6 mb-6">
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="bg-white border border-slate-200 rounded p-6 mb-4">
        <h2 className="text-base font-semibold text-[#0F1B2D] mb-1">
          {WIZARD_STEPS[currentStep - 1].label}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          {currentStep === 1 && 'Select the target conference and track, then enter your paper details.'}
          {currentStep === 2 && 'Add co-authors and drag to set the correct author order.'}
          {currentStep === 3 && 'Upload your manuscript as a PDF (max 20 MB).'}
          {currentStep === 4 && 'Review all details and submit your paper.'}
        </p>

        {currentStep === 1 && (
          <StepTrackDetails
            initial={state.trackDetails ?? undefined}
            onNext={handleStep1Next}
            preselectedConferenceId={preselectedConferenceId}
          />
        )}

        {currentStep === 2 && (
          <StepManageAuthors
            authors={state.authors}
            onChange={(authors) => setState((prev) => ({ ...prev, authors }))}
          />
        )}

        {currentStep === 3 && (
          <StepFileUpload
            currentFile={state.manuscriptFile}
            onChange={(file) => setState((prev) => ({ ...prev, manuscriptFile: file }))}
          />
        )}

        {currentStep === 4 && state.trackDetails && (
          <StepReviewSubmit
            trackDetails={state.trackDetails}
            authors={state.authors}
            manuscriptFile={state.manuscriptFile}
            conference={cachedConference}
            track={cachedTrack}
            onEdit={handleEditStep}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          disabled={!canGoBack || isWorking}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-3">
          {/* Step indicator */}
          <span className="text-xs text-slate-400">
            Step {currentStep} of {WIZARD_STEPS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isWorking}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWorking && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLastStep ? (
              <>
                <Send className="w-4 h-4" />
                Submit Paper
              </>
            ) : (
              <>
                {isSavingDraft ? 'Saving…' : 'Save & Continue'}
                {!isSavingDraft && <ChevronRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
