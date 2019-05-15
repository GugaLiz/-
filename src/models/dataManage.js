import { getSourceFile } from '../services/api';

export default {
  namespace: 'dataManage',
  state:{
    data: {
      list: [],
      totalCount: {},
    },
  },

  effects:{
    *getListSource({ payload }, { call, put }) {
      const response = yield call(getSourceFile, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response) ? response : [],
      });

  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
  }
    // save(state, action) {
    //   return {
    //     ...state,
    //     data: action.payload,
    //   };
    // },
  }
};
