import Resume from 'components/Resume';
import Header, { HeaderProps, getStaticHeaderProps } from 'components/Header';
import { GetStaticProps, GetStaticPropsContext, PreviewData } from 'next/types';
import { ParsedUrlQuery } from 'querystring';
import { compareExperiencesByTimeframe, Experience } from 'utils/experience';

type Entity = {
  name: string;
  location: string;
  details: string;
};

export type ResumeProps = {
  education: Entity[],
  organizations: Entity[],
  experiences: Experience[]
}

const ResumePage = ({
  activity,
  education,
  organizations,
  experiences
}: HeaderProps & ResumeProps) => (
  <>
    <Header activity={activity} />
    <Resume
      education={education}
      organizations={organizations}
      experiences={experiences}
    />
  </>
);

export const getStaticProps: GetStaticProps<HeaderProps & ResumeProps> = async (context: GetStaticPropsContext<ParsedUrlQuery, PreviewData>) => {
  const header = await getStaticHeaderProps(context);

  const education = [
    {
      name: 'Dartmouth College',
      location: 'Hanover, NH',
      details: 'Bachelor of Arts in Computer Science (2018-2022)'
    }
  ];

  const organizations = [
    // {
    //   name: 'Give Essential',
    //   location: 'USA',
    //   details: 'Humanitarian Aid | Lead Engineer'
    // },
    // {
    //   name: 'HackDartmouth',
    //   location: 'Hanover, NH',
    //   details: 'Education | Developer, Organizer'
    // },
    // {
    //   name: 'Ledyard Canoe Club',
    //   location: 'Hanover, NH',
    //   details: 'Outdoor Rec | Flatwater Leader'
    // }
  ];

  const experiences = [
    {
      workplace: 'Amazon',
      location: 'New York, NY',
      position: 'Software Development Engineer (SDE I-II)',
      timeframe: 'September 2022 - Present',
      description: '- Founding engineer on Amazon\'s live event advertising team, rearchitecting key ad-serving systems to scale dynamic ad-insertion to ~25MM concurrent live streams.\n' +
                  '- Developed an innovative video analysis pipeline with a principal applied research scientist, combining computer vision and language models to identify branding in content.\n' +
                  '- Building deep experience with AWS, including distributed micro-service architecture, infrastructure as code, and monitoring; enabling highly observable systems with >99.999% request success rate.',
    },
    {
      workplace: 'Skiff (acquired by Notion)',
      location: 'San Francisco, CA',
      position: 'Product Engineer',
      timeframe: 'December 2020 - July 2021',
      description: '- Early engineer for an end-to-end encrypted collaboration platform serving journalists and users in regions with restricted internet freedoms.\n' +
                  '- Designed and implemented key React UI components for the core document experience, including live cursor previews, commenting systems, and secure credential management.\n' +
                  '- Applied conflict-resistant data types and modern web technologies to create a responsive editing experience that maintained security without compromising real-time functionality.',
    },
    {
      workplace: 'Digital Applied Learning and Innovation Lab',
      location: 'Hanover, NH',
      position: 'Software Engineer, Mentor, Core Staff',
      timeframe: 'January 2020 - July 2022',
      description: '- Served as lead engineer in cross-functional teams, working alongside designers and product managers with entrepreneurial partners.\n' +
                  '- Architected and implemented the technical foundation for multiple projects, including a web productivity app (now [bydesign](https://bydesign.io)), and Dartmouth\'s Wi-Fi reporting system used to guide a multi-million-dollar campus infrastructure upgrade.\n' +
                  '- Created an automation framework that eliminated several days of termly operational workload related to hiring and mentorship processes.\n' +
                  '- Mentored beginner and intermediate engineers, teaching full stack frameworks and principles.',
    },
    {
      workplace: 'Kathmandu Living Labs',
      location: 'Kathmandu, Nepal',
      position: 'Software Engineer (iOS Developer)',
      timeframe: 'June 2019 - August 2019',
      description: '- Lead iOS developer on a platform aiming to increase parent involvement in student learning at a local Nepali high school, now fully integrated with over 450 active users (responsible for the majority of the iOS user interface and frameworks).\n' +
                  '- Learned about the roles of software development, humanitarian engineering, and open data in Nepal.',
    },
    {
      workplace: 'Give Essential',
      location: 'USA',
      position: 'Lead Engineer (Full Stack)',
      timeframe: 'April 2020 - September 2020',
      description: '- Rapidly developed an Express API integrated with Cloud Firestore that streamlined matching between essential workers and donors during COVID-19, helping the program reach thousands of people, facilitate over $100K of individual donations, and secure over $60K in funding.\n' +
                  '- Built portal allowing 100+ volunteers to oversee thousands of ongoing essential worker/donor matches.',
    },
    {
      workplace: 'Dartmouth Formula Racing',
      location: 'Hanover, NH',
      position: 'Engineer',
      timeframe: 'September 2018 - June 2020',
      description: '- Helped to design and build the vehicle wiring harness for the 2019 competition vehicle.\n' +
                  '- Designed and manufactured module to convert raw sensor signals to CAN messages using Altium Designer, SolidWorks, and C, simplifying the wiring harness and making it easier to add new sensors to the vehicle in the future.'
    },
    {
      workplace: 'HackDartmouth',
      location: 'Hanover, NH',
      position: 'Participant, Organizing Team Development Lead',
      timeframe: 'April 2019 - July 2022',
      description: '- Designed and built an offline messaging app using Bluetooth/Wi-Fi Direct mesh technology that enabled secure communication over a network of nearby smartphones without internet connectivity, earning a $1K award from Facebook.\n' +
                  '- Led workshops to teach beginner-intermediate full-stack concepts to students and hackathon participants over 3 years.',
    },
  ];

  return {
    ...header,
    props: {
      education,
      organizations,
      experiences: experiences.sort(compareExperiencesByTimeframe),
      ...('props' in header ? header.props : { activity: [] })
    }
  }
};

export default ResumePage;
