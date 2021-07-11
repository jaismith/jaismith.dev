import axios from 'axios';
import cheerio from 'cheerio';

const GITHUB_URL = 'https://github.com/users/jaismith/contributions';

export type Datapoint = {
  x: number,
  y: number,
  name?: string,
};

export const getActivity = async () => {
  // request github constribution data
  let data: any;
  try {
    data = (await axios.get(`${GITHUB_URL}`, { headers: { 'Accept': '*/*' }})).data;
  } catch (err) {
    throw new Error('Error fetching github contributions, see server logs.');
  }

  // get ref date 3 month ago in UTC
  const ref = new Date();
  ref.setDate(ref.getDate() - 25);

  // parse html
  const html = cheerio.load(data);
  let activity: Datapoint[] = [];

  // loop through html elements and generate activity data
  html('g > rect').each(function(_i, _el) {
    // get datapoint date
    const time: string = html(this).attr('data-date')
    let date = new Date(time);

    // add to activity, if since ref
    if (date > ref) activity.push({
      x: date.getTime(),
      y: parseInt(html(this).attr('data-count')),
    });
  });

  return activity;
};
