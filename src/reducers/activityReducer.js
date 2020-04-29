import { ActionTypes } from '../actions';

const initialState = {
  history: [],
}

const ActivityReducer = (state = initialState, action) => {
  switch(action.type) {
    case ActionTypes.GET_ACTIVITY:
      return { ...state, activity: action.payload };
    default:
      return state;
  }
};

export default ActivityReducer;
