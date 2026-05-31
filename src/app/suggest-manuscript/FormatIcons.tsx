// 85×85 format-badge icons from the Figma frames (nodes 4099:12289 /
// 4099:12442 / 4099:12443 and their 1440/1024/320 counterparts), exported
// as SVG and saved under src/assets/icons/format-{digital,audio,paper}.svg.
// SVGR turns each file into a React component; `currentColor` keeps them
// in sync with the parent's text colour.

import DigitalIconSvg from '@/assets/icons/format-digital.svg'
import AudioIconSvg from '@/assets/icons/format-audio.svg'
import PaperIconSvg from '@/assets/icons/format-paper.svg'

type Props = { className?: string }

export function DigitalIcon({ className }: Props) {
  return <DigitalIconSvg className={className} aria-hidden />
}

export function AudioIcon({ className }: Props) {
  return <AudioIconSvg className={className} aria-hidden />
}

export function PrintIcon({ className }: Props) {
  return <PaperIconSvg className={className} aria-hidden />
}
