/**
 * @originalBy Dave Gabaraev <dave@uncodegem.com>
 * @author Ivan Proskuriakov <snowflax@ya.ru>
 * @description Интефейс для использования сервиса ROBOKASSA с javaScript / nodeJS.
 *
 * @description default config: MD5 HASH
 * Документация ROBOKASSA - https://docs.robokassa.ru/
 */

import md5 from 'md5';

const ROBOKASSA_PAY_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx';

/**
 * @var shopIdentifier - Идентификатор магазина, прописанный в разделе «Технические настройки» Вашего магазина
 *
 * @var password1 - Пароль магазина
 * @var password2 - Пароль магазина 2
 *
 * @var outSum - Сумма оплаты в единицах валюты OutCurrLabel
 *
 * @var invId - Номер счета в магазине сгенерированный вами.
 *
 * @var SignatureValue - Контрольная сумма - хэш, число в 16-ричной форме и в верхнем регистре (0-9, A-F), рассчитанное методом указанным в Технических настройках магазина.
 */

class Robokaska {
  constructor(config) {
    const { shopIdentifier, password1, password2, testMode = false } = config;

    this.shopIdentifier = shopIdentifier;
    this.password1 = password1;
    this.password2 = password2;
    this.testMode = testMode;
  }

  /**
   * @description Формирование подписи
   * @param {string} outSum
   * @param {number} invId
   */
  generateSignature(outSum, invId) {
    return md5(`${this.shopIdentifier}:${outSum}:${invId}:${this.password1}`);
  }

  /**
   * @description Создание ссылки для редиректа или перехода на страницу оплаты
   * @param {number} invId
   * @param {string} email - Электронная почта покупателя для уведомления о заказе
   * @param {string} outSum
   * @param {string} description - Описание заказа (строка)
   */
  generateUrl(invId, email, outSum, description) {
    const signature = this.generateSignature(outSum, invId);
    const encodedDescription = encodeURIComponent(description);
    const encodedEmail = encodeURIComponent(email);

    // Можно дописать любые параметры по желанию
    const query = `?MerchantLogin=${
      this.shopIdentifier
    }&OutSum=${outSum}&Description=${encodedDescription}&SignatureValue=${signature}&Encoding=UTF-8&InvId=${invId}&Email=${encodedEmail}${
      this.testMode ? '&IsTest=1' : ''
    }`;

    return `${ROBOKASSA_PAY_URL}${query}`;
  }

  /**
   * @description Проверка валидности подписи для адреса перенаправления SuccessURL
   * параметр outSum должен быть в формате строки из числа с плавающей точкой,
   * с двумя знаками после запятой, например 20.00
   * Именно такое значение использует Робокасса для формирования
   * значения SignatureValue при перенаправлении пользователя на SuccessURL
   *
   * @param {string} outSum
   * @param {number} invId
   * @param {string} SignatureValue
   */
  checkSuccessURLsignature(invId, outSum, SignatureValue) {
    return SignatureValue === md5(`${outSum}:${invId}:${this.password2}`);
  }

  /**
   * @description Проверка валидности ответной подписи
   * @param {number} outSum
   * @param {number} invId
   * @param {string} SignatureValue
   */
  checkPay(invId, outSum, SignatureValue) {
    // Робокасса возвращает обратно эти значения
    return (
      SignatureValue ===
      md5(`${Math.round(outSum)}:${invId}:${this.password2}`).toUpperCase()
    );
  }
}

export default Robokaska;
