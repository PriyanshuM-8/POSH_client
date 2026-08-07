import React from 'react'
import { usePosh } from '@/context/PoshContext'
import { WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function OfflineIndicator() {
  const { isOffline } = usePosh()

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-2"
        >
          <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            <span>You are currently offline. Some features may be unavailable.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
