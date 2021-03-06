import axios from 'axios';

const API_ROOT = 'https://api-jaismith-dev.herokuapp.com';

export const ActionTypes = {
  GET_ACTIVITY: 'GET_ACTIVITY',
};

export function getActivity() {
  return (dispatch) => {
    // request constribution data
    axios.get(`${API_ROOT}/contributions`)
      .then((res) => {
        dispatch({ type: ActionTypes.GET_ACTIVITY, payload: res.data });
      }).catch((err) => {
        console.error(err.message);
      });
  };
}
