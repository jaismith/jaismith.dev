import axios from 'axios';
import { load } from 'cheerio';

require('dotenv').config();

const NUM_BINS = 25;
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];
const GITHUB_CONTRIBUTIONS_QUERY = `
  query($username: String!) { 
    user(login: $username){
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export type Datapoint = {
  x: number,
  y: number,
  name?: string,
};

export const getActivity = async () => {
  // request github contribution data
  let data: any;

  try {
    const res = await axios.post(
      GITHUB_GRAPHQL_URL,
      {
        query: GITHUB_CONTRIBUTIONS_QUERY,
        variables: {
          username: 'jaismith'
        }
      },
      {
        headers: {
          'Authorization': `bearer ${GITHUB_TOKEN}`
        },
      }
    );
    data = res.data;
  } catch (e) {
    console.error(e);
    throw new Error('Error fetching github contributions, see server logs.');
  }

  // get ref date 25 days ago in UTC
  const ref = new Date();
  ref.setDate(ref.getMonth() - 6);

  const activity: Datapoint[] = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks
    .flatMap((w: any) => w.contributionDays as any[])
    .filter((c: any) => new Date(c.date) > ref)
    .map((c: any) => ({
      x: new Date(c.date).getTime(),
      y: c.contributionCount
    }));

  const binsize = Math.ceil(activity.length / NUM_BINS);
  const binnedActivity: Datapoint[] = Array.from({ length: NUM_BINS }, (_, idx) => {
    const startIndex = idx * NUM_BINS;
    const endIndex = Math.min(startIndex + NUM_BINS, activity.length);
    const contributionsInBin = activity.slice(startIndex, endIndex);
    const totalContributions = contributionsInBin.reduce((sum, contribution) => sum + contribution.y, 0);
    const midpointDate = new Date(contributionsInBin[Math.floor(contributionsInBin.length / 2)].x);
    return {
        x: midpointDate.getTime(),
        y: totalContributions
    };
  });

  return activity;
};
