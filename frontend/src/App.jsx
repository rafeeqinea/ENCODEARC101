import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Agent from './pages/Agent'
import FXMonitor from './pages/FXMonitor'
import Yield from './pages/Yield'
import Obligations from './pages/Obligations'
import Architecture from './pages/Architecture'
import SplashScreen from './components/SplashScreen'

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
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="agent" element={<Agent />} />
                <Route path="fx" element={<FXMonitor />} />
                <Route path="yield" element={<Yield />} />
                <Route path="obligations" element={<Obligations />} />
                <Route path="architecture" element={<Architecture />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
