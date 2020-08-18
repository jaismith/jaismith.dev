import React, { useEffect } from 'react';
import './App.scss';
import {
  Route, Switch, Redirect, useLocation,
} from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import ReactGA from 'react-ga';

import NavBar from './components/NavBar';
import Header from './components/Header';
import Project from './components/Project';
import Footer from './components/Footer';
import Resume from './components/Resume';

function App() {
  let location = useLocation();

  // initialize google analytics
  ReactGA.initialize('UA-145221220-1');

  useEffect(
    () => {
      ReactGA.set({ page: location.pathname, });
      ReactGA.pageview(location.pathname);
    },
    [location]
  );
  
  // detect dark-mode page
  let darkMode = ['/resume'].includes(location.pathname);

  // set background
  if (darkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  return (
    <div className={`app ${isMobile ? 'mobile' : ''} ${darkMode ? 'dark' : 'light'}`}>
      <NavBar
        darkMode={darkMode}
      />
      <Header
        darkMode={darkMode}
      />
      <Switch>
        <Route path='/projects'>
          <div className="app-projects">
            <Project
              name='Dartmouth WiFi'
              org='DALI Lab'
              date='Winter 2020'
              blurb='Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth’s networking data to track issues and overloaded access points. This project is in the final stages of development and is on track for a public launch in Spring 2020.'
              img={{
                src: require('./media/wirelesstool-web.png'),
                alt: 'Wireless Tool web app on Macbook Pro'
              }}
            />
            <Project
              name='Fenceable'
              org='ENGS 021'
              date='Fall 2019'
              blurb='A wearable rack to facilitate easy deployment and collection of temporary electric fencing. Management-Intensive Rotational Grazing (which uses the aforementioned fencing) is a rapidly growing practice among organic farmers in the U.S., but no products currently exist on the market to facilitate its use. This product is U.S. Patent Pending as of November 2019, expiring November 2020.'
              img={{
                src: require('./media/fenceable-web.png'),
                alt: 'Fenceable product image on white background'
              }}
              flipped
            />
            <Project
              name='Vidya'
              org='Kathmandu Living Labs'
              date='Summer 2019'
              blurb='Produced in partnership with a local Nepali school in Kathmandu, Vidya aims to increase parent involvement in student learning, something that has been historically difficult in the area. The app allows teachers to post positive feedback on student performance in a social media feed, alongside school announcements and homework assignments, as well as facilitates one-on-one instant messaging between teachers and parents. Vidya was launched in early 2020.'
              img={{
                src: require('./media/kv-web.png'),
                alt: 'Product images of Vidya App on iPhone'
              }}
            />
          </div>
        </Route>
        <Route path='/resume'>
          <Resume
            education={[
              {
                name: 'Dartmouth College',
                location: 'Hanover, NH',
                details: 'Bachelor of Computer Science (2018-2022)'
              }
            ]}
            organizations={[
              {
                name: 'Give Essential',
                location: 'USA',
                details: 'Humanitarian Aid | Developer'
              },
              {
                name: 'HackDartmouth',
                location: 'Hanover, NH',
                details: 'Education | Developer, Organizer'
              },
              {
                name: 'Ledyard Canoe Club',
                location: 'Hanover, NH',
                details: 'Outdoor Rec | Flatwater Leader'
              }
            ]}
            experiences={[
              {
                workplace: 'DALI Lab',
                location: 'Hanover, NH',
                position: 'Software Engineer (Dev II)',
                timeframe: 'January 2019 - Present',
                description: '- Led a team of engineers in creating a reporting system to trace Wi-Fi complaints to access-points within the Dartmouth network; aggregating data from thousands of users to guide an ongoing multi-million-dollar campus infrastructure upgrade.\n' +
                            '- Currently developing a highly customizable personal productivity web application using ReactJS and Cloud Firestore, targeting a private beta during Summer 2020 and set to be presented before investors later this year.',
              },
              {
                workplace: 'Kathmandu Living Labs',
                location: 'Kathmandu, Nepal',
                position: 'Software Engineer (iOS Developer)',
                timeframe: 'June 2019 - August 2019',
                description: '- Lead iOS developer on a platform aiming to increase parent involvement in student learning at a local Nepali high school, now fully integrated with over 450 active users (responsible for the majority of the iOS user interface and frameworks).\n' +
                            '- Learned about the roles of software development, humanitarian engineering, and open data in Nepal.',
              },
              {
                workplace: 'Give Essential',
                location: 'USA',
                position: 'Volunteer Developer (Full Stack)',
                timeframe: 'April 2020 - Present',
                description: '- Streamlined signup and matching process for essential workers nationwide and donors with extra household supplies during the COVID-19 pandemic via an Express API integrated with Cloud Firestore; eliminating manual bottlenecks and helping the program to reach thousands of people, facilitate over $100k of individual donations, and secure over $60K in funding.\n' +
                            '- Built portal allowing 100+ volunteers to oversee and facilitate thousands of ongoing essential worker/donor matches.',
              },
              {
                workplace: 'Dartmouth Formula Racing',
                location: 'Hanover, NH',
                position: 'Engineer',
                timeframe: 'September 2018 - Present',
                description: '- Helped to design and build the vehicle wiring harness for the 2019 competition vehicle.\n' +
                            '- Designed and manufactured module to convert raw sensor signals to CAN messages using Altium Designer, SolidWorks, and C, simplifying the wiring harness and making it easier to add new sensors to the vehicle in the future.'
              },
              {
                workplace: 'HackDartmouth',
                location: 'Hanover, NH',
                position: 'Contestant, Organizer, Lead Developer',
                timeframe: 'April 2019 - Present',
                description: '- Developed an offline instant messaging app as a contestant in 2019 using Bluetooth/Wi-Fi Direct mesh technology to send end-to-end encrypted messages over a decentralized network of nearby smartphones (awarded over $1k by Facebook).\n' +
                            '- Lead developer of club website, our public facing portal for sponsors and hundreds of applicants nationwide.\n' +
                            '- Responsible for holding workshops on campus to teach beginner developers languages like JavaScript, HTML, and CSS.',
              },
            ]}
            />
        </Route>
        <Route path='/'>
          <Redirect to='/projects' />
        </Route>
      </Switch>
      <Footer socialMedia={[
        'https://twitter.com/jksmithnyc',
        'https://github.com/jaismith',
        'https://www.instagram.com/jai.k.smith/',
        'https://linkedin.com/in/jaiksmith',
        'https://www.facebook.com/jai.smith.22'
      ]}/>
    </div>
  );
}

export default App;
