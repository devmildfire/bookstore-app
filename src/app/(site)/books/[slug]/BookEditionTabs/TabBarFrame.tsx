import styles from './BookEditionTabs.module.scss'

type Props = { tabCount: number; activeIndex: number }

// Geometry (matches Figma node 543:2463 — imgUnion1 / imgRectangle481).
// Coordinates are shifted 0.5 inside each viewBox edge so the 1px stroke is never clipped
// (Firefox clips strokes that cross the viewBox boundary even with vector-effect=non-scaling-stroke).
const W = 1408
const VBH = 81
const TOP = 0.5             // top edge of path (1px stroke sits at y∈[0,1])
const SHELF = 80.5          // shelf line (1px stroke sits at y∈[80,81])
const R = 20                // top corner radius
const SIDE_TOP = R + TOP    // y where the rounded corner ends and the vertical side begins
const AH = 42 + TOP         // y where the side meets the bottom curve / shelf
const CW = 42               // concave outward curve horizontal extent
const STROKE = 'rgba(220, 220, 220, 0.4)'

// Cubic Bezier control points reproducing the Figma sweep
const cp1Y = SHELF - 11.5   // first control point: vertical drop below the start
const cp2Offset = 4.5       // second control point: small horizontal nudge before the shelf

function buildActivePath(activeLeft: number, activeRight: number, isLeftmost: boolean, isRightmost: boolean) {
  let d = `M 0 ${SHELF} `

  if (isLeftmost) {
    d += `L 0 ${SIDE_TOP} `
  } else {
    d += `L ${activeLeft - CW} ${SHELF} `
    d += `C ${activeLeft - cp2Offset} ${SHELF}, ${activeLeft} ${cp1Y}, ${activeLeft} ${AH} `
    d += `L ${activeLeft} ${SIDE_TOP} `
  }

  d += `Q ${activeLeft} ${TOP}, ${activeLeft + R} ${TOP} `
  d += `L ${activeRight - R} ${TOP} `
  d += `Q ${activeRight} ${TOP}, ${activeRight} ${SIDE_TOP} `

  if (isRightmost) {
    d += `L ${activeRight} ${SHELF} `
  } else {
    d += `L ${activeRight} ${AH} `
    d += `C ${activeRight} ${cp1Y}, ${activeRight + cp2Offset} ${SHELF}, ${activeRight + CW} ${SHELF} `
    d += `L ${W} ${SHELF} `
  }

  return d
}

// The inactive tab outline is asymmetric per the Figma source:
//   * left side runs only top-half (the previous tab — active or inactive — provides the bottom half)
//   * right side runs full-height down to the shelf
// When an inactive tab is the FIRST tab and the active tab sits further right,
// nothing exists to its left, so its left side must also run full-height down
// to the shelf — otherwise the bottom-left corner of the section is missing.
// Mirror logic for the LAST inactive tab when adjacent to an active tab on its right.
function buildInactivePath(
  tabLeft: number,
  tabRight: number,
  isFirstTab: boolean,
  nextIsActive: boolean,
) {
  let d = ''
  // Left side
  d += `M ${tabLeft} ${isFirstTab ? SHELF : AH} `
  d += `L ${tabLeft} ${SIDE_TOP} `
  // Top arc
  d += `Q ${tabLeft} ${TOP}, ${tabLeft + R} ${TOP} `
  d += `L ${tabRight - R} ${TOP} `
  d += `Q ${tabRight} ${TOP}, ${tabRight} ${SIDE_TOP} `
  // Right side
  d += `L ${tabRight} ${nextIsActive ? AH : SHELF} `

  return d
}

export default function TabBarFrame({ tabCount, activeIndex }: Props) {
  const tw = W / tabCount
  const activeLeft = activeIndex * tw
  const activeRight = (activeIndex + 1) * tw
  const activePath = buildActivePath(
    activeLeft,
    activeRight,
    activeIndex === 0,
    activeIndex === tabCount - 1,
  )

  const inactivePaths: string[] = []
  for (let i = 0; i < tabCount; i++) {
    if (i === activeIndex) continue
    inactivePaths.push(
      buildInactivePath(i * tw, (i + 1) * tw, i === 0, i + 1 === activeIndex),
    )
  }

  return (
    <svg
      className={styles.frame}
      viewBox={`0 0 ${W} ${VBH}`}
      preserveAspectRatio="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={activePath}
        fill="none"
        stroke={STROKE}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {inactivePaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={STROKE}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
