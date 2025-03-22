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
    // Initialize based on current preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDarkMode(darkModeMediaQuery.matches);

    // Listen for changes in system theme
    const handleChange = (e) => {
      setSystemDarkMode(e.matches);
    };
    
    // Add listener for theme changes
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    // Clean up listener on unmount
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className={classes('app', darkMode ? 'dark' : 'light')}>
      <Helmet>
        <meta charSet="utf-8" />
        <link
          key={systemDarkMode ? "dark-mode" : "light-mode"}
          id="favicon"
          rel="icon"
          href={systemDarkMode ? "/faviconLight.ico" : "/faviconDark.ico"}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={darkMode ? '#181a1b' : 'white'} />
        <meta
          name="description"
          content="My name is Jai Smith, I'm a Software Engineer and Dartmouth Alum."
        />
        <link rel="manifest" href="/manifest.json" />
        <title>Jai Smith - Software Engineer, Dartmouth Alum</title>
      </Helmet>
      <NavBar />
      <Component {...pageProps} />
      <Footer socialMedia={[
        'https://github.com/jaismith',
        'https://linkedin.com/in/jaiksmith',
      ]}/>
    </div>
  );
};

export default App;
