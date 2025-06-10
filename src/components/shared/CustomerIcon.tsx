import { Building2, SquareUserRound } from 'lucide-react'
import { SVGProps } from 'react'

interface CustomerIconProps extends SVGProps<SVGSVGElement> {
  customerType: 'individual' | 'business'
}

const CustomerIcon = ({ customerType, ...props }: CustomerIconProps) => {
  return <>{customerType === 'individual' ? <SquareUserRound {...props} /> : <Building2 {...props} />}</>
}

export default CustomerIcon
