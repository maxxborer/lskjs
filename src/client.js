import ready from 'lego-starter-kit/utils/polyfill';
import 'react-bootstrap-card/react-bootstrap-polyfill';
import App from './App';
import config from './config';
ready();
const app = new App({ config });
app.start();
