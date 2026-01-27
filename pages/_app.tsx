import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import dynamic from 'next/dynamic';

import type { SiteContent, ProjectData, ExperienceData, ActivityPoint } from 'components/AsciiCanvas';

import 'styles/globals.scss';

// Dynamically import AsciiCanvas to avoid SSR issues with WASM
const AsciiCanvas = dynamic(
  () => import('components/AsciiCanvas').then(mod => mod.AsciiCanvas),
  { ssr: false }
);

interface PageProps {
  activity?: ActivityPoint[];
  projects?: ProjectData[];
  education?: Array<{ name: string; location: string; details: string }>;
  experiences?: ExperienceData[];
}

function App({ Component, pageProps }: { Component: React.ComponentType<PageProps>; pageProps: PageProps }) {
  const router = useRouter();
  const [systemDarkMode, setSystemDarkMode] = useState(false);
  const pathname = router.pathname;
  const isDarkMode = pathname === '/resume';

  useEffect(() => {
    // Initialize based on current preference
    if (typeof window !== 'undefined') {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemDarkMode(darkModeMediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setSystemDarkMode(e.matches);
      };
      
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Build the content object for AsciiCanvas
  const content: SiteContent = useMemo(() => {
    const isResume = pathname === '/resume';
    
    return {
      page: isResume ? 'resume' : 'projects',
      header: {
        name: 'Jai K. Smith',
        title: 'Software Engineer, Dartmouth Alum',
        location: 'New York, NY',
        profileImageId: 'profile',
        activity: pageProps.activity || [],
      },
      navigation: [
        { label: 'Projects', path: '/' },
        { label: 'Resume', path: '/resume' },
      ],
      activePath: pathname,
      projects: pageProps.projects || [],
      education: pageProps.education || [],
      experiences: pageProps.experiences || [],
      footer: {
        credits: 'Jai K. Smith (2020)',
        socialLinks: [
          'https://github.com/jaismith',
          'https://linkedin.com/in/jaiksmith',
        ],
        sourceUrl: 'https://github.com/jaismith/jaismith.dev',
      },
    };
  }, [pathname, pageProps]);

  // Build image URLs map
  const imageUrls = useMemo(() => {
    const urls = new Map<string, string>();
    urls.set('profile', '/media/profile-web.png');
    
    if (pageProps.projects) {
      for (const project of pageProps.projects) {
        urls.set(project.imageId, `/media/${project.imageId}.png`);
      }
    }
    
    return urls;
  }, [pageProps.projects]);

  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <link
          key={systemDarkMode ? "dark-mode" : "light-mode"}
          id="favicon"
          rel="icon"
          href={systemDarkMode ? "/faviconLight.ico" : "/faviconDark.ico"}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={isDarkMode ? '#181a1b' : '#000000'} />
        <meta
          name="description"
          content="My name is Jai Smith, I'm a Software Engineer and Dartmouth Alum. Rendered in ASCII."
        />
        <link rel="manifest" href="/manifest.json" />
        <title>Jai Smith - Software Engineer, Dartmouth Alum</title>
      </Helmet>
      <AsciiCanvas content={content} imageUrls={imageUrls} />
    </HelmetProvider>
  );
}

export default App;
