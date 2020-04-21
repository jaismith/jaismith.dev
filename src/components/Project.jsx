import React from 'react';
import PropTypes from 'prop-types';
import './Project.scss'

import wirelessTool from '../media/wirelesstool.png';

const Project = (props) => (
  <div className="project">
    <div className="project-title">
      <div className="project-title-main">
        ITC Wireless Tool
      </div>
      <div className="project-title-sub">
        <b>DALI Lab</b><br />
        Winter 2020
      </div>
    </div>
    <div className="project-content">
      <img
        src={wirelessTool}
        alt="Wireless Tool web app on Macbook Pro"
        className="project-content-showcase"
      />
      <div className="project-content-blurb">
        Dartmouth College is currently undergoing a multi-million dollar campus-wide upgrade to WiFi infrastructure. In order to prioritize upcoming building upgrades in high-traffic areas, Dartmouth ITC hired the DALI Lab to build a WiFi reporting tool that taps into Dartmouth’s networking data to track issues and overloaded access points. This project is in the final stages of development and will be publically launched later this Spring.
      </div>
    </div>
  </div>
);

Project.propTypes = {
  // bla: PropTypes.string,
};

Project.defaultProps = {
  // bla: 'test',
};

export default Project;
