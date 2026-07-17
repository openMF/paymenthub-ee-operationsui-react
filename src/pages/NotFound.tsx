import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
      <p className="text-7xl font-bold text-[#1565C0]">404</p>
      <p className="text-xl font-semibold text-gray-700">Page Not Found</p>
      <p className="text-sm text-gray-400">The page you're looking for doesn't exist.</p>
      <Button asChild className="mt-2 bg-[#1565C0] hover:bg-[#0d47a1] text-white">
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
