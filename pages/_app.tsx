import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Helmet } from 'react-helmet';
import classes from 'utils/classes';

import NavBar from 'components/NavBar';
import Footer from 'components/Footer';

import 'styles/globals.scss';

function App({ Component, pageProps }) {
  const [systemDarkMode, setSystemDarkMode] = useState(false);
  const darkMode = ['/resume'].includes(useRouter().pathname);

  useEffect(() => {
    setSystemDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  return (
    <div className={classes('app', darkMode ? 'dark' : 'light')}>
      <Helmet>
        <meta charSet="utf-8" />
        {systemDarkMode
          ? <link id="faviconLight" rel="icon" href="/faviconLight.ico" />
          : <link id="faviconDark" rel="icon" href="/faviconDark.ico" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={darkMode ? 'black' : 'white'} />
        <meta
          name="description"
          content="My name is Jai Smith, I'm a Junior at Dartmouth College studying Computer Science."
        />
        <link rel="manifest" href="/manifest.json" />
        <title>Jai Smith - Software Engineer, Dartmouth Undergrad</title>
      </Helmet>
      <NavBar />
      <Component {...pageProps} />
      <Footer socialMedia={[
        'https://twitter.com/jksmithnyc',
        'https://github.com/jaismith',
        'https://linkedin.com/in/jaiksmith',
      ]}/>
    </div>
  );
};

export default App;
