import { forwardRef } from 'react'
import cn from 'classnames'
import styles from './AdminTextarea.module.scss'

// The one standard admin multiline field. Forwards every native <textarea>
// attribute and a ref. No hooks → usable from server and client components.
type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const AdminTextarea = forwardRef<HTMLTextAreaElement, Props>(function AdminTextarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(styles.textarea, className)} {...rest} />
})

export default AdminTextarea
