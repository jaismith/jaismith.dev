import axios from 'axios';
import cheerio from 'cheerio';

const GITHUB_URL = 'https://github.com/users/jaismith/contributions';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type Datapoint = {
  x: number,
  y: number,
  name?: string,
};

export const getActivity = async () => {
  // get current time, offset by timezone
  const localTime = new Date();
  const utcTime = new Date(localTime.getTime() - (localTime.getTimezoneOffset() * 60000));

  // request github constribution data
  let data: any;
  try {
    data = (await axios.get(`${GITHUB_URL}`, { headers: { 'Accept': '*/*' }})).data;
  } catch (err) {
    console.error(`Error fetching github contribution history: ${err.message}`);
    throw new Error('Error fetching github contributions, see server logs.');
  }

  // set reference date (20 days ago)
  let ref = utcTime;
  ref.setDate(ref.getDate() - 20);

  // parse html
  const html = cheerio.load(data);
  let activity: Datapoint[] = [];

  // loop through html elements and generate activity data
  html('g > rect').each(function(_i, _el) {
    // get datapoint date
    const time: string = html(this).attr('data-date')
    let date = new Date(time);

    // add to activity, if since ref
    if (date > ref && date <= localTime) {
      let datapoint: Datapoint = {
        x: date.getDate() - ref.getDate(),
        y: parseInt(html(this).attr('data-count')),
      };

      if ((activity.length + 1) % 5 === 0) {
        const displayDate = new Date(date);
        displayDate.setDate(date.getDate() + 1);
        datapoint.name = `${MONTHS[displayDate.getMonth()]} ${displayDate.getDate()}`;
      }

      activity.push(datapoint);
    }
  });

  return activity;
};
