import { Button, cn, Input, Select, SelectItem } from '@heroui/react'
import { Circle, Save, X } from 'lucide-react'

type AddCategoryProps = {
  onSuccess: (newCategory: { name: string; color: string }) => void
  onCancel?: () => void
  onError?: (error: string) => void
}

const AddCategory = ({ onSuccess, onCancel }: AddCategoryProps) => {
  const colors = [
    { key: 'rojo', label: 'Rojo' },
    { key: 'verde', label: 'Verde' },
    { key: 'azul', label: 'Azul' },
    { key: 'amarillo', label: 'Amarillo' },
    { key: 'naranja', label: 'Naranja' },
    { key: 'morado', label: 'Morado' }
  ]

  const fillColors = {
    rojo: 'fill-red-300',
    verde: 'fill-green-300',
    azul: 'fill-blue-300',
    amarillo: 'fill-yellow-300',
    naranja: 'fill-orange-300',
    morado: 'fill-purple-300'
  }

  return (
    <form className='flex items-center gap-2 m-4 '>
      <Input label='Nombre de la categoría' name='name' isClearable size='sm' autoFocus />

      <Select className='max-w-xs' items={colors} label='Color'>
        {(animal) => (
          <SelectItem startContent={<Circle className={cn('w-4 h-4 text-white', fillColors[animal.key])} />}>{animal.label}</SelectItem>
        )}
      </Select>

      <Button isIconOnly variant='ghost' onPress={onCancel} color='danger'>
        <X />
      </Button>
      <Button isIconOnly variant='ghost' type='submit' color='primary'>
        <Save />
      </Button>
    </form>
  )
}

export default AddCategory
