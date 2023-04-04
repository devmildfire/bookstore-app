/**
 *
 * @param array массив который состоит из объектов
 * @returns  массив с объектами, у каждого из которых добавлено полей key с
 * "уникальным" ключом
 *
 */
// interface Obj {
//   [k: string]: any;
// }

// const setUUIDField = (array: Obj[]): Obj[] => {
//   return array.map((item) => {
//     item = { ...item, key: Math.random() * 1000 };
//     return item;
//   });
// };

function makeid(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const setUUIDField = (array: any[]): any[] => {
  return array.map((item: any) => {
    item = { ...item, key: makeid(32) };
    return item;
  });
};

export default setUUIDField;
