import { forwardRef } from 'react'
import cn from 'classnames'
import styles from './AdminInput.module.scss'

// The one standard admin text input. Forwards every native <input> attribute and
// a ref, so it drops in for name/defaultValue/value/type/required/placeholder/
// ref/etc. No hooks → usable from both server and client components.
type Props = React.InputHTMLAttributes<HTMLInputElement>

const AdminInput = forwardRef<HTMLInputElement, Props>(function AdminInput({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(styles.input, className)} {...rest} />
})

export default AdminInput
