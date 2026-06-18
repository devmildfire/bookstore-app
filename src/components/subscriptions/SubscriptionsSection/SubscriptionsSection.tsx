import { getSubscriptions } from '@/api/subscriptions/getSubscriptions'
import DeferredSubscriptions from './DeferredSubscriptions'

// Server component: fetches the subscription data, then hands it to the client
// DeferredSubscriptions wrapper, which mounts the heavy body (cards/carousel/
// images/DOM) only when the section approaches the viewport — out of the LCP window.
export default async function SubscriptionsSection() {
  const subscriptions = await getSubscriptions()

  return <DeferredSubscriptions subscriptions={subscriptions} />
}
