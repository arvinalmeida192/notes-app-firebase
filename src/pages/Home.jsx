
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white flex flex-col">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
          Notes App
        </h1>

        <div className="space-x-2 sm:space-x-4">
          <Link
            to="/login"
            className="px-3 sm:px-4 py-2 rounded-md border border-white hover:bg-white hover:text-indigo-700 transition text-sm sm:text-base"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-3 sm:px-4 py-2 rounded-md bg-white text-indigo-700 font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight">
            Your Notes.  
            <span className="block text-yellow-300">
              Anywhere. Anytime.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-gray-200 mb-8 sm:mb-10">
            A simple, secure notes app powered by Firebase.  
            Save your thoughts, access them anywhere, and never lose ideas again.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="px-6 sm:px-8 py-3 rounded-lg bg-yellow-400 text-indigo-900 font-semibold text-base sm:text-lg hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="px-6 sm:px-8 py-3 rounded-lg border border-white text-white font-semibold text-base sm:text-lg hover:bg-white hover:text-indigo-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 text-xs sm:text-sm text-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-center sm:text-left">
          © {new Date().getFullYear()} Notes App — Built with Firebase
        </div>

        <div className="text-center sm:text-right">
          Built by{" "}
          <span className="font-semibold text-white">
            Arvin Almeida
          </span>
        </div>
      </div>
    </div>
  )
}
