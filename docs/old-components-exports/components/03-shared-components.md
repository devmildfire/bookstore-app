# Shared Components Analysis

## Overview
Shared components are reusable UI elements used across multiple pages.

## Component: `src/components/Common/Button.tsx`

### Dependencies
```tsx
import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components';
```

### Type Definition
```tsx
export type ButtonProps = {
  text: string,
  className?: string,
  isDisabled?: boolean,
  isLoading?: boolean,
  onClick?: () => void,
}
```

### Exact Styles
```scss
.ButtonWrap {
  .button {
    color: #FFFFFF;
    margin-top: 40px;

    background: transparent;
    border: 1px solid #FFFFFF;
    border-radius: 4px;
    cursor: pointer;
    transition: all .2s ease-out;

    &:hover {
      color: #930000;
      border: .5px solid rgb(220 220 220 / 50%);
    }

    &.isDisabled {
      cursor: default;

      &:active {
        transform: none;
      }
    }
  }

  .cardButtonBuy {
    width: 320px;
    height: 70px;
  }

  .counterButton {
    width: 70px;
    height: 70px;
    margin-top: 0;
  }
`;
```

### Component Structure
```tsx
<ButtonWrap>
  <button
    type='button'
    className={classNames('button', props.className, { isDisabled: isDisabled || isLoading })}
    onClick={!isDisabled && !isLoading ? props.onClick : undefined}
  >
    <span key={0}>{props.text}</span>
  </button>
</ButtonWrap>
```

### Key Measurements
- **Standard button**: Transparent background, 1px solid #FFFFFF border
- **Hover state**: #930000 text, .5px solid rgb(220 220 220 / 50%) border
- **Disabled state**: cursor default, no transform on active
- **Buy button**: 320px × 70px
- **Counter button**: 70px × 70px
- **Border radius**: 4px
- **Top margin**: 40px for standard button
- **Transition**: .2s ease-out

---

## Component: `src/components/Common/Counter.tsx`

### Dependencies
```tsx
import * as React from 'react';
import styled from 'styled-components';
import Button from './Button';
```

### Type Definition
```tsx
export type CounterProps = {
  className?: string
  value: number
  addToCart: () => void
  removeFromCart: () => void
}
```

### Exact Styles
```scss
.StyleWrapper {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 21px;
  font-weight: bold;
  user-select: none;
  width: 320px;
  height: 70px;

  .dropDownValue {
    margin: 0 5px;
    width: 38px;
    text-align: center;
    color: #FFFFFF;
  }
};
```

### Component Structure
```tsx
<StyleWrapper>
  <>
    <Button text='-' className='counterButton' onClick={removeFromCart} />
    <div className='dropDownValue'>{value}</div>
    <Button text='+' className='counterButton' onClick={addToCart} />
  </>
</StyleWrapper>
```

### Key Measurements
- **Total width**: 320px
- **Total height**: 70px
- **Value display**: 38px width, centered
- **Button size**: 70px × 70px
- **Spacing**: 5px between buttons and value
- **Top margin**: 40px

---

## Migration Notes for Update Branch

### Component Status
- **Button**: ✅ Already exists in new branch at `src/components/common/Button/`
- **Counter**: ✅ Already exists in new branch at `src/components/common/Counter/`

### Style Stack Mappings
- **Old**: styled-components with exact CSS values
- **New**: SCSS Modules with token system
- **Colors**: Map from #FFFFFF, #930000, #930000 (disabled), #DCDCDC to new token system
- **Typography**: Map 21px font-size to new font system

### Critical Style Preservations
1. **Button transparency**: MUST use transparent background with 1px solid #FFFFFF border
2. **Button hover**: MUST change to #930000 with .5px solid rgb(220 220 220 / 50%) border
3. **Border radius**: MUST be exactly 4px
4. **Disabled state**: MUST implement cursor default and prevent transform
5. **Counter dimensions**: 320px × 70px total, 70px × 70px buttons
6. **Value display**: 38px width, centered white text

### Component Relationships
- Button: Used in BookCard (buy action), BookProperties (action buttons)
- Counter: Used in BookCard (quantity control)
- Both appear multiple times across book-related pages

### Color Mappings
- **Old**: #FFFFFF (button text), #930000 (hover), #DCDCDC (border)
- **New Token System**: Map to appropriate tokens
  - #FFFFFF → $color-white
  - #930000 → $color-brand-primary (or custom)
  - #DCDCDC → $color-text-secondary
  - Disabled state → need custom token

---

## Dependencies Summary

### External Libraries Used
- `styled-components`: For exact CSS styling
- `classnames`: For conditional className concatenation

### Implementation Priority
1. **HIGH**: Update Button component styles to match exact old implementation
2. **HIGH**: Create/update Counter component with exact dimensions
3. **MEDIUM**: Ensure hover states match exactly
4. **MEDIUM**: Verify disabled state behavior

---

## Key Differences to Address

| Feature | Old | New Update Branch | Priority |
|---------|-----|------------------|--------|
| **Background** | Transparent | Transparent | ✅ |
| **Border** | 1px solid #FFFFFF | Different | **HIGH** |
| **Border Color** | #FFFFFF | Different | **HIGH** |
| **Border Radius** | 4px | Different | **HIGH** |
| **Hover Text** | #930000 | Different | **HIGH** |
| **Hover Border** | .5px solid rgb(220 220 220 / 50%) | Missing | **HIGH** |
| **Counter Width** | 320px | Different | **HIGH** |
| **Counter Height** | 70px | Different | **HIGH** |
| **Counter Buttons** | 70px × 70px | Different | **HIGH** |
| **Counter Value Width** | 38px | Different | **HIGH** |

---

## Implementation Checklist

### Button Component Update
- [ ] Verify current Button implementation
- [ ] Update styles to match old: transparent bg, 1px solid #FFFFFF border
- [ ] Add hover state: #930000 text, .5px solid rgb(220 220 220 / 50%) border
- [ ] Implement disabled state: cursor default, no transform
- [ ] Ensure border radius: 4px
- [ ] Test hover transitions (.2s ease-out)

### Counter Component Update
- [ ] Verify current Counter implementation
- [ ] Update wrapper: 320px × 70px total size
- [ ] Update buttons: 70px × 70px
- [ ] Update value display: 38px width, centered, white text
- [ ] Verify minus button: 70px × 70px
- [ ] Verify plus button: 70px × 70px
- [ ] Ensure proper spacing: 5px between elements

---

## Migration Strategy

### Phase 1: Foundation
1. Update existing Button styles
2. Create/update Counter component

### Phase 2: Visual Match
1. Ensure exact dimensions
2. Match hover behaviors
3. Match disabled states
4. Test with mock data

### Phase 3: Integration
1. Replace old components in pages
2. Test component interactions
3. Verify responsive behavior
