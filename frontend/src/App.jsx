import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import DashboardLayout from './layouts/DashboardLayout'
import SplashScreen from './components/SplashScreen'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Agent = lazy(() => import('./pages/Agent'))
const FXMonitor = lazy(() => import('./pages/FXMonitor'))
const Yield = lazy(() => import('./pages/Yield'))
const Obligations = lazy(() => import('./pages/Obligations'))
const Architecture = lazy(() => import('./pages/Architecture'))
const Contracts = lazy(() => import('./pages/Contracts'))
const CrossChain = lazy(() => import('./pages/CrossChain'))
const Nanopayments = lazy(() => import('./pages/Nanopayments'))
const Transactions = lazy(() => import('./pages/Transactions'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const Landing = lazy(() => import('./pages/Landing'))

function RequireWallet({ children }) {
  const wallet = sessionStorage.getItem('arc-wallet')
  const location = useLocation()
  const [checked, setChecked] = useState(false)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    if (!wallet) { setChecked(true); return }
    // Verify MetaMask still has accounts connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accs => { setValid(accs.length > 0); setChecked(true) })
        .catch(() => { setValid(false); setChecked(true) })

      // Listen for disconnect mid-session
      const onAccountsChanged = (accs) => {
        if (!accs || accs.length === 0) {
          sessionStorage.removeItem('arc-wallet')
          setValid(false)
        }
      }
      window.ethereum.on('accountsChanged', onAccountsChanged)
      return () => window.ethereum.removeListener('accountsChanged', onAccountsChanged)
    } else {
      setValid(false); setChecked(true)
    }
  }, [wallet])

  if (!checked) return null
  if (!wallet || !valid) {
    sessionStorage.removeItem('arc-wallet')
    return <Navigate to="/" state={{ from: location }} replace />
  }
  return children
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('arc-loaded'))

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false)
        sessionStorage.setItem('arc-loaded', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSplash])

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.div key="splash" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <SplashScreen />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <BrowserRouter>
            <Suspense fallback={
              <div className="w-full h-screen flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
                <span className="text-sm font-medium">Loading Module...</span>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<RequireWallet><DashboardLayout /></RequireWallet>}>
                  <Route index element={<Dashboard />} />
                  <Route path="agent" element={<Agent />} />
                  <Route path="fx" element={<FXMonitor />} />
                  <Route path="yield" element={<Yield />} />
                  <Route path="obligations" element={<Obligations />} />
                  <Route path="contracts" element={<Contracts />} />
                  <Route path="crosschain" element={<CrossChain />} />
                  <Route path="nanopayments" element={<Nanopayments />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="architecture" element={<Architecture />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
