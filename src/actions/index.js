import axios from 'axios';
import cheerio from 'cheerio';

// this uses a proxy to bypass cors, may be unreliable
const GITHUB_URL = 'https://cors-anywhere.herokuapp.com/http://github.com/users/jaismith/contributions';

export const ActionTypes = {
  GET_ACTIVITY: 'GET_ACTIVITY',
};

// month names
let months = ['January', 'February', 'March', 'April', 'May', 'June', 
              'July', 'August', 'September', 'October', 'November'];

export function getActivity() {
  return (dispatch) => {
    // request github constribution data
    axios.get(GITHUB_URL)
      .then((res) => {
          // set reference date (20 days ago)
          var ref = new Date();
          ref.setDate(ref.getDate() - 20);

          // parse html
          const html = cheerio.load(res.data);

          // loop through html elements and generate activity data
          var activity = []
          html('g > rect').each(function(_i, _el) {
            // get datapoint date
            let date = new Date(html(this).attr('data-date'));

            // if since ref
            if (date > ref) {
              var datapoint = {
                x: date.getDate() - ref.getDate(),
                y: html(this).attr('data-count'),
              };

              if ((datapoint.x + 1) % 5 === 0) {
                datapoint.name = `${months[date.getMonth()]} ${date.getDate()}`;
              };

              activity.push(datapoint);
            }
          });

          // print parsed data
          console.log(activity)
      }).catch((err) => {
          console.error(`Error fetching github contribution history: ${err.message}`);
      });

    let sampleData = []
    for (let i = 1; i <= 20; i++) {
      sampleData.push({x: i, y: Math.random() * 5 + 2})
    }
    sampleData[2].name = "April 8th"
    sampleData[7].name = "April 13th"
    sampleData[14].name = "April 18th"
    sampleData[19].name = "April 23rd"

    dispatch({ type: ActionTypes.GET_ACTIVITY, payload: sampleData });
  };
}
