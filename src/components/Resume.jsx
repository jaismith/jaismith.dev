import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import ReactMarkdown from 'react-markdown';
import { isMobile } from 'react-device-detect'
import OnVisible from 'react-on-visible';
import './stylesheets/Resume.scss';

const Resume = (props) => (
  <div className={`resume ${isMobile ? 'mobile' : ''}`}>
    <div className="resume-sidebar">
      <div className="resume-education">
        <div className="resume-sidebar-header">
          Education
        </div>
        {props.education.map((institution) => (
          <div key={shortid.generate()} className="resume-institution">
            <div className="resume-sidebar-item">
              {institution.name}, <i>{institution.location}</i>
            </div>
            {institution.details}
          </div>
        ))}
      </div>
      <div className="resume-organizations">
        <div className="resume-sidebar-header">
          Organizations
        </div>
        {props.organizations.map((organization) => (
          <div key={shortid.generate()} className="resume-organization">
            <div className="resume-sidebar-item">
              {organization.name}, <i>{organization.location}</i>
            </div>
            {organization.details}
          </div>
        ))}
      </div>
    </div>
    <div className="resume-experiences">
      <div className="resume-experiences-header">
        Experiences
      </div>
      {props.experiences.map((experience) => (
        <OnVisible
          key={shortid.generate()}
          className="resume-experience"
          percent={20}
        >
          <div className="resume-experience-header">
            <b>{experience.workplace}</b>, <i>{experience.location}</i>
          </div>
          <div className="resume-experience-summary">
            {experience.position}, {experience.timeframe}
          </div>
          <div className="resume-experience-description">
            <ReactMarkdown>{experience.description}</ReactMarkdown>
          </div>
        </OnVisible>
      ))}
    </div>
  </div>
);

Resume.propTypes = {
  education: PropTypes.array,
  organizations: PropTypes.array,
  experiences: PropTypes.array
};

Resume.defaultProps = {
  education: [],
  organizations: [],
  experiences: []
};

export default Resume;
