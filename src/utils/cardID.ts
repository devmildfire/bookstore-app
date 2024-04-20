import { hasCookie, setCookie, getCookie } from 'cookies-next';
import { v4 as uuidv4 } from 'uuid';

function checkCartCookie() {
  const cookie = hasCookie('cartID', { path: '/' })
    ? getCookie('cartID', { path: '/' })
    : '';

  return cookie ? true : false;
}

function setCartCookie() {
  const cookieString = uuidv4();
  setCookie('cartID', cookieString, {
    path: '/',
    sameSite: 'none',
    secure: true,
  });
}

function setOrGetCartCookie() {
  !checkCartCookie() && setCartCookie();
  return getCookie('cartID', { path: '/' });
}

export { checkCartCookie, setCartCookie, setOrGetCartCookie };
