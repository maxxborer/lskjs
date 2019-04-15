import Cookies from 'js-cookie';

function getWindowLocale() {
  const locale = window.navigator.userLanguage || window.navigator.language;
  if (!locale) return null;
  return locale.split('-')[0];
}

export default function getLocale() { // { uapp } = {}
  const uapp = this;
  if (__SERVER__ && uapp) {
    if (uapp.state && uapp.state.locale) return uapp.state.locale;
    if (uapp.state2 && uapp.state2.locale) return uapp.state2.locale;
    if (uapp.user && uapp.user.locale) return uapp.user.locale;
    if (uapp.req && uapp.req.cookies && uapp.req.cookies.locale) return uapp.req.cookies.locale;
  }
  if (__CLIENT__) {
    if (Cookies.get('locale')) return Cookies.get('locale');
    if (getWindowLocale()) return getWindowLocale();
  }
  return null;
}
