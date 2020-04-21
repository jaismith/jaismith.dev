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
          <Route path='/projects'>
            <Project />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
