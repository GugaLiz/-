import { getDatas ,getDeviceList,getPortsList,getEventList,getAlarmList,getParaList} from '../services/api';

export default {
    namespace: 'airfleet',

    state: {
      Online:[],
      deviceList:{
        total:"",
        datas:[],
      },
      eventData:{
        total:"",
        data:[],
      },
      alarmData:{
        total:'',
        data:[],
      },
      paraData:{
        total:'',
        datas:[],
      },
      portsData:{
        total:'',
        datas:[],
      },
      data: {
        list: [],
        pagination: {},
      },
    },
  
    effects: {
      *getDatas({payload},{call,put}){
        const response = yield call(getDatas,payload);
        yield put({
          type:'saveDatas',
          payload:response,
        });
      },
      *getDeviceList({payload},{call,put}){
        const resp = yield call(getDeviceList,payload);
        //if(callback) callback(resp);
        yield put({
          type:'saveDeviceList',
          payload:resp
        });
      },
      // *getDeviceList({payload,callback},{call,put}){
      //   const resp = yield call(getDeviceList,payload);
      //   if(callback) callback(resp);
      // },
      *getEventList({payload},{call,put}){
        const response = yield call(getEventList,payload);
        yield put({
          type:'saveEvent',
          payload:response
        });
      },
      *getAlarmList({payload},{call,put}){
        const resp = yield call(getAlarmList,payload);
        yield put({
          type:'saveAlarm',
          payload:resp
        });
      },
      *getParaList({payload},{call,put}){
        const response = yield call(getParaList,payload);
        yield put({
          type:'savePara',
          payload:response
        });
      },
      *getPortsList({payload},{call,put}){
        const response = yield call(getPorts,payload);
        yield put({
          type:'savePorts',
          payload:response
        });
      },
      // *fetchMonitor({ payload }, { call, put }) {
      //   const response = yield call(queryMonitor,payload);
      //   yield put({
      //     type: 'save',
      //     payload: response,
      //   });
      // }
    },
  
    reducers: {
      save(state, action) {
        return {
          ...state,
          data: action.payload,
        };
      },
      saveDatas(state,action){
        return{
          ...state,
          data:action.payload,
        };
      },
      saveDeviceList(state,action){
        return{
          ...state,
          deviceList:action.payload,
        };
      },
      savePara(state,action){
        return {
          ...state,
          paraData:action.payload,
        };
      },
      savePorts(state,action){
        return {
          ...state,
          portsData:action.payload
        };
      },
      saveEvent(state,action){
        return{
          ...state,
          eventData:action.payload,
        };
      },
      saveAlarm(state,action){
        return{
          ...state,
          alarmData:action.payload,
        };
      }
    },
  };