import ReactCountUp from 'react-countup'

interface CountUpProps {
  value: number
  type?: 'currency' | 'number' | 'currency-short'
}

const CountUp = ({ value, type = 'currency' }: CountUpProps) => {
  switch (type) {
    case 'number':
      return <ReactCountUp end={value} duration={1} />
    case 'currency-short': {
      let suffixValue
      if (value >= 1000000) {
        value = value / 1000000
        suffixValue = 'M' // Retorna en millones
      } else if (value >= 1000) {
        value = value / 1000
        suffixValue = 'k'
      }

      return <ReactCountUp end={value} duration={1} prefix='$' suffix={suffixValue} separator=',' decimals={1} decimal='.' />
    }
    default:
      return <ReactCountUp end={value} duration={1} prefix='$' separator=',' decimals={2} decimal='.' />
  }
}

export default CountUp
