// Module 04 · Cosmos DB — custom hook for notes CRUD
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/api/notes');
      setNotes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  async function createNote(title, body) {
    const { data } = await api.post('/api/notes', { title, body });
    setNotes((prev) => [data, ...prev]);
    return data;
  }

  async function updateNote(id, fields) {
    const { data } = await api.put(`/api/notes/${id}`, fields);
    setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
    return data;
  }

  async function deleteNote(id) {
    await api.delete(`/api/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, loading, error, refetch: fetchNotes, createNote, updateNote, deleteNote };
}
