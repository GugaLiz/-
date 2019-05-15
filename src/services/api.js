import { stringify } from 'qs';
import request from '../utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function userLogin(params) {
  let _formData = {q:`${params.txt}`};
  let _formDataStr = JSON.stringify(_formData);
  return request('/api/Signin/Check/', {
    credentials: 'include',
    method: 'POST',
    //body: params,
    //body:params
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    //body:'q='+ params.txt
    body:_formDataStr,
    //body:params
    //body:'removeLogged=false&userAccount=ll&pdw=F1797F96E0C14DA99EB102EF59C96D2B&verificationCode='
    //body:'userAccount='+ params.userAccount,
   //  body: {userAccount : params.userAccount,
   //    pdw:params.pdw}
  });
}

export async function getDatas(){
  return request('/api/Airfleet/GetDatas', {
    method: 'POST',
    headers: {
      "Lzw-Json": '1',
      "Content-Type": 'application/x-www-form-urlencoded'
  },
    body: {
      ...params,
      method: 'post',
    },
  });
 
}

export async function getDeviceList(params){
  // return request(`/api/AirFleet/DeviceList?${stringify(params)}`,{
  //   method:'POST',
  //   headers:{
  //     'Accept':'application/json',

  //   },
  //   body:{
  //     ...params,
  //     method:'post',
  //   },
  // });
  return request(`/api/AirFleet/DeviceList?${stringify(params)}`);
}

export async function getEventList(params){

  return request(`/api/AirFleet/GetEventList?${stringify(params)}`);
}

export async function getParaList(params){
  return request(`/api/AirFleet/ParaList?${stringify(params)}`,{
    method:'POST',
    body:{
        "netType":-1,
      "page":1,
      "start":0,
      "limit":100000
    },
  });
}

export async function getAlarmList(params){
  return request(`/api/AirFleet/GetAlarmList?${stringify(params)}`);
}

export async function getPortsList(params){
  return request(`/api/AirFleet/DevicePortList?${stringify(params)}`);
}

export async function queryMonitor(params){
  return request(`/api/airfleet/monitor?${stringify(params)}`);
}

export async function getSourceFile(params){
  // let reqBodyStr = JSON.stringify(me.props._reqBodyUrl);
  // reqBodyStr = 'Req=' + reqBodyStr;
  let g = reqStr = JSON.stringify(0);

  return request(`/api/DataInsight/ListSourceFile`, {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body:'groupId=' + `${g}`
    //body: `${stringify(params)}`,
  });
  //return request(`/api/DataInsight/ListSourceFile?${stringify(params)}`);
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}
