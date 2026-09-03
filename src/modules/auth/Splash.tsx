import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DURATION = 2500

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), DURATION)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white">
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .anim-logo {
          animation: fadeScaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-subtitle {
          opacity: 0;
          animation: fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
        .anim-bar-wrap {
          opacity: 0;
          animation: fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.85s forwards;
        }
        .bar-fill {
          background: linear-gradient(90deg, #1565C0 0%, #1976D2 40%, #42A5F5 60%, #1976D2 80%, #1565C0 100%);
          background-size: 200% 100%;
          animation: fillBar ${DURATION}ms linear forwards, shimmer 1.8s linear 0.85s infinite;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="anim-logo mb-8 translate-x-7">
          <img
            src="/payment-hub-ee.png"
            alt="Payment Hub EE"
            className="h-28 w-auto object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* Subtitle */}
        <p className="anim-subtitle text-gray-500 text-sm tracking-[0.28em] uppercase font-medium mb-10">
          Enterprise Edition
        </p>

        {/* Progress bar */}
        <div className="anim-bar-wrap w-64">
          <div className="h-1.25 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="bar-fill h-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
