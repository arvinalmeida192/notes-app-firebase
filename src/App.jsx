import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from "react"

import { auth } from "./firebase"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Notes from "./pages/Notes"
import Home from "./pages/Home"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={user ? <Notes /> : <Login />}
        />

        <Route
          path="/signup"
          element={user ? <Notes /> : <Signup />}
        />

        <Route
          path="/notes"
          element={user ? <Notes /> : <Login />}
        />
      </Routes>
    </Router>
  )
}
