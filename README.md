# Chtivo

Новый сайт Чтива

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Правила

1. Все страницы хранятся в папках и экспортируются через index файл, стили для них прописываются в этом же файле ниже
2. На вложенные страницы создаются подпапки с правилом из пункта 1
3. Для каждого компонента создается своя папка в которой должно быть: одноименный файл с компонентом, файл со стилями styles.ts, экспортирующий файл index.ts и опциональный types.ts с общими для компонента и стилей типами
4. Все иконки помещаются в папку assets/icons, картинки в assets/images и импортируются в нужный компонент
5. Временные данные помещаются в отдельный файл в папке mocks
