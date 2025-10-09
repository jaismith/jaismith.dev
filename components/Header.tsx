import { GetStaticProps } from 'next';
import {
  ResponsiveContainer, AreaChart, Area, ReferenceDot, XAxis, Label
} from 'recharts';
import { isMobile } from 'react-device-detect';
import OnVisible from 'react-on-visible';
import { Datapoint } from 'utils/activity';
import classes from 'utils/classes';

import CustomLabel from 'components/CustomLabel';

import styles from 'styles/Header.module.scss';

export type HeaderProps = {
  activity: Datapoint[],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Header = ({
  activity,
}: HeaderProps) => {
  const labeledActivity = activity.map((datapoint, idx) => {
    const displayDate = new Date(datapoint.x);
    // Label every 10th datapoint for cleaner spacing (approximately every 2 weeks for 50 bins over 6 months)
    return {
      ...datapoint,
      name: idx % 10 === 0
        ? `${MONTHS[displayDate.getMonth()]} ${displayDate.getDate()}`
        : ''
    };
  });

  // calc total activity over period
  let totalActivity = labeledActivity.reduce((sum, val) => sum + val.y, 0);

  // calc highest isolated datapoint (used to scale const base value)
  const highestIsolated = labeledActivity.reduce((max, val) => Math.max(max, val.y), 0);

  return (
    <div className={classes(styles.header, isMobile && styles.mobile)}>
      <OnVisible className={styles.headerChart} visibleClassName={styles.visible}>
        <ResponsiveContainer>
          <AreaChart
            data={labeledActivity.map(d => ({...d, y: d.y + (.25 * highestIsolated)}))}
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
              x={labeledActivity.length - 1}
              y={labeledActivity[labeledActivity.length - 1].y + (.25 * highestIsolated)}
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
                        `since ${labeledActivity[0].name}`
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
              interval={0}
              tick={{ fontSize: 12 }}
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
            Software Engineer, Dartmouth Alum<br />
            <i>New York, NY</i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
