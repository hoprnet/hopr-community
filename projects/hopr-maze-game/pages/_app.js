import '../styles/globals.css'
import '../styles/App.css';
import '../components/board/index.css'
import '../components/win-overlay/index.css'
import NomSsrWrapper from '../components/NomSsrWrapper';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} /> //<NomSsrWrapper>
      
  //  </NomSsrWrapper>
}

export default MyApp
