import { ActionTypes } from '../actions';

// prepare default data
let defaultData = []
for (let i = 0; i < 20; i++) {
  defaultData.push({ x: i, y: 0 })
}

const initialState = {
  history: defaultData,
}

const ActivityReducer = (state = initialState, action) => {
  console.log(action.payload)
  switch(action.type) {
    case ActionTypes.GET_ACTIVITY:
      return { ...state, history: action.payload };
    default:
      return state;
  }
};

export default ActivityReducer;
