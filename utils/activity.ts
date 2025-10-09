import axios from 'axios';

const NUM_BINS = 50;
const CONTRIB_API_BASE = process.env['CONTRIB_API_BASE'];
const GITHUB_USERNAME = process.env['GITHUB_USERNAME'];

export type Datapoint = {
  x: number,
  y: number,
  name?: string,
};

function normalizeContributions(raw: any): { date: string; count: number }[] {
  // v4 API returns { contributions: [{ date, count, level }], total: {...} }
  if (raw && typeof raw === 'object' && Array.isArray(raw.contributions)) {
    return raw.contributions.map((c: any) => ({
      date: c.date,
      count: c.count ?? 0
    }));
  }
  // Fallback for array format
  if (Array.isArray(raw)) return raw;
  // Fallback for object format { 'YYYY-MM-DD': number }
  if (raw && typeof raw === 'object') {
    return Object.keys(raw).map(date => ({ date, count: raw[date] ?? 0 }));
  }
  return [];
}

export const getActivity = async () => {
  // request github contribution data for the last year
  let data: any;

  try {
    const res = await axios.get(`${CONTRIB_API_BASE}/v4/${GITHUB_USERNAME}?y=last`);
    data = res.data;
  } catch (e) {
    console.error(e);
    throw new Error('Error fetching github contributions, see server logs.');
  }

  // Calculate date range: last 6 months up to today
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0); // Start of that day

  // Normalize contributions to daily array
  const days = normalizeContributions(data);

  // Filter to only last 6 months, up to today (no future dates)
  const activity: Datapoint[] = days
    .filter((d: any) => {
      if (!d || !d.date) return false;
      const date = new Date(d.date);
      return date >= sixMonthsAgo && date <= now;
    })
    .map((d: any) => ({
      x: new Date(d.date).getTime(),
      y: d.count ?? 0
    }));

  // Only bin if we have data
  if (activity.length === 0) {
    return [];
  }

  const binsize = Math.ceil(activity.length / NUM_BINS);
  const binnedActivity: Datapoint[] = [];

  for (let idx = 0; idx < NUM_BINS; idx++) {
    const startIndex = idx * binsize;
    const endIndex = Math.min(startIndex + binsize, activity.length);
    const contributionsInBin = activity.slice(startIndex, endIndex);
    
    // Skip empty bins instead of adding them with x: 0
    if (contributionsInBin.length === 0) {
      continue;
    }

    const totalContributions = contributionsInBin.reduce((sum, contribution) => sum + contribution.y, 0);
    const midpointDate = new Date(contributionsInBin[Math.floor(contributionsInBin.length / 2)].x);
    binnedActivity.push({
      x: midpointDate.getTime(),
      y: totalContributions
    });
  }

  return binnedActivity;
};
