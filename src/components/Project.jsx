import React from 'react';
import PropTypes from 'prop-types';
import './Project.scss'

import wirelessTool from '../media/wirelesstool.png';

const Project = (props) => (
  <div className={props.flipped ? 'project flipped' : 'project'}>
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
  </div>
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
