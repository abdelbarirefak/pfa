'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usersApi } from '@/lib/api';
import { cn, getInitials } from '@/lib/utils';
import type { User, Authorship } from '@/types';
import {
  Search,
  Loader2,
  GripVertical,
  UserPlus,
  X,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

export interface AuthorEntry {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  academicAffiliation: string;
  authorSequenceOrder: number;
  isCorrespondingAuthor: boolean;
}

interface StepManageAuthorsProps {
  authors: AuthorEntry[];
  onChange: (authors: AuthorEntry[]) => void;
}

export function StepManageAuthors({ authors, onChange }: StepManageAuthorsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // ── Search users ───────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearchError('');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const users = await usersApi.search(q);
      setSearchResults(users);
      if (users.length === 0) {
        setSearchError('No users found with that email address.');
      }
    } catch {
      setSearchError('Failed to search authors. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce: fire search 400 ms after the user stops typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, handleSearch]);

  // ── Add author ─────────────────────────────────────────────────────────────

  function addAuthor(user: User) {
    if (authors.some((a) => a.userId === user.id)) {
      toast.info(`${user.firstName} ${user.lastName} is already in the list.`);
      return;
    }
    const newEntry: AuthorEntry = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      academicAffiliation: user.academicAffiliation,
      authorSequenceOrder: authors.length + 1,
      isCorrespondingAuthor: false,
    };
    onChange([...authors, newEntry]);
    setSearchResults([]);
    setSearchQuery('');
    toast.success(`${user.firstName} ${user.lastName} added as co-author.`);
  }

  // ── Remove author ──────────────────────────────────────────────────────────

  function removeAuthor(userId: string) {
    const updated = authors
      .filter((a) => a.userId !== userId)
      .map((a, idx) => ({ ...a, authorSequenceOrder: idx + 1 }));
    onChange(updated);
  }

  // ── Set corresponding author ───────────────────────────────────────────────

  function setCorresponding(userId: string) {
    onChange(
      authors.map((a) => ({
        ...a,
        isCorrespondingAuthor: a.userId === userId,
      }))
    );
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = Array.from(authors);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // First author (index 0) must stay as corresponding if they were
    onChange(reordered.map((a, idx) => ({ ...a, authorSequenceOrder: idx + 1 })));
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Search Co-Author by Email
        </label>
        <div className="flex gap-2">
          <input
            id="author-search"
            type="email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch(searchQuery))}
            placeholder="colleague@university.edu"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F1B2D] focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0F1B2D] hover:bg-[#1E3A5F] text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
        {searchError && (
          <p className="mt-1 text-xs text-red-500">{searchError}</p>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-slate-200 rounded divide-y divide-slate-100">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.email} · {user.academicAffiliation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => addAuthor(user)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#0F1B2D] text-[#0F1B2D] rounded hover:bg-[#0F1B2D] hover:text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Author List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">
            Author List ({authors.length})
          </label>
          <span className="text-xs text-slate-400">
            Drag to reorder · <Star className="w-3 h-3 inline text-[#B8860B]" /> = Corresponding Author
          </span>
        </div>

        {authors.length === 0 ? (
          <div className="flex items-center justify-center py-8 border border-dashed border-slate-300 rounded text-sm text-slate-400">
            No authors added yet. Search and add co-authors above.
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="authors">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="border border-slate-200 rounded divide-y divide-slate-100"
                >
                  {authors.map((author, index) => (
                    <Draggable
                      key={author.userId}
                      draggableId={author.userId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 transition-colors',
                            snapshot.isDragging
                              ? 'bg-blue-50 shadow-md'
                              : 'bg-white hover:bg-slate-50'
                          )}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Order number */}
                          <span className="flex-shrink-0 w-5 text-xs font-mono text-slate-400 text-center">
                            {author.authorSequenceOrder}
                          </span>

                          {/* Avatar */}
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#1E3A5F] text-xs font-semibold text-white">
                            {getInitials(author.firstName, author.lastName)}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {author.firstName} {author.lastName}
                              {author.isCorrespondingAuthor && (
                                <Star className="w-3 h-3 inline ml-1.5 text-[#B8860B] fill-[#B8860B]" />
                              )}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {author.email} · {author.academicAffiliation}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!author.isCorrespondingAuthor && (
                              <button
                                type="button"
                                onClick={() => setCorresponding(author.userId)}
                                title="Set as corresponding author"
                                className="p-1.5 rounded text-slate-400 hover:text-[#B8860B] hover:bg-amber-50 transition-colors"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => removeAuthor(author.userId)}
                                title="Remove author"
                                className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <p className="mt-1.5 text-xs text-slate-400">
          The submitting author (you) is locked as Author #1 and cannot be removed.
        </p>
      </div>
    </div>
  );
}
