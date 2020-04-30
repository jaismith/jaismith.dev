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
          var activity = new Array();

          // loop through html elements and generate activity data
          html('g > rect').each(function(_i, _el) {
            // get datapoint date
            let date = new Date(html(this).attr('data-date'));

            // add to activity, if since ref
            if (date > ref) {
              var datapoint = {
                x: date.getDate() - ref.getDate(),
                y: Number(html(this).attr('data-count')) + 5,
              };

              if ((datapoint.x + 1) % 5 === 0) {
                datapoint.name = `${months[date.getMonth()]} ${date.getDate() + 1}`;
              };

              activity.push(datapoint);
            }
          });

          dispatch({ type: ActionTypes.GET_ACTIVITY, payload: activity });
      }).catch((err) => {
          console.error(`Error fetching github contribution history: ${err.message}`);
      });
  };
}