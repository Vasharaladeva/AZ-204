// Module 04 · Azure Cosmos DB — Notes CRUD page
import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';

function NoteCard({ note, onDelete, onEdit }) {
  return (
    <div className="card group hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-3">{note.body || 'No content'}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(note)} className="p-1.5 text-gray-400 hover:text-azure-600 rounded">✏️</button>
          <button onClick={() => onDelete(note.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">🗑</button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}

function NoteForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try { await onSave(title.trim(), body.trim()); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azure-500"
        required
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Note content…"
        rows={4}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-azure-500 resize-none"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : initial ? 'Update note' : 'Create note'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export default function NotesPage() {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function handleCreate(title, body) {
    await createNote(title, body);
    setShowForm(false);
  }

  async function handleUpdate(title, body) {
    await updateNote(editing.id, { title, body });
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notes</h1>
          <p className="text-sm text-gray-500">Module 04 · Stored in Azure Cosmos DB</p>
        </div>
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)} className="btn-primary">+ New note</button>
        )}
      </div>

      {showForm && (
        <NoteForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"/>
              <div className="h-3 bg-gray-100 rounded w-full mb-2"/>
              <div className="h-3 bg-gray-100 rounded w-2/3"/>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-3xl mb-3">📝</p>
          <p>No notes yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) =>
            editing?.id === note.id ? (
              <NoteForm key={note.id} initial={note} onSave={handleUpdate} onCancel={() => setEditing(null)} />
            ) : (
              <NoteCard key={note.id} note={note} onEdit={setEditing} onDelete={deleteNote} />
            )
          )}
        </div>
      )}
    </div>
  );
}
