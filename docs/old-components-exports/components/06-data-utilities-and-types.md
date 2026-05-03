# Data Utilities and Types Analysis

## Type Definitions

### `src/types/api.ts`
```ts
export interface BooksData {
  id: string;
  title: string;
  author: string | null;
  authors: string[] | null;
  yearOfPublication: number;
  genre: string;
  ageRestriction: string;
  price: number;
  oldPrice: number | null;
  link: string;
  banner: string;
  trailerSrc: string;
  description: string[];
}
```

### `src/types/bookProps.ts`
```ts
import { BooksData } from './api';

export type TBookProps = {
  book: BooksData,
}
```

---

## Data Files

### `src/utils/booksData.ts`

Static mock data array of 6 books. Each book has:
- `id`, `title`, `author`/`authors`, `yearOfPublication`, `genre`, `ageRestriction`
- `price`, `oldPrice`, `link` (cover image path), `banner` (slider banner URL)
- `trailerSrc` (YouTube embed URL), `description` (string array of paragraphs)

Books in the dataset:
| ID | Title | Author(s) | Price | Old Price |
|----|-------|-----------|-------|-----------|
| 1  | Аристотель в Казахстане | О. Новокщёнов, А. Киреев, Д. Горшечников | 300 | — |
| 2  | DELETED | Катерина Кюне | 300 | 350 |
| 3  | КРАФТ | Георгий Панкратов | 300 | — |
| 4  | Аристотель в Казахстане | (same as #1) | 300 | — |
| 5  | DELETED | (same as #2) | 300 | 350 |
| 6  | КРАФТ | (same as #3) | 300 | — |

**Migration note**: New app uses Supabase — this mock data is for reference only.

---

### `src/utils/bookInfo.ts`
```ts
const getBookInfo = (id: string | string[] | undefined): BooksData | null => {
  let bookInfo = null;
  booksData.forEach((el) => {
    if (id === el.id) bookInfo = el;
  });
  return bookInfo;
};
```
Simple lookup by ID. In new app, this is a Supabase query.

---

### `src/utils/bookPropertiesData.tsx`

Returns an array of React elements for book detail properties:
```ts
const bookPropsList = [
  'Форматы: Fb2, Epub',
  'Кол-во символов: 355000',
  (
    <>
      <span>Рекомендуемые читалки:</span>
      <ReadersList>
        {readersList.map((reader) => (
          <ReadersItem>{reader}</ReadersItem>
        ))}
      </ReadersList>
    </>
  ),
];
```

Readers list: `['eBoox: Android | iPhone', 'FBReader: Android | iPhone', 'KyBooks: iPhone']`

Styles:
```scss
.ReadersList {
  display: flex;
  justify-content: space-between;

  @media (max-width: 1440px) { flex-wrap: wrap; }
  @media (max-width: 576px) { flex-direction: column; }
}

.ReadersItem {
  margin-right: 15px;

  @media (max-width: 1440px) { &:not(:last-child) { margin-bottom: 12px; } }
  @media (max-width: 576px) { &:not(:last-child) { margin-bottom: 4px; } }
}
```

**Migration note**: This data is hardcoded/static. In the new app, these properties should come from the Supabase book record.

---

### `src/utils/contactIconsData.ts`
```ts
const contactIconsSrc: string[] = [
  '/email.svg',
  '/instagram.svg',
  '/facebook.svg',
  '/telegram.svg',
  '/vk.svg',
];
```
Used in BookAuthor component for contact links. SVG paths in `public/`.

---

### `src/utils/Socials.ts`
```ts
interface ISocialItem {
  icon: SVGAElement,
  href: string,
}

const socials: ISocialItem[] = [
  { icon: IconInsta, href: 'http://instagram.com' },
  { icon: IconTelegram, href: 'http://t.me.com' },
  { icon: IconVk, href: 'http://vk.com' },
  { icon: IconFb, href: 'http://facebook.com' },
  { icon: IconTwitter, href: 'http://twitter.com' },
];
```
Used in Footer for social media links. Icons imported from `src/assets/icons/`.

---

### `src/utils/getCurrentYear.js`
```ts
const getCurrentYear = () => new Date().getFullYear();
export default getCurrentYear();
```
Used in Footer copyright text.

---

## Migration Mapping

| Old Utility | New Location | Notes |
|-------------|-------------|-------|
| `booksData.ts` | Supabase `books` table | Mock data → real DB |
| `bookInfo.ts` | Supabase query by ID | Replace with `api/books/` module |
| `bookPropertiesData.tsx` | Book entity / Supabase fields | Static → dynamic from DB |
| `contactIconsData.ts` | `src/assets/icons/` or inline SVGs | Direct SVG imports |
| `Socials.ts` | `src/consts/` | Rename to socials constant |
| `colors.ts` | SCSS variables / design tokens | Already in new project token system |
| `breakPoints.ts` | SCSS mixins | Already in new project |
| `menuItems.ts` | `src/consts/` | Navigation config |
| `types/api.ts` | `src/entities/books/server.ts` | Already exists in new project |
