/**
 * Глобальный тип для svg файлов. Переписывает тип `any` который возвращает next.js
 * для избежания конфликтов между `svgr/webpack` и `babel-plugin-inline-react-svg`
 * @example
 * type CloseButton = {
 *  icon: SVGImage
 *  action: () => void
 * }
 */

type SVGImage = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

declare module '*.svg' {
  const Component: SVGImage;

  export default Component;
}
