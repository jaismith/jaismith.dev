import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route, Switch, Redirect,
} from 'react-router-dom';

import NavBar from './components/NavBar';
import Header from './components/Header';
import Project from './components/Project';
import Footer from './components/Footer';
import Resume from './components/Resume';

function App() {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <Header />
        <Switch>
          <Route path='/projects'>
            <div className="app-projects">
              <Project 
                name='ITC Wireless Tool'
                org='DALI Lab'
                date='Winter 2020'
                blurb='Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth’s networking data to track issues and overloaded access points. This project is in the final stages of development and is on track for a public launch in Spring 2020.'
                img={{
                  src: require('./media/wirelesstool.png'),
                  alt: 'Wireless Tool web app on Macbook Pro'
                }}
              />
              <Project 
                name='Fenceable'
                org='ENGS 021'
                date='Fall 2019'
                blurb='A wearable rack to facilitate easy deployment and collection of temporary electric fencing. Management-Intensive Rotational Grazing (which uses the aforementioned fencing) is a rapidly growing practice among organic farmers in the U.S., but no products currently exist on the market to facilitate its use. This product is U.S. Patent Pending as of November 2019, expiring November 2020.'
                img={{
                  src: require('./media/fenceable.png'),
                  alt: 'Fenceable product image on white background'
                }}
                flipped
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
                  details: 'Humanitarian Aid, Developer'
                },
                {
                  name: 'HackDartmouth',
                  location: 'Hanover, NH',
                  details: 'Developer, Organizer'
                }
              ]}
              experiences={[
                {
                  logo: require('./media/dali.png'),
                  workplace: 'DALI Lab',
                  location: 'Hanover, NH',
                  position: 'Software Engineer (Dev II)',
                  timeframe: 'January, 2019 - Present',
                  description: '- Software engineer on projects like ITC Wireless Tool and Whiteboard Planning app.'
                },
                {
                  logo: require('./media/kll.png'),
                  workplace: 'Kathmandu Living Labs',
                  location: 'Kathmandu, Nepal',
                  position: 'Software Engineer (iOS Developer)',
                  timeframe: 'June 2019 - August 2019',
                  description: '- Created an app with a team of developers to facilitate parent-teacher communication at a local Nepali high school, developing the majority of the user interface and framework for the project’s iOS client.\n' +
                               '- Learned about the roles of software development, humanitarian engineering, and open data in Nepal.',
                }
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
    </Router>
  );
}

export default App;
