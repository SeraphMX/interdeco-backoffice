import { Button } from '@heroui/react'
import { ReactNode } from 'react'
import { uiColors } from '../../types'

const ActionButton = ({ icon, label, color, onClick }: { icon: ReactNode; label: string; color: uiColors; onClick: () => void }) => (
  <Button className='flex flex-col h-16 w-16 p-2 gap-0' color={color} variant='ghost' onPress={onClick}>
    {icon}
    {label}
  </Button>
)

export default ActionButton
