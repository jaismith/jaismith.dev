import React from 'react';
import {
  NavLink, withRouter
} from 'react-router-dom';
import './stylesheets/NavBar.scss';

const NavBar = props => (
  <div className="nav-container">
    <div className={`nav ${props.darkMode ? 'dark' : 'light'}`}>
      <NavLink 
        className="nav-item"
        activeClassName="selected"
        to='/projects'
      >
        Projects
      </NavLink>
      <NavLink
        className="nav-item"
        activeClassName="selected"
        to='/resume'
      >
        Resume
      </NavLink>
    </div>
  </div>
);

export default withRouter(NavBar);
