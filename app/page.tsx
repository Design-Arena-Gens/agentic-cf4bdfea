'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Tag, Trash2, Edit2, Check } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })

  useEffect(() => {
    const stored = localStorage.getItem('notes')
    if (stored) {
      setNotes(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => note.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const createNote = () => {
    if (!newNote.title.trim()) return

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setNotes([note, ...notes])
    setNewNote({ title: '', content: '', tags: '' })
    setIsCreating(false)
  }

  const updateNote = (id: string) => {
    setNotes(notes.map(note =>
      note.id === id
        ? { ...note, ...newNote, tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t), updatedAt: new Date().toISOString() }
        : note
    ))
    setEditingNote(null)
    setNewNote({ title: '', content: '', tags: '' })
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  const startEdit = (note: Note) => {
    setEditingNote(note.id)
    setNewNote({ title: note.title, content: note.content, tags: note.tags.join(', ') })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-4">Notes</h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-white text-purple-600'
                      : 'bg-purple-500 text-white hover:bg-purple-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-400"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingNote) && (
          <div className="p-4 border-b bg-gray-50">
            <input
              type="text"
              placeholder="Title"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <textarea
              placeholder="Content"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              rows={4}
              className="w-full p-3 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newNote.tags}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
              className="w-full p-3 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => editingNote ? updateNote(editingNote) : createNote()}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {editingNote ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setEditingNote(null)
                  setNewNote({ title: '', content: '', tags: '' })
                }}
                className="px-4 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-lg">No notes yet</p>
              <p className="text-sm mt-2">Create your first note to get started</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{note.content}</p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Add Button */}
        {!isCreating && !editingNote && (
          <div className="p-4 bg-gray-50">
            <button
              onClick={() => setIsCreating(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
