import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs} from 'antd';
import styles from './AlarmEventForm.less';

import AlarmPnl from './AlarmPnl';
import EventPnl from './EventPnl';
import SettingModal from './SettingModal';

import MyIcon from 'components/MyIcon';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 

export default class AlarmEventForm extends PureComponent {
  state = {
    settingModalVisible:false,
    alarmList:[],
    alarmVisible:false,
    interval:'',
    pageNum:1,
    filteredParams:null,
  };

  close = () => {
    this.props.alarmEventForm();
  };

  settingModal = (flag) => {
    this.setState({
      settingModalVisible:!!flag
    });
  };

  resetData = (respData) => {
    let data =[];
    let deviceLists=this.props.deviceLists;
        if(respData){
           data = respData.data;
           if(data){
              for(let i = 0;i<deviceLists.length;i++){
                  let devList = deviceLists[i];    
                  for(let j =0 ;j<data.length;j++){
                     let d = data[j];
                     if(d.Device == devList.DeviceId){
                         d.Name = devList.Name+'-P'+d.Port;
                     }
                  }
              }
           }
          }
  };

  //查询告警
  fetchAlarm = () => {
    var me = this;
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/GetAlarmList/';
    let deviceIds = this.props.deviceIds;
    let ids = [];
    if(deviceIds){
     ids = deviceIds.join(',');
    }
    let page = this.state.pageNum;
    let range = (page-1) * 50;
    fetch(url+'?_dc='+dc+'&DeviceIds='+ids+'&page='+page+'&start='+range+'&limit=50',{
      credentials: 'include',
      method:'GET',
    })
    .then((resp) => resp.json())
      .then((respData)=> {
        this.resetData(respData);
        this.setState({alarmList:respData});
      })
      .catch((error) => {
        console.log(error)
      })
  };

  //tab切换，key=1是事件，key=2是告警
  changeKey = (v) => {
    if(v==1){
      this.setState({
        alarmVisible:false
      });
      if(this.state.filteredParams !== null){
        if(this.state.filteredParams.encodeEventParams !== null || this.state.filteredParams.realEventParams !== null){
          this.props.fetchFilteredEvent(this.state.filteredParams,1,this.state.pageNum);
        }
      }else{
        this.props.fetchEvent(1,true,this.state.pageNum);
      }
    }else if(v==2){
      this.setState({
        alarmVisible:true
      });
      if(this.state.filteredParams !== null){
        if(this.state.filteredParams.alarmSettingParams !== null)
        {
          this.fetchFilteredAlarm(this.state.filteredParams.alarmSettingParams);
        }
        if(this.state.filteredParams.encodeEventParams !== null || this.state.filteredParams.realEventParams !== null){
          this.props.fetchFilteredEvent(this.state.filteredParams,1,this.state.pageNum);
        }
      }else{
        this.fetchAlarm();
        this.props.fetchEvent(1,false,this.state.pageNum);
      }

    }
  };

  changeEvent = (k) => {
    this.setState({
      pageNum:1
    });
    if(this.state.filteredParams !== null){
      if(this.state.filteredParams.encodeEventParams !== null || this.state.filteredParams.realEventParams !== null){
        this.props.fetchFilteredEvent(this.state.filteredParams,k,this.state.pageNum);
      }
    }else{
      this.props.fetchEvent(k,true,this.state.pageNum);
    }
  };

  //table切换页面
  getPageNum = (key,pageNum) => {
    this.setState({
      pageNum:pageNum
    });
    if(key ==1){
      if(this.state.filteredParams !== null){
        if(this.state.filteredParams.encodeEventParams !== null || this.state.filteredParams.realEventParams !== null){
          this.props.fetchFilteredEvent(this.state.filteredParams,1,pageNum);
        }
      }else{
        this.props.fetchEvent(1,true,pageNum);
      }

    }else if(key == 2 ){
      if(this.state.filteredParams !== null && this.state.filteredParams.alarmSettingParams !== null){
        this.fetchFilteredAlarm(this.state.filteredParams.alarmSettingParams)
      }else{
        this.fetchAlarm();
      }
    }
  };

  setFilteredParams = (params) => {
    this.setState({
      filteredParams:params
    });
    if(params){
      if(params.alarmSettingParams !== null)
      {
        this.fetchFilteredAlarm(params.alarmSettingParams);
      }
      if(params.encodeEventParams !== null || params.realEventParams !== null){
        this.props.fetchFilteredEvent(params,1,this.state.pageNum);
      }
    }
  };
  //过滤告警事件
  fetchFilteredAlarm = (params) => {
    let me = this;
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/GetFilteredAlarmList/';
    let deviceIds = params.devPort;
    let ids = [];
    if(deviceIds){
      ids = deviceIds.join(',');
    }
    let timeRange = params.timeRange;
    let startDateTime = '';
    let endDateTime = '';
    if(timeRange !== undefined && timeRange.length > 0){
      startDateTime = moment(timeRange[0]._d).format('YYYY-MM-DD HH:mm:ss');
      endDateTime = moment(timeRange[1]._d).format('YYYY-MM-DD HH:mm:ss');
    }
    let page = this.state.pageNum;
    let range = (page-1) * 50;
    fetch(url+'?_dc='+dc+'&devPort='+ids+'&startDateTime='+startDateTime+'&endDateTime='+endDateTime+'&start='+range+'&limit=50',{
      credentials: 'include',
      method:'GET',
    })
      .then((resp) => resp.json())
      .then((respData)=> {
        this.resetData(respData);
        this.setState({alarmList:respData});

      })
      .catch((error) => {
        console.log(error)
      })
  }

  render() {
    const {alarmEventFormVisible,alarmPnlVisible,eventPnlVisible,eventList,fetchEvent,deviceIds} = this.props;

    if(eventList){
      this.resetData(eventList);
    }

    const display = alarmEventFormVisible ? 'block' : 'none';
    const style = {
      display:display,
      margin:'0px',
      height:window.innerHeight
    };
    const isDisplay = {display:display};

    const operations = (
      <div>
      <a name="close" style={{color:'rgba(0,0,0,0.85'}}><Icon type="setting"  onClick={this.settingModal} /></a> 
      <a name="close" style={{color:'rgba(0,0,0,0.85'}}><Icon type="close"  onClick={this.close} /></a> 
      </div>
     ) ;

    const parentMethods = {
      handleSettingVisible:this.settingModal,
      handleChangeEvent:this.changeEvent,
      eventList:eventList,
      alarmList:this.state.alarmList,
      getPageNum:this.getPageNum,
      devPortLists:this.props.devPortLists,
      setFilteredParams:this.setFilteredParams,
      fetchFilteredAlarm:this.fetchFilteredAlarm
    };

    return (
      <Card style = {style}>
      <Tabs type="card" tabBarExtraContent={operations} size="small" 
      defaultActiveKey='1'
      onChange={this.changeKey}
      >
        <TabPane  tab={<span><MyIcon iconName={"event"} />事件</span>}  key="1" >
        <EventPnl {...parentMethods}></EventPnl>
         
        </TabPane>

        <TabPane tab={<span><MyIcon iconName={"alarm"} />告警</span>} key ="2" >
        <AlarmPnl {...parentMethods}></AlarmPnl> 
        </TabPane>

      </Tabs>
      <SettingModal
          {...parentMethods}
          modalVisible={this.state.settingModalVisible}
          />
      </Card>
    );
  }
}
