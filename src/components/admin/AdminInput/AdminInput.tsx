import { forwardRef } from 'react'
import cn from 'classnames'
import styles from './AdminInput.module.scss'

// The one standard admin text input. Forwards every native <input> attribute and
// a ref. No hooks → usable from both server and client components.
//
// For type='number' it renders a numeric text field (type=text + inputMode) and
// strips any non-numeric character on input. A native number input keeps an
// invalid-input buffer that can still show typed letters; a text field exposes
// the real value so we can clean it reliably (incl. for uncontrolled inputs).
type Props = React.InputHTMLAttributes<HTMLInputElement>

const AdminInput = forwardRef<HTMLInputElement, Props>(function AdminInput(
  { className, type, inputMode, onInput, ...rest },
  ref
) {
  const isNumber = type === 'number'

  const handleInput: React.InputEventHandler<HTMLInputElement> | undefined = isNumber
    ? (e) => {
        const el = e.currentTarget
        const cleaned = el.value.replace(/[^\d.]/g, '')
        if (el.value !== cleaned) el.value = cleaned
        onInput?.(e)
      }
    : onInput

  return (
    <input
      ref={ref}
      type={isNumber ? 'text' : type}
      inputMode={isNumber ? 'decimal' : inputMode}
      onInput={handleInput}
      className={cn(styles.input, className)}
      {...rest}
    />
  )
})

export default AdminInput
