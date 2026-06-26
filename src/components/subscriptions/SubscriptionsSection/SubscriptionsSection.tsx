import { getSubscriptions } from '@/api/subscriptions/getSubscriptions'
import DeferredSubscriptions from './DeferredSubscriptions'
import SubscriptionsBody from './SubscriptionsBody'

// Server component: fetches the subscription data, then renders the body.
//
// `eager` picks the strategy:
//   - default (home page): the section sits below the fold, so DeferredSubscriptions
//     mounts the heavy body (cards/carousel/images/DOM/CSS) only as it nears the
//     viewport — out of the LCP window.
//   - eager (the dedicated /subscription page): the body IS the above-the-fold
//     content, so it's SSR'd directly. Deferring it there would ship an empty
//     placeholder that pops in on hydration (CLS) and push the LCP image out of
//     the initial document (slow LCP).
export default async function SubscriptionsSection({ eager = false }: { eager?: boolean }) {
  const subscriptions = await getSubscriptions()

  if (eager) return <SubscriptionsBody subscriptions={subscriptions} eager />
  return <DeferredSubscriptions subscriptions={subscriptions} />
}
