import { getBoxSets, getBoxSetsByTitleId } from '@/api/boxSets/getBoxSets'
import { getBoxSetBooksMap } from '@/api/boxSets/getBoxSetBooksMap'
import DeferredBoxSets from './DeferredBoxSets'

type Props = {
  // When supplied, the section renders only the box sets that contain this
  // title — used on the book detail page so each book lists the sets it
  // belongs to. Omit on the main page to list every active set.
  titleId?: number
}

// Server component: fetches the box-set data, then hands it to the client
// DeferredBoxSets wrapper, which mounts the heavy body (grid/images/DOM) only
// when the section approaches the viewport — keeping it out of the LCP window.
export default async function BoxSetsSection({ titleId }: Props = {}) {
  const boxSets = titleId !== undefined ? await getBoxSetsByTitleId(titleId) : await getBoxSets()
  if (boxSets.length === 0) return null

  const booksMap = await getBoxSetBooksMap(boxSets.map((b) => b.id))

  return <DeferredBoxSets boxSets={boxSets} booksMap={booksMap} />
}
