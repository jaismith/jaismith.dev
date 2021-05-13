import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga';

import Header, { HeaderProps, getStaticHeaderProps } from 'components/Header';
import Projects from 'components/Projects';

const genOptSrc = (imgName: string) => ({
  png: imgName + '.png',
  webp: imgName + '.webp',
});

const ProjectsPage = ({
  activity,
}: HeaderProps) => {
  const router = useRouter();

  // initialize google analytics
  ReactGA.initialize('UA-145221220-1');

  useEffect(
    () => {
      ReactGA.set({ page: router.pathname, });
      ReactGA.pageview(router.pathname);
    },
    [router.pathname]
  );

  return (
    <>
      <Header activity={activity} />
      <Projects
        projects={[
          {
            name: 'Give Essential',
            link: 'https://giveessential.org',
            org: 'Give Essential',
            date: 'Spring 2020 - Summer 2020',
            blurb: 'An online peer-to-peer matching platform that connects essential workers to donors who have financial and household resources to share. Founded by a team of Dartmouth students during the COVID-19 pandemic, Give Essential has facilitated over $1 million in in-kind donations from all 50 states, and works with over 200 volunteers. We aim to help over 50k families by the end of 2020.',
            img: {
              src: genOptSrc('/media/giveessential-web'),
              alt: 'Give Essential websites on Apple devices'
            },
          },
          {
            name: 'Dartmouth WiFi',
            org: 'DALI Lab',
            date: 'Winter 2020',
            blurb: 'Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth’s networking data to track issues and overloaded access points. This project is in the final stages of development and is on track for a public launch in Spring 2020.',
            img: {
              src: genOptSrc('/media/wirelesstool-web'),
              alt: 'Wireless Tool web app on Macbook Pro',
            },
          },
          {
            name: 'Fenceable',
            org: 'ENGS 021',
            date: 'Fall 2019',
            blurb: 'A wearable rack to facilitate easy deployment and collection of temporary electric fencing. Management-Intensive Rotational Grazing (which uses the aforementioned fencing) is a rapidly growing practice among organic farmers in the U.S., but no products currently exist on the market to facilitate its use. This product is U.S. Patent Pending as of November 2019, expiring November 2020.',
            img: {
              src: genOptSrc('/media/fenceable-web'),
              alt: 'Fenceable product image on white background',
            },
          },
          {
            name: 'Vidya',
            org: 'Kathmandu Living Labs',
            date: 'Summer 2019',
            blurb: 'Produced in partnership with a local Nepali school in Kathmandu, Vidya aims to increase parent involvement in student learning, something that has been historically difficult in the area. The app allows teachers to post positive feedback on student performance in a social media feed, alongside school announcements and homework assignments, as well as facilitates one-on-one instant messaging between teachers and parents. Vidya was launched in early 2020.',
            img: {
              src: genOptSrc('/media/kv-web'),
              alt: 'Product images of Vidya App on iPhone',
            },
          },
        ]}
      />
    </>
  );
};

export const getStaticProps = getStaticHeaderProps;

export default ProjectsPage;
