import Resume from 'components/Resume';
import Header, { HeaderProps, getStaticHeaderProps } from 'components/Header';

const ResumePage = ({
  activity,
}: HeaderProps) => (
  <>
    <Header activity={activity} />
    <Resume
      education={[
        {
          name: 'Dartmouth College',
          location: 'Hanover, NH',
          details: 'Bachelor of Computer Science (2018-2022)'
        }
      ]}
      organizations={[
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
      ]}
      experiences={[
        {
          workplace: 'Amazon',
          location: 'New York, NY',
          position: 'Software Development Engineer',
          timeframe: 'October 2022 - Present',
          description: '- Working on ad tech.',
        },
        {
          workplace: 'Skiff',
          location: 'San Francisco, CA',
          position: 'Product Engineer',
          timeframe: 'December 2020 - June 2021',
          description: '- Designed and implemented core functionality in an end-to-end encrypted document editing platform; including live cursor previews, collaborative commenting, and SRP credential caching.\n' +
                      '- Contributed to product and company direction brainstorms during key months before and after public launch.',
        },
        {
          workplace: 'DALI Lab',
          location: 'Hanover, NH',
          position: 'Software Engineer (Core)',
          timeframe: 'January 2020 - June 2022',
          description: '- Led a team of engineers in creating a reporting system to trace Wi-Fi complaints to access-points within the Dartmouth network; aggregating data from thousands of users to guide an ongoing multi-million-dollar campus infrastructure upgrade.\n' +
                      '- Currently developing a highly customizable personal productivity web application using ReactJS and Cloud Firestore, targeting a private beta during Summer 2020 and set to be presented before investors later this year.',
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
          timeframe: 'April 2020 - December 2020',
          description: '- Streamlined signup and matching process for essential workers nationwide and donors with extra household supplies during the COVID-19 pandemic via an Express API integrated with Cloud Firestore; eliminating manual bottlenecks and helping the program to reach thousands of people, facilitate over $100k of individual donations, and secure over $60K in funding.\n' +
                      '- Built portal allowing 100+ volunteers to oversee and facilitate thousands of ongoing essential worker/donor matches.',
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
          position: 'Contestant, Organizer, Lead Developer',
          timeframe: 'April 2019 - June 2022',
          description: '- Developed an offline instant messaging app as a contestant in 2019 using Bluetooth/Wi-Fi Direct mesh technology to send end-to-end encrypted messages over a decentralized network of nearby smartphones (awarded over $1k by Facebook).\n' +
                      '- Lead developer of club website, our public facing portal for sponsors and hundreds of applicants nationwide.\n' +
                      '- Responsible for holding workshops on campus to teach beginner developers languages like JavaScript, HTML, and CSS.',
        },
      ]}
    />
  </>
);

export const getStaticProps = getStaticHeaderProps;

export default ResumePage;
