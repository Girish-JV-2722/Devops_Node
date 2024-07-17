import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './reducers/projectReducer'; // Adjust the path according to your file structure

const store = configureStore({
  reducer: {
    projects: projectReducer,
    // Add other reducers if any
  },
});

export default store;
