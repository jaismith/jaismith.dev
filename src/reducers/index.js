import { combineReducers } from 'redux';

import ActivityReducer from './activityReducer';

const rootReducer = combineReducers({
  activity: ActivityReducer,
});

export default rootReducer;
