import Image from 'next/image'

// DIAGNOSTIC PAGE — not for production. A statically-rendered page whose only
// content is one SSR LCP image (same next/image config as the hero cover), inside
// the normal (site) layout. Used to measure the irreducible LCP floor: layout +
// document + one image, with no carousel / catalog / sections JS. Delete after use.
export const dynamic = 'force-static'

export const metadata = { title: 'perf-min', robots: { index: false } }

export default function PerfMinPage() {
  // Hardcoded prod storage URL (not getCoverUrl → localhost) so the image also loads under a
  // local `next start` (prod mode blocks localhost upstreams), giving a clean LCP locally.
  const cover = 'https://api.mildfire.dev/storage/v1/object/public/covers/murlo.jpg'

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '100vh',
        background: '#0a0a0a',
      }}
    >
      <Image
        src={cover}
        alt="Обложка книги: Мурло"
        width={355}
        height={533}
        sizes="(max-width: 767px) 45vw, 355px"
        priority
        fetchPriority="high"
      />
    </div>
  )
}
