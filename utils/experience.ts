export type Experience = {
    workplace: string;
    location: string;
    position: string;
    timeframe: string;
    description: string;
};

const parseDate = (date: string): Date => {
    if (date == 'Present') return new Date();
    return new Date(date);
}

export const compareExperiencesByTimeframe = (a: Experience, b: Experience) => {
    const [aStart, aEnd] = a.timeframe.split(' - ').map(parseDate);
    const [bStart, bEnd] = b.timeframe.split(' - ').map(parseDate);

    // if start times are the same, compare by end
    if (aStart.getTime() == bStart.getTime()) return bEnd.getTime() - aEnd.getTime();

    return bStart.getTime() - aStart.getTime();
};
