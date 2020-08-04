import React from 'react';
import PropTypes from 'prop-types';
import { isMobile } from 'react-device-detect';
import OnVisible from 'react-on-visible';
import './stylesheets/Project.scss'

const Project = (props) => (
  <OnVisible
    className={`project ${props.flipped ? 'flipped' : ''} ${isMobile ? 'mobile' : ''}`}
    percent={20}
  >
    <div className="project-title">
      <div className="project-title-main">
        {props.name}
      </div>
      <div className="project-title-sub">
        <b>{props.org}</b><br />
        {props.date}
      </div>
    </div>
    <div className={props.flipped ? 'project-content flipped' : 'project-content'}>
      <img
        src={props.img.src}
        alt={props.img.alt}
        className="project-content-showcase"
      />
      <div className="project-content-blurb">
        {props.blurb}
      </div>
    </div>
  </OnVisible>
);

Project.propTypes = {
  name: PropTypes.string,
  org: PropTypes.string,
  date: PropTypes.string,
  blurb: PropTypes.string,
  img: PropTypes.object,
  flipped: PropTypes.bool
};

Project.defaultProps = {
  name: 'Project Name',
  org: 'Organization',
  date: 'Season Year',
  blurb: 'What is this?',
  img: 'media/...',
  flipped: false,
};

export default Project;
