import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import Header from './components/Header';
import Project from './components/Project';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Switch>
          <Route path='/'>
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
              name='ITC Wireless Tool'
              org='DALI Lab'
              date='Winter 2020'
              blurb='Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth’s networking data to track issues and overloaded access points. This project is in the final stages of development and is on track for a public launch in Spring 2020.'
              img={{
                src: require('./media/wirelesstool.png'),
                alt: 'Wireless Tool web app on Macbook Pro'
              }}
              flipped
            />
          </Route>
          <Route path='/resume'>
            
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
