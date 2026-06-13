// Чтиво admin — line-art icons. They inherit `currentColor` (so they redden on
// hover/active) and use a 1.6 stroke with round joins, per the design handoff.
// Ported from the handoff prototype's icons.jsx.

type IconProps = React.SVGProps<SVGSVGElement>

function make(paths: string[], viewBox = '0 0 24 24') {
  function Icon(props: IconProps) {
    return (
      <svg
        viewBox={viewBox}
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
        {...props}
      >
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke='currentColor'
            strokeWidth={1.6}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        ))}
      </svg>
    )
  }
  return Icon
}

export const DashboardIcon = make(['M4 4h6v6H4V4Z', 'M14 4h6v6h-6V4Z', 'M4 14h6v6H4v-6Z', 'M14 14h6v6h-6v-6Z'])
export const OrdersIcon = make(['M5 4h11l3 3v13H5V4Z', 'M9 9h7M9 13h7M9 17h4'])
export const BooksIcon = make([
  'M4 5.5C4 4.7 4.7 4 5.5 4H12v15.5H5.5A1.5 1.5 0 0 1 4 18V5.5Z',
  'M20 5.5C20 4.7 19.3 4 18.5 4H12v15.5h6.5a1.5 1.5 0 0 0 1.5-1.5V5.5Z',
])
export const AuthorsIcon = make(['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6'])
export const BoxSetIcon = make(['M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z', 'M3 7.5 12 12l9-4.5M12 12v9'])
export const GiftCardIcon = make([
  'M3 8h18v11H3V8Z',
  'M3 12h18',
  'M12 8V5.5M12 8c-1.5 0-3-1-3-2.2C9 4.8 10 4 12 5.8 14 4 15 4.8 15 5.8 15 7 13.5 8 12 8Z',
])
export const SubscriptionsIcon = make(['M4 4h16v13H4V4Z', 'M4 9h16', 'M8 20h8M12 17v3'])
export const PromoIcon = make(['M4 12l8-8 8 8-8 8-8-8Z', 'M9 9.5h.01'])
export const ArticlesIcon = make(['M5 4h14v16H5V4Z', 'M8 8h8M8 12h8M8 16h5'])
export const SubmissionsIcon = make(['M4 5h16v10H7l-3 3V5Z', 'M8 9h8M8 12h5'])
export const AuditIcon = make(['M12 7v5l3 2', 'M3.5 12a8.5 8.5 0 1 0 2.8-6.3', 'M3 4v3.5h3.5'])
export const FeaturedIcon = make([
  'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
])

export const SearchIcon = make(['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M21 21l-4.3-4.3'])
export const PlusIcon = make(['M12 5v14M5 12h14'])
export const MinusIcon = make(['M5 12h14'])
export const CheckIcon = make(['M5 12.5l4.5 4.5L19 6.5'])
// Proportionate chevron (fills a 12×8 box) so it reads clearly at any CSS size.
export const ChevronDownIcon = make(['M1 1.5l5 5 5-5'], '0 0 12 8')
export const ChevronRightIcon = make(['M9 6l6 6-6 6'])
export const ChevronLeftIcon = make(['M15 6l-6 6 6 6'])
export const CalendarIcon = make(['M5 4h14v16H5V4Z', 'M5 9h14', 'M8 2.5v3M16 2.5v3'])
export const ArrowLeftIcon = make(['M19 12H5M11 6l-6 6 6 6'])
export const BurgerIcon = make(['M4 6h16M4 12h16M4 18h16'])
export const BellIcon = make(['M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z', 'M10 19a2 2 0 0 0 4 0'])
export const LogoutIcon = make(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'])
export const CloseIcon = make(['M6 6l12 12M18 6L6 18'])
export const TrashIcon = make(['M5 7h14M9 7V5h6v2M6 7l1 13h10l1-13'])
export const UploadIcon = make(['M12 16V5M8 9l4-4 4 4', 'M5 16v3h14v-3'])
export const UserIcon = make(['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6'])
export const PaperIcon = make(['M6 3h9l3 3v15H6V3Z', 'M14 3v4h4'])
export const DigitalIcon = make(['M4 4h16v12H4V4Z', 'M2 20h20M9 16l-1 4M15 16l1 4'])
export const AudioIcon = make(['M4 9v6h4l5 4V5L8 9H4Z', 'M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12'])
