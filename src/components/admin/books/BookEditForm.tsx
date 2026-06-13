'use client'

import { useActionState } from 'react'
import { updateBookAction } from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import NumberStepper from '@/components/common/NumberStepper'
import { CheckIcon } from '@/components/admin/icons'
import type { AdminBook } from '@/api/admin/books'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import AdminDatePicker from '@/components/admin/AdminDatePicker'
import AdminSelect from '@/components/admin/AdminSelect'
import styles from './BookEditForm.module.scss'

type Props = { book: AdminBook }

export default function BookEditForm({ book }: Props) {
  const [state, action, pending] = useActionState(updateBookAction, null)

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={book.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <Input name='name' defaultValue={book.name} required />
        </label>
        <label className={styles.label}>
          Slug
          <Input name='slug' defaultValue={book.slug ?? ''} required />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <Textarea name='description' defaultValue={book.description ?? ''} rows={5} />
      </label>

      <label className={styles.label}>
        Тезис
        <Textarea name='thesis' defaultValue={book.thesis ?? ''} rows={2} />
      </label>

      <div className={styles.grid}>
        <div className={styles.label}>
          <span>Возрастное ограничение</span>
          <NumberStepper name='ageRestriction' defaultValue={book.ageRestriction ?? ''} min={0} max={21} />
        </div>
        <div className={styles.label}>
          <span>Год первого издания</span>
          <AdminDatePicker name='firstRelease' yearOnly defaultValue={book.firstRelease ?? ''} ariaLabel='Год первого издания' />
        </div>
        <label className={styles.label}>
          Литературная форма
          <Input name='litForm' defaultValue={book.litForm ?? ''} />
        </label>
      </div>

      <div className={styles.checks}>
        <Checkbox name='isCompilation' defaultChecked={book.isCompilation} label='Сборник' />
      </div>

      <fieldset className={styles.periodical}>
        <legend>Периодика</legend>
        <p className={styles.hint}>
          Выпуск периодического издания (напр. «Могучий Русский Динозавр»). Выпуски одной серии
          показываются на одной странице секциями; в каталоге карточка ведёт к нужной секции.
        </p>
        <div className={styles.grid}>
          <label className={styles.label}>
            Серия
            <AdminSelect
              name='periodicalId'
              ariaLabel='Серия'
              defaultValue={book.periodicalId ? String(book.periodicalId) : ''}
              options={[
                { value: '', label: '— Не периодика —' },
                ...book.periodicals.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
            />
          </label>
          <label className={styles.label}>
            Номер тома
            <Input name='volumeNumber' type='number' min={0} defaultValue={book.volumeNumber ?? ''} />
          </label>
          <label className={styles.label}>
            Год тома
            <Input name='volumeYear' defaultValue={book.volumeYear ?? ''} placeholder='2025' />
          </label>
        </div>
      </fieldset>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && (
          <span className={styles.ok}>
            <CheckIcon /> Сохранено
          </span>
        )}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
