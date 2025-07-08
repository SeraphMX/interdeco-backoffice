import ReactCountUp from 'react-countup'

const CountUp = ({ value }: { value: number }) => {
  return <ReactCountUp end={value} duration={1} prefix='$' separator=',' decimals={2} decimal='.' />
}

export default CountUp
