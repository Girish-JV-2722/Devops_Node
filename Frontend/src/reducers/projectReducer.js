
const initialState = {
    projects: [
        { id: "1", name: "Project 1" },
        { id: "2", name: "Project 2" },
        { id: "3", name: "Project 3" },
    ],
  };
  
  const projectReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_PROJECT':
        return {
          ...state,
          projects: [...state.projects, action.payload],
        };
      default:
        return state;
    }
  };
  
  export default projectReducer;
  