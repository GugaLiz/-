import { routerRedux } from 'dva/router';
import { userLogin } from '../services/api';
import { setAuthority,setToken } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(userLogin, payload);
      console.info(response);
      // yield put({
      //   type: 'changeLoginStatus',
      //   payload: response,
      // });
      // Login successfully
      //if (response.success === true) {
      if (response.success) {
        console.log(123)
        // setToken(response.token);
        // reloadAuthorized();
        yield put(routerRedux.push('/index'));
      }
    },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url

        // urlParams.searchParams.set('redirect', pathname);
        //
        if(urlParams.searchParams.get('redirect') != '/user/login'){
          urlParams.searchParams.set('redirect', pathname);
        }else {
          //urlParams.searchParams.delete('redirect');
          urlParams.searchParams.set('redirect', '/index');
        }
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      if (payload && payload.currentAuthority){
        setAuthority(payload.currentAuthority);
      }else if(!payload){
        setAuthority('guest');
        return {
          ... state
        };
      }
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
