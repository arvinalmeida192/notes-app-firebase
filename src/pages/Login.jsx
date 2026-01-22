import { useState } from "react"
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "../firebase"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [resetMode, setResetMode] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/notes") // 🔥 YOU WERE MISSING THIS
    } catch (err) {
      console.error("Login error:", err)
      setError("Invalid email or password")
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!email) {
      setError("Please enter your email to reset password")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Password reset email sent. Check your inbox.")
      setResetMode(false) // 🔥 AUTO GO BACK TO LOGIN
      setPassword("")
    } catch (err) {
      console.error("Reset error:", err)
      setError("Failed to send reset email. Check your email address.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {resetMode ? "Reset Password" : "Login"}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-4 text-center">{message}</p>
        )}

        {!resetMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 transition">
              Send Reset Email
            </button>
          </form>
        )}

        {!resetMode && (
          <p className="text-sm mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setResetMode(true)
                setError("")
                setMessage("")
                setPassword("")
              }}
              className="text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </p>
        )}

        {resetMode && (
          <p className="text-sm mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setResetMode(false)
                setError("")
                setMessage("")
              }}
              className="text-blue-600 hover:underline"
            >
              Back to login
            </button>
          </p>
        )}

        {!resetMode && (
          <p className="text-sm mt-6 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
