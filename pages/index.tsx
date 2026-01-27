import { GetStaticProps } from 'next';
import { getActivity, Datapoint } from 'utils/activity';
import type { ProjectData, ActivityPoint } from 'components/AsciiCanvas';

// Map image names to IDs
const getImageId = (imgName: string) => {
  const match = imgName.match(/\/media\/([^.]+)/);
  return match ? match[1] : imgName;
};

interface ProjectsPageProps {
  activity: ActivityPoint[];
  projects: ProjectData[];
}

export const getStaticProps: GetStaticProps<ProjectsPageProps> = async () => {
  let activity: Datapoint[] = [{ x: 0, y: 0 }];
  try {
    activity = await getActivity();
  } catch (e) {
    console.log('Failed to load activity:', e);
  }

  const projects: ProjectData[] = [
    {
      name: 'Flowcast',
      link: 'https://flowcast.jaismith.dev',
      org: 'Personal',
      date: 'January 2023 - Present',
      blurb: 'Forecasting stream conditions throughout the United States using neural networks, and generating fishing reports with machine learning. A playground product to try new APIs, experiment with new serverless frameworks, and keep myself learning.',
      imageId: 'flowcast',
    },
    {
      name: 'Live Event Advertising',
      link: 'https://advertising.amazon.com',
      org: 'Amazon',
      date: 'October 2022 - Present',
      blurb: 'Building novel solutions that extend cutting-edge ad interactivity and targeting capabilities typically found streaming TV to live sports. Scaling massive systems, and designing some of Amazon\'s first generative-AI powered adtech systems.',
      imageId: 'prime-video-ads',
    },
    {
      name: 'Line at Dartmouth',
      link: 'https://www.thedartmouth.com/article/2022/04/new-linedartmouth-app-displays-wait-times-at-campus-hotspots',
      org: 'Dartmouth Capstone',
      date: 'September 2021 - April 2022',
      blurb: 'A mobile app that tracks wait times at popular campus dining locations and study space usage around Dartmouth. Built as a spiritual successor to "Line@KAF", Line at Dartmouth leverages the campus Wi-Fi network to anonymously monitor hotspots using device dwell time.',
      imageId: 'linedartmouth',
    },
    {
      name: 'Skiff',
      link: 'https://skiff.org',
      org: 'Skiff',
      date: 'December 2020 - June 2021',
      blurb: 'The first fully end-to-end encrypted alternative to Google\'s collaboration suite. Complete with expiring links, password protection, and fine access controls, Skiff provides a privacy centric solution to collaborative document editing. The team raised a 3.7 million dollar round in 2021, led by Sequoia.',
      imageId: 'skiff-web',
    },
    {
      name: 'Give Essential',
      link: 'https://giveessential.org',
      org: 'Give Essential',
      date: 'Spring 2020 - Summer 2020',
      blurb: 'An online peer-to-peer matching platform that connects essential workers to donors who have financial and household resources to share. Founded by a team of Dartmouth students during the COVID-19 pandemic, Give Essential has facilitated over $1 million in in-kind donations from all 50 states.',
      imageId: 'giveessential-web',
    },
    {
      name: 'Dartmouth WiFi',
      link: null,
      org: 'DALI Lab',
      date: 'Winter 2020',
      blurb: 'Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth\'s networking data to track issues.',
      imageId: 'wirelesstool-web',
    },
    {
      name: 'Fenceable',
      link: null,
      org: 'ENGS 021',
      date: 'Fall 2019',
      blurb: 'A wearable rack to facilitate easy deployment and collection of temporary electric fencing. Management-Intensive Rotational Grazing is a rapidly growing practice among organic farmers in the U.S., but no products currently exist on the market to facilitate its use. U.S. Patent Pending.',
      imageId: 'fenceable-web',
    },
    {
      name: 'Vidya',
      link: null,
      org: 'Kathmandu Living Labs',
      date: 'Summer 2019',
      blurb: 'Produced in partnership with a local Nepali school in Kathmandu, Vidya aims to increase parent involvement in student learning. The app allows teachers to post positive feedback on student performance in a social media feed, alongside school announcements and homework assignments.',
      imageId: 'kv-web',
    },
  ];

  return {
    props: {
      activity: activity.map(d => ({ x: d.x, y: d.y })),
      projects,
    },
    revalidate: 3600,
  };
};

// This page component doesn't render anything directly - _app.tsx handles everything
export default function ProjectsPage(props: ProjectsPageProps) {
  return null;
}
