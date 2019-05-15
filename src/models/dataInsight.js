import {getSourceFile} from '../services/api';

export default {
  namespace: 'dataInsight',
  state:{
    data: {
      list: [],
      pagination: {},
    },
  },

  effects:{
    *getSourceFile({payload},{call,put}){
      const response = yield call(getSourceFile,payload);
      yield put({
        type:'save',
        payload:response
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  }
};
