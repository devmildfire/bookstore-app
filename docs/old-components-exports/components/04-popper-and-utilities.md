# Popper Component and Utilities Analysis

## Component: `src/components/Popper/index.tsx`

### Dependencies
```tsx
import React, {
  useState, useRef, useMemo,
} from 'react';
import { usePopper } from 'react-popper';
```

### Exact Styles
```tsx
// No explicit styled-components styles
// Uses react-popper's inline styles
```

### Component Structure
```tsx
type IPopper = {
  target: React.ReactElement;
  children: React.ReactElement;
  padding?: number
}

const Popper = ({
  target,
  children,
  padding = 0,
}: IPopper): React.ReactElement => {
  const [shouldShowPopper, setShowPopper] = useState(false);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const popperControls = useMemo(
    () => ({
      onMouseEnter: () => setShowPopper(true),
      onMouseLeave: () => setShowPopper(false),
    }),
    [setShowPopper, setShowPopper],
  );

  const offset = useMemo(
    () => ({
      name: 'offset',
      options: {
        offset: ({ reference, popper }: any) => [(popper.width - reference.width) / 2 - padding, 0],
      },
    }),
    [padding],
  );

  const { styles, attributes } = usePopper(buttonRef.current, popperRef.current, {
    modifiers: [
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
      offset,
    ],
  });

  return (
    <>
      <div ref={buttonRef} {...popperControls}>
        {target}
      </div>
      {shouldShowPopper && (
        <div ref={popperRef} {...popperControls}>
          <div ref={setArrowRef} style={styles.arrow} id='arrow' />
          {children}
        </div>
      )}
    </>
  );
};
```

### Key Features
- Custom dropdown using `react-popper`
- Positioning logic with arrow positioning
- Hover-to-show behavior
- Inline arrow element
- Padding support

---

## Utilities Analysis

### Color Definitions: `src/utils/colors.ts`
```tsx
const Colors = {
  black: '#18191b',
  blackBase: '#121212',

  gray5: '#e0e0e0',
  grey: '#DCDCDC',
  grey05: '#fafafa',
  grey10: '#f4f4f4',
  grey15: '#e9e9e9',
  grey25: '#cfcfcf',
  grey35: '#c4c4c4',
  grey50: '#aeaeae',
  grey60: '#8f8b8f',
  grey70: '#3c3f43',
  grey85: '#26292d',

  redBase: '#A10202',
  red: '#930000',

  white: '#ffffff',
  whiteBase: '#dcdcdc',
};
```

### Breakpoint System: `src/utils/breakPoints.ts`
```tsx
const BreakPoints = {
  sm: 'screen  and (max-width: 576px)',
  md: 'screen and (max-width: 830px)',
  lg: 'screen and (max-width: 1024px)',
  xl: 'screen and (max-width: 1440px)',
};
```

### Menu Items: `src/utils/menuItems.ts`
```tsx
export type SubmenuItem = {
  subtitle: string,
  link?: string,
  items?:
    {
      title: string,
      link: string,
    }[]
}

export type MenuItem = {
  title: string,
  link?: string,
  submenu?: SubmenuItem[]
}
```

### Menu Structure (from menuItems.ts)
```tsx
const forReaders: SubmenuItem[] = [
  {
    subtitle: 'Книжная лавка',
    items: [
      {
        title: 'Издания',
        link: '/books',
      },
      {
        title: 'Карты даров',
        link: '/gift-cards',
      },
      {
        title: 'Чудеса подписки',
        link: '/subscription',
      },
    ],
  },
  {
    subtitle: 'Журнал Русского Динозавра',
    link: '/dino-magazine',
  },
];

const forAuthors: SubmenuItem[] = [
  {
    subtitle: 'Предложить рукопись Чтиву',
    link: '/suggest-manuscript',
  },
  {
    subtitle: 'Предложить рассказ\nв журнал Русского Динозавра',
    link: '/suggest-story-to-rd',
  },
];

const menu: MenuItem[] = [
  {
    title: 'Главная',
    link: '/',
  },
  {
    title: 'Чтецам',
    submenu: forReaders,
  },
  {
    title: 'Авторам',
    submenu: forAuthors,
  },
  {
    title: 'Партнёрам',
    link: '/for-partners',
  },
  {
    title: 'О Чтиве',
    link: '/about',
  },
  {
    title: 'Контакты',
    link: '/contacts',
  },
];
```

---

## Migration Notes for Update Branch

### Popper Component
- **Alternative**: Use Radix UI DropdownMenu, Popover, or NavigationMenu
- **Reasoning**: Radix UI is already installed and used in new branch
- **Migration**: Replace Popper with `DropdownMenu.Root` + `DropdownMenu.Trigger` + `DropdownMenu.Content`
- **Positioning**: Radix UI handles arrow positioning automatically

### Color System
All colors from old site can be mapped to new token system:
- **Backgrounds**: `#121212` (blackBase), `#ffffff` (white)
- **Text**: `#DCDCDC` (grey), `#A10202` (redBase)
- **Borders**: `1px solid` (grey for header)

### Breakpoint System
Old breakpoints.ts already matches new system values:
- sm: 576px (new: max-width: 767px)
- md: 830px (new: 830px)
- lg: 1024px (new: 1201px)
- xl: 1440px (new: 1441px)

### Menu Structure
Complete navigation structure with submenus that can be migrated to:
1. Radix UI DropdownMenu
2. Simple Links (for pages that don't need dropdowns)
3. Maintain exact same menu data structure

### Migration Strategy
1. Keep menuItems.ts structure (it's clean and reusable)
2. Use Radix UI for dropdown behavior
3. Maintain exact colors and hover states
4. Preserve responsive menu behavior

---

## Dependencies Summary

### External Libraries Used
- `react-popper`: Custom dropdown positioning
- `react-dom`: Standard React DOM

### Component Relationships
- Header: Uses menuItems.ts for navigation structure
- HeaderTab: Uses Popper for dropdown rendering
- Menu structure: Used across Header → navigation items

---

## Implementation Priority

| Component | Priority | Reason |
|-----------|----------|--------|
| Popper | HIGH | Custom component, replace with Radix UI |
| Colors | MEDIUM | Already have token system |
| Breakpoints | MEDIUM | Already have system |
| MenuItems | LOW | Clean structure, easy to migrate |
| Utilities | LOW | Simple exports |