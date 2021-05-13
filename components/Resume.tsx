import React from 'react';
import ReactMarkdown from 'react-markdown';
import { isMobile } from 'react-device-detect'
import OnVisible from 'react-on-visible';
import generateKey from 'utils/keygen';
import classes from 'utils/classes';

import styles from 'styles/Resume.module.scss';

type Entity = {
  name: string;
  location: string;
  details: string;
};

type Experience = {
  workplace: string;
  location: string;
  position: string;
  timeframe: string;
  description: string;
};

type ResumeProps = {
  education: Entity[];
  organizations: Entity[];
  experiences: Experience[];
};

const Resume = ({
  education,
  organizations,
  experiences
}: ResumeProps) => (
  <div className={classes(styles.resume, isMobile && styles.mobile)}>
    <div className={styles.resumeSidebar}>
      <div className={styles.resumeEducation}>
        <div className={styles.resumeSidebarHeader}>
          Education
        </div>
        {education.map((institution) => (
          <div
            key={generateKey([institution.name, institution.location])}
            className={styles.resumeInstitution}
          >
            <div className={styles.resumeSidebarItem}>
              {institution.name}, <i>{institution.location}</i>
            </div>
            {institution.details}
          </div>
        ))}
      </div>
      <div className={styles.resumeOrganizations}>
        <div className={styles.resumeSidebarHeader}>
          Organizations
        </div>
        {organizations.map((organization) => (
          <div
            key={generateKey([organization.name, organization.location])}
            className={styles.resumeOrganization}
          >
            <div className={styles.resumeSidebarItem}>
              {organization.name}, <i>{organization.location}</i>
            </div>
            {organization.details}
          </div>
        ))}
      </div>
    </div>
    <div className={styles.resumeExperiences}>
      <div className={styles.resumeExperiencesHeader}>
        Experiences
      </div>
      {experiences.map((experience) => (
        <OnVisible
          key={generateKey([experience.workplace, experience.location])}
          className={styles.resumeExperience}
          visibleClassName={styles.visible}
          percent={20}
        >
          <div className={styles.resumeExperienceHeader}>
            <b>{experience.workplace}</b>, <i>{experience.location}</i>
          </div>
          <div className={styles.resumeExperienceSummary}>
            {experience.position}, {experience.timeframe}
          </div>
          <div className={styles.resumeExperienceDescription}>
            <ReactMarkdown>{experience.description}</ReactMarkdown>
          </div>
        </OnVisible>
      ))}
    </div>
  </div>
);

export default Resume;
