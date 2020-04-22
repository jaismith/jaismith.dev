import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  NavLink,
  withRouter
} from 'react-router-dom'
import './Header.scss';

import profile from '../media/profile.jpeg';

class Header extends PureComponent { 
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  // componentWillMount = () => {
  //   console.log('Header will mount');
  // }

  // componentDidMount = () => {
  //   console.log('Header mounted');
  // }

  // componentWillReceiveProps = (nextProps) => {
  //   console.log('Header will receive props', nextProps);
  // }

  // componentWillUpdate = (nextProps, nextState) => {
  //   console.log('Header will update', nextProps, nextState);
  // }

  // componentDidUpdate = () => {
  //   console.log('Header did update');
  // }

  // componentWillUnmount = () => {
  //   console.log('Header will unmount');
  // }

  render () {
    return (
      <div className="header">
        <div className="header-box">
          <img
            className="header-pic"
            src={profile}
            alt="Self-Portrait"
          />
          <div className="header-title">
            <div className="header-title-main">
              Jai K. Smith
            </div>
            <div className="header-title-sub">
              Software Engineer, Dartmouth Undergrad<br />
              <i>New York, NY</i>
            </div>
          </div>
        </div>
        <div className="header-nav">
          <div className="header-active-highlight" />
          <NavLink 
            className="header-nav-item"
            activeClassName="selected"
            to='/projects'>
            Projects
          </NavLink>
          <NavLink
            className="header-nav-item"
            activeClassName="selected"
            to='/resume'>
            Resume
          </NavLink>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  // bla: PropTypes.string,
};

Header.defaultProps = {
  // bla: 'test',
};

export default withRouter(Header);
