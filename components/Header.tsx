import { GetStaticProps } from 'next';
import {
  ResponsiveContainer, AreaChart, Area, ReferenceDot, XAxis, Label
} from 'recharts';
import { isMobile } from 'react-device-detect';
import OnVisible from 'react-on-visible';
import { Datapoint, getActivity } from 'utils/activity';
import classes from 'utils/classes';

import CustomLabel from 'components/CustomLabel';

import styles from 'styles/Header.module.scss';

export type HeaderProps = {
  activity: Datapoint[],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getStaticHeaderProps: GetStaticProps<HeaderProps> = async () => {
  // default to some dummy data
  let activity: Datapoint[] = [{ x: 0, y: 0, name: '' }];

  try {
    activity = await getActivity();
  } catch (e) {
    console.log('Failed to load activity:', e);
  };

  return {
    props: { activity },
    revalidate: 3600
  };
}

const Header = ({
  activity,
}: HeaderProps) => {
  // attach date string to activity data at interval
  activity.forEach((datapoint, idx) => {
    if (idx % 5 === 0) {
      const displayDate = new Date(datapoint.x);
      datapoint.name = `${MONTHS[displayDate.getMonth()]} ${displayDate.getDate()}`
    }
  });

  // calc total activity over period
  let totalActivity = activity.reduce((sum, val) => sum + val.y, 0);

  return (
    <div className={classes(styles.header, isMobile && styles.mobile)}>
      <OnVisible className={styles.headerChart} visibleClassName={styles.visible}>
        <ResponsiveContainer>
          <AreaChart
            data={activity.map(d => ({...d, y: d.y + 5}))}
            margin={{
              top: 20,
              right: isMobile ? 140 : 170,
              bottom: 10,
              left: 0,
            }}
          >
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type='basis'
              dataKey='y'
              stroke={totalActivity === 0 ? 'transparent' : 'var(--chart-color)'}
              fill='url(#grad)' />
            <ReferenceDot
              className={classes(styles.headerChartRefdot, totalActivity === 0 && styles.hidden)}
              x={activity.length - 1}
              y={activity[activity.length - 1].y + 5}
              r={7.5}
              fill="var(--chart-color)"
              stroke="none"
            >
              <Label
                position={'right'}
                content={
                  <CustomLabel 
                    lines={totalActivity !== 0 ?
                      [
                        `${totalActivity} contributions`,
                        `since ${activity[0].name}`
                      ] :
                      [
                        'Loading activity...'
                      ]
                    }
                    mobile={isMobile}
                  />
                }
              />
            </ReferenceDot>
            <XAxis 
              dataKey='name'
              axisLine={false}
              tickLine={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </OnVisible>
      <div className={styles.headerBox}>
        <picture className={styles.headerPic}>
          <source srcSet="/media/profile-web.webp" type="image/webp" />
          <source srcSet="/media/profile-web.png" type="image/png" />
          <img src="/media/profile-web.png" alt="Self Portrait" />
        </picture>
        <div className={styles.headerTitle}>
          <div className={styles.headerTitleMain}>
            Jai K. Smith
          </div>
          <div className={styles.headerTitleSub}>
            Software Engineer, Dartmouth Undergrad<br />
            <i>New York, NY</i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
