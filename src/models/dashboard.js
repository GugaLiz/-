import {} from '../services/api';

export default {
  namespace: 'dashboard',
  state:{
    data: {
      list: [],
      pagination: {},
    },
  },

  effects:{

  },

  reducers: {
    // save(state, action) {
    //   return {
    //     ...state,
    //     data: action.payload,
    //   };
    // },
  }
};
