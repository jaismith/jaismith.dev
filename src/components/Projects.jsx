import React from 'react';
import PropTypes from 'prop-types';
import { generateKey } from '../helpers';

import Project from './Project';

const Projects = (props) => (
  <div>
    {props.projects.map((project, index) => (
      <Project
        key={generateKey([project.name, project.org])}
        {...project}
        flipped={index % 2 === 1}
      />
    ))}
  </div>
);

Projects.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    link: PropTypes.string,
    org: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    blurb: PropTypes.string.isRequired,
    img: PropTypes.shape({
      src: PropTypes.shape({
        png: PropTypes.string.isRequired,
        webp: PropTypes.string.isRequired,
      }).isRequired,
      alt: PropTypes.string.isRequired,
    }).isRequired,
  }))
};

export default Projects;
