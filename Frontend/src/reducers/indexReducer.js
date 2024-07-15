// to Combine all reducers into a single rootReducer.
import { combineReducers } from 'redux';
import projectReducer from './projectReducer';

const rootReducer = combineReducers({
  projects: projectReducer,
  // other reducers if any
});

export default rootReducer;
