// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — 404 Not Found
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import { Hexagon, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 animate-float">
          <Hexagon className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-6xl font-black text-slate-800 mb-2 font-mono">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-3">Page not found</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          This route doesn't exist on the PayChain network.
        </p>
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
