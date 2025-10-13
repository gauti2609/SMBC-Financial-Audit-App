import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelectedCompany } from '~/stores/companyStore';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ComputerDesktopIcon,
  UserIcon,
  CheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export const Route = createFileRoute("/notes-selection/")({
  component: NotesSelection,
});

type NoteSelection = {
  id: string;
  noteRef: string;
  description: string;
  systemRecommended: boolean;
  userSelected: boolean;
  autoNumber?: string;
  linkedMajorHead?: string;
};

function NotesSelection() {
  const trpc = useTRPC();
  const { selectedCompanyId } = useSelectedCompany();
  const [selections, setSelections] = useState<NoteSelection[]>([]);
  const [editingNote, setEditingNote] = useState<NoteSelection | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const noteSchema = z.object({
    noteRef: z.string().min(1, 'Note reference is required'),
    description: z.string().min(1, 'Description is required'),
    linkedMajorHead: z.string().optional(),
  });

  type NoteFormData = z.infer<typeof noteSchema>;

  // Fetch data
  const noteSelectionsQuery = useQuery(
    selectedCompanyId 
      ? trpc.getNoteSelections.queryOptions({ companyId: selectedCompanyId })
      : { enabled: false }
  );
  
  // Fetch major heads for dropdown
  const majorHeadsQuery = useQuery(trpc.getMajorHeads.queryOptions());

  // Update mutation
  const updateMutation = useMutation({
    ...trpc.updateNoteSelections.mutationOptions(),
    onSuccess: () => {
      toast.success('Note selections saved successfully!');
      noteSelectionsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to save selections: ' + error.message);
    },
  });

  // Auto-numbering mutation
  const autoNumberMutation = useMutation({
    ...trpc.updateNoteNumbers.mutationOptions(),
    onSuccess: () => {
      toast.success('Note numbers updated successfully!');
      noteSelectionsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to update note numbers: ' + error.message);
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    ...trpc.addNoteSelection.mutationOptions(),
    onSuccess: () => {
      toast.success('Note added successfully!');
      noteSelectionsQuery.refetch();
      setShowAddForm(false);
      resetAddForm();
    },
    onError: (error) => {
      toast.error('Failed to add note: ' + error.message);
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    ...trpc.updateNoteSelection.mutationOptions(),
    onSuccess: () => {
      toast.success('Note updated successfully!');
      noteSelectionsQuery.refetch();
      setEditingNote(null);
    },
    onError: (error) => {
      toast.error('Failed to update note: ' + error.message);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    ...trpc.deleteNoteSelection.mutationOptions(),
    onSuccess: () => {
      toast.success('Note deleted successfully!');
      noteSelectionsQuery.refetch();
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    },
  });

  // Form for adding new notes
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  // Form for editing notes
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
  });

  // Load data into state
  useEffect(() => {
    if (noteSelectionsQuery.data) {
      setSelections(noteSelectionsQuery.data.map(note => ({ ...note, userSelected: note.finalSelected })));
    }
  }, [noteSelectionsQuery.data]);

  // Load editing data
  useEffect(() => {
    if (editingNote) {
      resetEditForm({
        noteRef: editingNote.noteRef,
        description: editingNote.description,
        linkedMajorHead: editingNote.linkedMajorHead || '',
      });
    }
  }, [editingNote, resetEditForm]);

  const handleToggle = (noteRef: string) => {
    setSelections(
      selections.map((note) =>
        note.noteRef === noteRef ? { ...note, userSelected: !note.userSelected } : note
      )
    );
  };

  const handleSave = () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    const updatedSelections = selections.map(({ noteRef, userSelected }) => ({
      noteRef,
      userSelected,
    }));
    updateMutation.mutate({ companyId: selectedCompanyId, selections: updatedSelections });
  };

  const handleAutoNumber = () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    autoNumberMutation.mutate({ companyId: selectedCompanyId });
  };

  const handleAddNote = async (data: NoteFormData) => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    await addNoteMutation.mutateAsync({ companyId: selectedCompanyId, ...data });
  };

  const handleUpdateNote = async (data: NoteFormData) => {
    if (!editingNote) return;
    await updateNoteMutation.mutateAsync({
      id: editingNote.id,
      ...data,
    });
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNoteMutation.mutateAsync({ id });
    }
  };

  const selectedCount = selections.filter(note => note.userSelected).length;
  const systemRecommendedCount = selections.filter(note => note.systemRecommended).length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Bookman Old Style, serif' }}>
                  Notes to Accounts Selection
                </h1>
                <p className="text-gray-600 mt-2">
                  Select the notes to be included in the financial statements
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Note</span>
              </button>
              <button
                onClick={handleAutoNumber}
                disabled={autoNumberMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{autoNumberMutation.isPending ? 'Numbering...' : 'Auto Number'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <CheckIcon className="h-5 w-5" />
                <span>{updateMutation.isPending ? 'Saving...' : 'Save Selections'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{selections.length}</p>
                <p className="text-sm text-gray-600">Total Notes Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <ComputerDesktopIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{systemRecommendedCount}</p>
                <p className="text-sm text-gray-600">System Recommended</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{selectedCount}</p>
                <p className="text-sm text-gray-600">User Selected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Note</h3>
            <form onSubmit={handleSubmitAdd(handleAddNote)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note Reference *
                  </label>
                  <input
                    {...registerAdd('noteRef')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., A.2.17"
                  />
                  {addErrors.noteRef && (
                    <p className="text-red-500 text-sm mt-1">{addErrors.noteRef.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Major Head
                  </label>
                  <select
                    {...registerAdd('linkedMajorHead')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select major head (optional)</option>
                    {majorHeadsQuery.data?.map((head) => (
                      <option key={head.id} value={head.name}>
                        {head.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...registerAdd('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter note description"
                  />
                  {addErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{addErrors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetAddForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addNoteMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Select Notes for Inclusion</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note Ref
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Number
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Rec.
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Selection
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selections.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {note.noteRef}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                      {note.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        note.autoNumber 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {note.autoNumber || '--'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {note.systemRecommended ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mx-auto" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggle(note.noteRef)}
                        className={`p-1 rounded-full transition-colors ${
                          note.userSelected
                            ? 'bg-indigo-600 hover:bg-indigo-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform ${
                          note.userSelected ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setEditingNote(note)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit note"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {!note.systemRecommended && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete note"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Note Modal */}
        {editingNote && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Note</h3>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitEdit(handleUpdateNote)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note Reference *
                      </label>
                      <input
                        {...registerEdit('noteRef')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={editingNote.systemRecommended}
                      />
                      {editErrors.noteRef && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.noteRef.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Linked Major Head
                      </label>
                      <select
                        {...registerEdit('linkedMajorHead')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select major head (optional)</option>
                        {majorHeadsQuery.data?.map((head) => (
                          <option key={head.id} value={head.name}>
                            {head.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        {...registerEdit('description')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {editErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.description.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateNoteMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {updateNoteMutation.isPending ? 'Updating...' : 'Update Note'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
