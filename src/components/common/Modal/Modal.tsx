'use client'

import { useId, type ReactNode } from 'react'
import cn from 'classnames'
import * as Dialog from '@radix-ui/react-dialog'
import styles from './Modal.module.scss'

type Size = 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional element that opens the modal (wrapped in Dialog.Trigger). */
  trigger?: ReactNode
  /**
   * Heading rendered as the accessible Dialog.Title at the top of the panel.
   * Omit only when the modal renders its own Dialog.Title in `children`
   * (e.g. a multi-step form whose heading changes).
   */
  title?: ReactNode
  /** Optional supporting line under the title; also wires aria-describedby. */
  description?: ReactNode
  /** Content rendered above the title (e.g. a gift-card image). */
  headerSlot?: ReactNode
  /** Panel max-width preset. sm 460 · md 540 · lg 640 · xl 800. */
  size?: Size
  /** Render the × close affordance (default true). */
  showClose?: boolean
  /** Extra classes merged onto the content panel. */
  className?: string
  children: ReactNode
}

// The single modal shell for the whole site: dark flat panel, centred, with a
// consistent overlay, close button, animation and typography. Every modal
// composes this so the chrome can't drift per-feature again.
export default function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  headerSlot,
  size = 'md',
  showClose = true,
  className,
  children,
}: Props) {
  const descId = useId()
  const hasDescription = description != null && description !== false

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={cn(styles.content, styles[size], className)}
          aria-describedby={hasDescription ? descId : undefined}
        >
          {headerSlot}
          {title != null && <Dialog.Title className={styles.title}>{title}</Dialog.Title>}
          {hasDescription && (
            <Dialog.Description id={descId} className={styles.description}>
              {description}
            </Dialog.Description>
          )}

          {children}

          {showClose && (
            <Dialog.Close className={styles.close} aria-label='Закрыть'>
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none' aria-hidden>
                <path
                  d='M1 1L13 13M13 1L1 13'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
