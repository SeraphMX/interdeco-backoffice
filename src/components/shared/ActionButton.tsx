import { Button } from '@heroui/react'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { isMobile } from 'react-device-detect'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { uiColors } from '../../types'

const ActionButton = ({ icon, label, color, onClick }: { icon: ReactNode; label: string; color: uiColors; onClick: () => void }) => {
  const rxQuote = useSelector((state: RootState) => state.quote)

  const alwaysShowLabel = rxQuote.isPublicAccess || !isMobile

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, delay: 1, type: 'spring', stiffness: 100, damping: 20 }}
    >
      <Button
        className={`flex flex-col p-2 gap-0 ${alwaysShowLabel ? 'h-16 w-16' : 'h-12 w-16'} items-center justify-center`}
        color={color}
        variant='ghost'
        onPress={onClick}
        isIconOnly={!alwaysShowLabel}
      >
        {icon}
        {alwaysShowLabel && label}
      </Button>
    </motion.div>
  )
}

export default ActionButton
