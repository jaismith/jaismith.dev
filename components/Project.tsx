import { isMobile } from 'react-device-detect';
import OnVisible from 'react-on-visible';
import classes from 'utils/classes';

import styles from 'styles/Project.module.scss'

export type ProjectType = {
  name: string;
  org: string;
  date: string;
  blurb: string;
  // img: {
  //   src: string
  //   alt: string;
  // };
  img: any,
  link?: string;
};

type ProjectProps = {
  project: ProjectType;
  flipped: boolean;
};

const Project = ({
  project,
  flipped
}: ProjectProps) => (
  <OnVisible
    visibleClassName={styles.visible}
    className={classes(styles.project, flipped && styles.flipped, isMobile && styles.mobile)}
    percent={20}
  >
    <div className={styles.projectTitle}>
      <div className={styles.projectTitleMain}>
        {project.link
          ? (
            <a href={project.link}>
              {project.name}
            </a>
          ) : project.name}
      </div>
      <div className={styles.projectTitleSub}>
        <b>{project.org}</b><br />
        {project.date}
      </div>
    </div>
    <div className={[styles.projectContent, flipped ? styles.flipped : ''].join(' ')}>
      <a href={project.link || ''} className={[styles.projectContentShowcase, !project.link ? styles.unclickable : ''].join(' ')}>
        <picture className={styles.projectContentShowcase}>
          <source srcSet={project.img.src.webp} type="image/webp" />
          <source srcSet={project.img.src.png} type="image/png" />
          <img src={project.img.src.png} alt={project.img.alt} />
        </picture>
      </a>
      <div className={styles.projectContentBlurb}>
        {project.blurb}
      </div>
    </div>
  </OnVisible>
);

export default Project;
