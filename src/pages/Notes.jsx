import { useEffect, useState, useRef } from "react"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../firebase"
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"

export default function Notes() {
  const [note, setNote] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [user, setUser] = useState(null)
  const [search, setSearch] = useState("")
  const [dark, setDark] = useState(
    localStorage.getItem("darkMode") === "true"
  )

  const textareaRef = useRef(null)

  // 🔥 AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })

    return () => unsub()
  }, [])

  // 🔥 REAL-TIME NOTES LISTENER
  useEffect(() => {
    if (!user) return

    setLoading(true)

    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid)
    )

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))

        const sorted = data.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1

          const aTime = a.createdAt?.seconds || 0
          const bTime = b.createdAt?.seconds || 0
          return bTime - aTime
        })

        setNotes(sorted)
        setLoading(false)
      },
      (err) => {
        console.error("❌ Firestore realtime error:", err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [user])

  useEffect(() => {
    localStorage.setItem("darkMode", dark)
  }, [dark])

  const saveNote = async () => {
    if (!note.trim() || !user) return

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (editingId) {
        const noteRef = doc(db, "notes", editingId)
        await updateDoc(noteRef, {
          content: note,
          tags,
        })
        setEditingId(null)
      } else {
        await addDoc(collection(db, "notes"), {
          userId: user.uid,
          content: note,
          tags,
          pinned: false,
          createdAt: serverTimestamp(),
        })
      }

      setNote("")
      setTagInput("")
      textareaRef.current?.focus()
    } catch (err) {
      console.error("❌ Firestore save/update error:", err)
    }
  }

  const deleteNote = async (id) => {
    const ok = confirm("Delete this note?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "notes", id))
    } catch (err) {
      console.error("❌ Firestore delete error:", err)
    }
  }

  const togglePin = async (noteObj) => {
    try {
      await updateDoc(doc(db, "notes", noteObj.id), {
        pinned: !noteObj.pinned,
      })
    } catch (err) {
      console.error("❌ Firestore pin error:", err)
    }
  }

  const startEdit = (noteObj) => {
    setNote(noteObj.content)
    setTagInput((noteObj.tags || []).join(", "))
    setEditingId(noteObj.id)
    textareaRef.current?.focus()
  }

  const cancelEdit = () => {
    setNote("")
    setTagInput("")
    setEditingId(null)
  }

  const handleLogout = async () => {
    await signOut(auth)
  }

  const filteredNotes = notes.filter((n) => {
    const text = n.content.toLowerCase()
    const tags = (n.tags || []).join(" ").toLowerCase()
    const q = search.toLowerCase()

    return text.includes(q) || tags.includes(q)
  })

  return (
    <div
      className={`min-h-screen flex flex-col ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >
      {/* Top bar */}
      <div
        className={`shadow px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${
          dark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          My Notes
        </h2>

        <div className="flex justify-center sm:justify-end gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded border text-sm"
          >
            {dark ? "Light" : "Dark"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Editor */}
        <div
          className={`md:col-span-1 p-4 sm:p-6 rounded-xl shadow flex flex-col ${
            dark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            {editingId ? "Edit Note" : "New Note"}
          </h3>

          <textarea
            ref={textareaRef}
            className={`h-32 sm:h-40 border rounded p-3 resize-none focus:outline-none ${
              dark
                ? "bg-gray-900 border-gray-700 text-white"
                : "border-gray-300"
            }`}
            placeholder="Type your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "Enter") saveNote()
            }}
          />

          <input
            type="text"
            placeholder="Tags (comma separated)"
            className={`mt-2 border rounded p-2 text-sm ${
              dark
                ? "bg-gray-900 border-gray-700 text-white"
                : "border-gray-300"
            }`}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />

          <div className="text-xs mt-1 text-right">
            {note.length} / 500
          </div>

          <button
            disabled={!note.trim()}
            onClick={saveNote}
            className={`mt-3 px-4 py-2 rounded transition w-full ${
              !note.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {editingId ? "Update Note" : "Save Note"}
          </button>

          {editingId && (
            <button
              onClick={cancelEdit}
              className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition w-full"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Notes list */}
        <div
          className={`md:col-span-2 p-4 sm:p-6 rounded-xl shadow overflow-y-auto ${
            dark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-semibold">
              Your Notes
            </h3>

            <input
              type="text"
              placeholder="Search..."
              className={`border rounded p-2 text-sm w-full sm:w-56 ${
                dark
                  ? "bg-gray-900 border-gray-700 text-white"
                  : "border-gray-300"
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="text-gray-500">Loading notes...</p>
          ) : filteredNotes.length === 0 ? (
            <p className="text-gray-500">No notes found.</p>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className={`border rounded p-3 sm:p-4 flex flex-col sm:flex-row justify-between gap-3 ${
                    dark
                      ? "border-gray-700 bg-gray-900"
                      : "border-gray-200"
                  }`}
                >
                  <div>
                    <p className="whitespace-pre-wrap text-sm sm:text-base">
                      {n.content}
                    </p>

                    {n.tags?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {n.tags.map((t, i) => (
                          <span
                            key={i}
                            className="text-xs bg-indigo-600 text-white px-2 py-1 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2">
                    <button
                      onClick={() => togglePin(n)}
                      className="text-xs sm:text-sm bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                    >
                      {n.pinned ? "Unpin" : "Pin"}
                    </button>

                    <button
                      onClick={() => startEdit(n)}
                      className="text-xs sm:text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-xs sm:text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
