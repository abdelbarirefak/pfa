'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';

export interface FileUploadData {
  file: File | null;
}

interface StepFileUploadProps {
  currentFile: File | null;
  existingFileUrl?: string;
  onChange: (file: File | null) => void;
}

const MAX_SIZE_MB = 20;
const ACCEPTED_TYPES = ['application/pdf'];

export function StepFileUpload({
  currentFile,
  existingFileUrl,
  onChange,
}: StepFileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only PDF files are accepted.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File exceeds the maximum size of ${MAX_SIZE_MB} MB.`;
    }
    return null;
  }

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const err = validateFile(file);
      if (err) {
        setError(err);
        onChange(null);
        return;
      }
      setError('');
      onChange(file);
    },
    [onChange]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function formatBytes(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-1">
          Manuscript Upload <span className="text-red-500">*</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Upload your paper in PDF format. Maximum file size: {MAX_SIZE_MB} MB.
          {existingFileUrl && !currentFile && (
            <span className="ml-1 text-emerald-600">
              A file is already uploaded — uploading a new one will replace it.
            </span>
          )}
        </p>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed rounded-sm transition-colors cursor-pointer',
            isDragOver
              ? 'border-[#0F1B2D] bg-blue-50'
              : currentFile
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
          )}
        >
          <input
            id="manuscript-upload"
            type="file"
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {currentFile ? (
            <div className="flex flex-col items-center gap-2 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700">
                {currentFile.name}
              </p>
              <p className="text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
                Remove and choose another
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 pointer-events-none">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-200">
                <Upload className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {isDragOver ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-xs text-slate-400">or click to browse files</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
      </div>

      {/* Existing file link */}
      {existingFileUrl && !currentFile && (
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded text-sm">
          <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-slate-500 text-xs">Current file:</span>
          <a
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0F1B2D] hover:underline truncate"
          >
            {existingFileUrl.split('/').pop()}
          </a>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded p-3">
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> Ensure your manuscript is anonymized for blind review. Remove
          author names and affiliations from the PDF document itself before uploading.
        </p>
      </div>
    </div>
  );
}
