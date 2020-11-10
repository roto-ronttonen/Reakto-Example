import { ApiServiceProvider } from "../services/api-service";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ApiServiceProvider>
      <Component {...pageProps} />
    </ApiServiceProvider>
  );
}

export default MyApp;
