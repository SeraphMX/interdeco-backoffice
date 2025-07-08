import { Button, Input, Tooltip } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useRef, useState } from 'react'

interface InputClipboardProps {
  label: string
  value: string
}

const MotionIcon = motion.div

const InputClipboard = ({ label, value }: InputClipboardProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Input
      label={label}
      defaultValue={value}
      ref={inputRef}
      endContent={
        <Tooltip content={'Copiar'} placement='left'>
          <Button size='sm' variant='light' color='primary' onPress={handleCopy} isIconOnly>
            <AnimatePresence mode='wait'>
              {copied ? (
                <MotionIcon
                  key='check'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <Check />
                </MotionIcon>
              ) : (
                <MotionIcon
                  key='copy'
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.1 }}
                >
                  <Copy />
                </MotionIcon>
              )}
            </AnimatePresence>
          </Button>
        </Tooltip>
      }
      variant='bordered'
      classNames={{ inputWrapper: 'border-none shadow-none' }}
    />
  )
}

export default InputClipboard
