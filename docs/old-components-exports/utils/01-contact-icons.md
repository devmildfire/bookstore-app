# Contact Icons Data Utility Analysis

## Component: `src/utils/contactIconsData.ts`

### Dependencies
```tsx
import contactIconsData from './contactIconsData';
```

### Data Structure
This is a data export file that imports `contactIconsData`.

---

## Migration Notes for Update Branch

### Data Structure
- Old site uses separate icon data utilities
- Need to verify if contact icons are used in Header/Footer
- May need to consolidate or map to new icon system

### Icon Sources
Based on Footer component analysis, social icons are stored as separate SVG files:
- `src/assets/icons/footer-insta.svg`
- `src/assets/icons/footer-telegram.svg`
- `src/assets/icons/footer-vk.svg`
- `src/assets/icons/footer-facebook.svg`
- `src/assets/icons/footer-twitter.svg`
- `src/assets/icons/footer-logo.svg`

### Migration Strategy
1. Keep SVG imports as separate files
2. Use Radix UI Icon components or inline SVGs
3. Maintain exact hover states (all icons turn ${colors.redBase} on hover)
4. Ensure proper alt text for accessibility

---

## Dependencies Summary

### External Libraries Used
- No external libraries for this utility file

### Component Relationships
- Used by: `src/components/PageLayout/Footer.tsx`
- Provides social media icon URLs and data
