import React from 'react';
import generateKey from 'utils/keygen';

import Project, { ProjectType } from 'components/Project';

type ProjectsProps = {
  projects: ProjectType[];
};

const Projects = ({ projects }: ProjectsProps) => (
  <div>
    {projects.map((project, index) => (
      <Project
        key={generateKey([project.name, project.org])}
        project={project}
        flipped={index % 2 === 1}
      />
    ))}
  </div>
);

export default Projects;
