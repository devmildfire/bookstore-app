import { promoStore } from '@/store/PromoStore';
import { observer } from 'mobx-react-lite';
import styled, { keyframes } from 'styled-components';

interface promoMessageProps {
  className: string;
}

const PromoMessage = observer(
  ({ className }: promoMessageProps): React.ReactElement => {
    let message = <div></div>;

    promoStore.promoCode === null &&
      !promoStore.codeEntered &&
      promoStore.showRules &&
      !promoStore.rulesShown &&
      (message = (
        <div className={'shownDiv extraDiv'}>
          <h3>как работают промокоды:</h3>
          <div>- К заказу можно применить только один промокод.</div>
          <div>
            - Если промокод применить для товаров, для которых уже действуют
            скидки, то действует только одна, наибольшая из двух скидок.
          </div>
        </div>
      ));

    promoStore.promoCode === null &&
      promoStore.codeEntered &&
      (message = <div className='shownDiv'>Такого промокода мы не знаем.</div>);

    if (promoStore.promoCode) {
      !promoStore.codeDiscountIsValid &&
        (message = (
          <div className='shownDiv'>
            Скидка по введённому промокоду меньше скидки, которая уже действует.
          </div>
        ));

      !promoStore.codeItemIsValid &&
        (message = (
          <div className='shownDiv'>
            Продукта, для которого работает введённый промокод, нет в корзине.
          </div>
        ));

      !promoStore.codeDatesAreValid &&
        (message = (
          <div className='shownDiv'>
            Период действия введённого промокода истёк либо ещё не начался.
          </div>
        ));

      promoStore.codeIsValid &&
        (message = (
          <div className='shownDiv'>
            применён промокод {promoStore.promoCode.code}: действует скидка{' '}
            {promoStore.promoCode.discount}% на
            {promoStore.promoCode.type === 'cart'
              ? ' всю корзину.'
              : ' издание "' +
                promoStore.promoCode.product_name +
                '" - ' +
                promoStore.promoCode.product_type +
                '.'}
          </div>
        ));
    }

    return <div className={className}>{message}</div>;
  }
);

const slideDown = keyframes`
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    50% {
      transform: translateY(0%);
      opacity: 1;  
    }
    to {
      transform: translateY(0%);
      opacity: 1;
    }
  `;

export const StyledPromoMessage = styled(PromoMessage)`
  .shownDiv {
    animation: ${slideDown} 0.4s linear;
    background-color: #202020;
    padding: 20px;
    border-radius: 4px;
    text-align: center;

    div {
      text-align: left;
    }
  }
`;
