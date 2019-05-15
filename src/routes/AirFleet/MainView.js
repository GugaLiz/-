import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tooltip, Icon, Button, Table, Radio } from 'antd';
import moment from 'moment';
import numeral from 'numeral';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';
import MonitorPnl from './view/Device/MonitorPnl';
import DetailPnl from './view/Detail/DetailForm';
import AlarmEventForm from './view/AlarmEvent/AlarmEventForm';
import ParamPnl from './view/Para/ParamPnl';

import MapPnl from './view/Map/MapPnl';

import styles from './MainView.less';
import {Desktop} from './DesktopHelper';

const { Sider, Content } = Layout;

export default class AirFleet extends Component {
  state = {
    paramPnlVisible: true,
    alarmEventFormVisible: false,
    alarmPnlVisible: false,
    eventPnlVisible: false,
    detailPnlVisible: false,
    _firstRequestDetail:false,
    monitorPnlVisible: true,
    recData:{},
    _reqBodyUrl: { 'Id4Status': {}, 'Id4ParaHistorys': [], 'Id4Paras': [] },// 请求getDatas的请求参数
    eventList: [],
    devPortLists:[],

    deviceIds: [],
    deviceLists: [],   // 设备监控里选中的设备

    _map:{},

    _desktop:null, // me._desktop_current
    _mapFreshGPS:true,

    _deviceStore:[],
    _portParaHistorys:[],
    _portParas:[],
    _tagIdArr:[],
    hideRec:true,
  };

  componentDidMount(){
    const me = this;
    Desktop.loadCurrentDesktop();
    Desktop.loadFromDesktop();

    const desktop = Desktop._desktop_current;
    this.setState({
      _desktop:desktop,
    });
    me._desktop_current = desktop;
}
// 地图
  map_ready = (map) => {
    console.log('map_ready..')
  };

  firstdata = (data) => {

  };

// 处理轮询数据
  ondata = (data) => {
    const me = this;
    const desktop = this.state._desktop;
    if(data){
      if ((typeof data.Online) !== 'undefined' &&
        data.Online.length == 2) {
        // todo:显示在线/总数
        // let griDevice = me.down('[itemId=griDevice]');
        // griDevice.setOnline(data.Online);
      }
      let detailDev = null;
      if (data.Status) { // 在线状态坐标等
        const updateMap = [];
        let trackMap = null;// 是否需要跟踪地图
        data.Status.map( (dev) => {
          const deviceId = dev.DeviceId;
          let oldRec = null;
          const _sto = me.state.deviceLists;
          _sto.map((d) => {if(d.DeviceId === deviceId){oldRec = d;}});
          let lastRequestGPS = null;
          const lastRequestAlarm = null;
          const lastRequestEvent = null;
          const lastRequestDecodeEvent = null;

          if (dev.GPSHistory && dev.GPSHistory.length > 0) {
            const historys = dev.GPSHistory;
            let offset = [0, 0];
            if (oldRec && oldRec.GPSOffset) {
              offset = oldRec.GPSOffset;
            }
            const len = historys.length;
            const last = historys[len - 1];
            lastRequestGPS = last[0];
            me.addGPSToStore(deviceId, historys, offset);
            if (me.state._mapFreshGPS) {// DONE:需要设置为8s更新一次，防止更新频繁
              me.state._mapFreshGPS = false;
              // me.state._map.refreshGPS();//刷新GPS路径
            }
          }

          if (oldRec ) {
            let freshMap = false; // 判断地图是否需要更新
            let gpsChange = false;
            let staticGPS = false;

            const old = oldRec;   // 本地旧数据
            let update = false;
            if (old.Status !== dev.Status) {
              freshMap = true;
              update = true;
              old.Status = dev.Status;
            }

            if (old.StatusDescription !== dev.StatusDescription) {
              freshMap = true;
              update = true;
              old.StatusDescription = dev.StatusDescription;
            }

            if (old.Lat !== dev.Lat) {
              freshMap = true;
              gpsChange = true;
              update = true;
              old.Lat = dev.Lat;
            }

            if (typeof dev.StaticLat !== 'undefined') {
              staticGPS = true;
              if (old.StaticLat !== dev.StaticLat) {
                freshMap = true;
                gpsChange = false;
                update = true;
                old.StaticLat = dev.StaticLat;
              }
            }

            if (dev.StaticLng && old.StaticLng !== dev.StaticLng) {
              freshMap = true;
              gpsChange = false;
              update = true;
              old.StaticLng = dev.StaticLng;
            }

            if (old.Lng !== dev.Lng) {
              freshMap = true;
              gpsChange = true;
              update = true;
              old.Lng = dev.Lng;
            }
            if (lastRequestGPS !== null) {
              update = true;
              old.LastRequestGPS = lastRequestGPS;
            }
            if (lastRequestAlarm !== null) {
              update = true;
              old.LastRequestAlarm = lastRequestAlarm;
            }
            if (lastRequestEvent !== null) {
              update = true;
              old.LastRequestEvent = lastRequestEvent;
            }
            if (lastRequestDecodeEvent !== null) {
              update = true;
              old.LastRequestDecodeEvent = lastRequestDecodeEvent;
            }

            if (update) {
              if (deviceId == desktop.detail_device) {
                detailDev = old;
              }
            }
            if (freshMap) {
              if (desktop.track_device &&
                gpsChange &&
                deviceId == desktop.detail_device) {
                trackMap = [old.Lat, old.Lng];
              }
              if (staticGPS) {
                trackMap = null;
              }
              updateMap.push(old);
            }
          }
        });
        if (updateMap.length > 0) {
          // me.state._map.updateDevices(updateMap);//通知地图更新数据
          if (trackMap && me._trackDevice) {
            if (!isNaN(parseFloat(trackMap[0]))) {
              me.state._map.panTo(trackMap);
            }
          }
        }
      }

      if (data.Detail) { // 设备详情小窗
        const _pnlDetail = me.refs.getDetailPnl;
        if (me.state._firstRequestDetail) {
          me.setState({
            _firstRequestDetail:false,
          });
          // _pnlDetail.setLoading(false);
          // 清除事件列表
          // me.state._map.removeAllEvents();
        }
        if(me.state.recData){
          detailDev = me.state.recData
        }
        if(_pnlDetail){
          _pnlDetail.setInfo(data.Detail, data,
            detailDev, data.UTCNow);
        }

        const evtRows = data.Detail.EventRows;
        if (evtRows && evtRows.length > 0) {
          me.EventLastTime = evtRows[0].RecordDT;
          const evts = [];
          evtRows.map( (ev) => {
            if (typeof (ev.Lat) !== 'undefined' &&
              typeof (ev.Lng) !== 'undefined') {
              evts.push(ev);
            }
          });
          if (evts.length > 0) {
            // me.state._map.addEvents(evts);
            // mapUpdate = true;
          }
        }
      }
      if (data.Paras) { // 参数信息更新
        // debugger;
        me.setState({
          _portParas:data.Paras,
        });
       const _pnlPara = me.refs._pnlPara;
       if(_pnlPara){
        _pnlPara.updateData(data.Paras);
       }
      }

      if (data.ParaHistorys &&
        data.ParaHistorys.length > 0) { // 参数历史信息覆盖
        const portPara = this.state._portParaHistorys;
        // console.info(data.ParaHistorys,portPara);
        data.ParaHistorys.map(  (ph) => {
          const tagId = `${ph.DeviceId  }_${  ph.Port  }_${  ph.Para}`;
          const real = typeof ph.Real !== 'undefined' && ph.Real;
          if (ph.Values && ph.Values.length > 0){
            let paraHistory = {};
            portPara.map((item) => {if (item.DeviceId == ph.DeviceId && item.Port == ph.Port && item.ParamId == ph.Para){ paraHistory = item;}});
            if (paraHistory) {
              paraHistory.Real = real;
              const values = ph.Values;
              paraHistory.LastRequestTime = values[values.length - 1][0];

              // Ext.defer(function () {
                const datas = [];
                for (let i = 0; i < values.length; i++) {
                  const hist = values[i];// 创建时间
                  const data = JSON.parse(hist[1]);
                  datas.push(data);
                }
              paraHistory.Historys = datas;
              // });
            }
          }
        });
        me.setState({
          _portParaHistorys:portPara,
        });
        const _pnlMap = me.refs._pnlMap;
        if(_pnlMap){
          _pnlMap.initComponent(me.state._map);  // 刷新地图
        }

        // mapUpdate = true;
      }
    }
  };

  addGPSToStore = (deviceId, latlngs, offset) => {
    const me = this;
    // let gpsStore = me._gpsStore;
     const list = [];
    // if (!gpsStore.containsKey(deviceId)) {
    //   let top = 0, left = 0;
    //   if (offset) {
    //     top = offset[0];
    //     left = offset[1];
    //   }
    //   gpsStore.add(deviceId, {
    //     Hide: false,
    //     OffsetTop: top,
    //     OffsetLeft: left,
    //     List: list
    //   });
    // } else {
    //   list = gpsStore.getByKey(deviceId).List;
    // }

    latlngs.map( (latlng) => {
      if (latlng.length == 2) {
        const json = JSON.parse(latlng[1]);
        json.map( (j) => {
          list.push({ X: j[1], Y: j[2], CT: j[0] });
        });
      }
    });
  };

// 选择设备和选择端口参数时要设置请求url的值
  handlerSetReqBodyUrl = (_reqBodyUrl) => {
    this.setState({
      _reqBodyUrl,
    });
  };

  // 获取map
  getMap = (map) => {
    this.setState({
      _map:map,
    })
  };
  paramPnl = () => {
    this.setState({
      paramPnlVisible: !this.state.paramPnlVisible,
    });
  };

  // 查询事件type:0 decodeStore; type:1 realStore;
  fetchEvent = (type, visible, pageNum) => {
    const me = this;
    const dc = (new Date()).getTime();
    const url = '/api/AirFleet/GetEventList/';
    const deviceIds = this.state.deviceIds;
    let ids = [];
    if (deviceIds) {
      ids = deviceIds.join(',');
    }
    const range = (pageNum - 1) * 50;
    fetch(`${url  }?_dc=${  dc  }&DeviceIds=${  ids  }&RealTime=${  type  }&page=${  pageNum  }&start=${  range  }&limit=50`, {
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        this.setState({ eventList: respData });
        // TODO:每5s更新一次
      })
      .catch((error) => {
        console.log(error);
      });

  };

  // 过滤事件
  fetchFilteredEvent = (params,type,pageNum) => {
    const me = this;
    const dc = (new Date()).getTime();
    const url = '/api/AirFleet/GetFilteredEventList/';
    let deviceIds = null;
    let timeRange = [];
    let startDateTime = '';
    let endDateTime = '';
    let RealTime = true;
    if(type === 1){
      deviceIds = params.realEventParams.devPort;
      timeRange = params.realEventParams.timeRange;
      if(timeRange !== undefined && timeRange.length > 0){
        startDateTime = moment(timeRange[0]._d).format('YYYY-MM-DD HH:mm:ss');
        endDateTime = moment(timeRange[1]._d).format('YYYY-MM-DD HH:mm:ss');
      }
      RealTime = true;
    }else if(type === 0){
      deviceIds = params.encodeEventParams.devPort;
      timeRange = params.encodeEventParams.timeRange;
      if(timeRange !== undefined && timeRange.length > 0){
        startDateTime = moment(timeRange[0]._d).format('YYYY-MM-DD HH:mm:ss');
        endDateTime = moment(timeRange[1]._d).format('YYYY-MM-DD HH:mm:ss');
      }
      RealTime = false;
    }else{
      deviceIds = '';
    }
    let ids = [];
    if (deviceIds) {
      ids = deviceIds.join(',');
    }

    const range = (pageNum - 1) * 50;
    fetch(`${url  }?_dc=${  dc  }&devPort=${  ids }&startDateTime=${startDateTime}&endDateTime=${endDateTime}&realTime=${  RealTime   }&start=${  range  }&limit=50`, {
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        this.setState({ eventList: respData });
        // TODO:每5s更新一次
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // 请求选择端口数据
  fetctPortsSelect = () => {
    const dc = (new Date()).getTime();
    const url = '/api/AirFleet/DevicePortList/';
    const deviceIds = this.state.deviceIds;

    // 如果用户没有选择设备就不用去查询端口
    if (!deviceIds || deviceIds.length <= 0) {
      return;
    }
    let ids = [];
    if (deviceIds) {
      ids = JSON.stringify(deviceIds);
    }
    const isChecked = true;
    fetch(`${url  }?_dc=${  dc}`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `cond={"DeviceTypes":[],"DeviceIds":${  ids  },"NotDisplayZero":${  isChecked  }}`,
    })
      .then((resp) => resp.json())
      .then((respData) => {
        const data = respData.data;
        const devPortList = [];
        // 处理数据
        if(data){
          data.map((d) => {devPortList.push(`${d.Name}-p${d.PortNum}`)});
        }

        this.setState({ devPortLists: devPortList });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  alarmEventForm = () => {
    this.setState({
      alarmEventFormVisible: !this.state.alarmEventFormVisible,
    });

    this.fetchEvent(1, true, 1);
    this.fetctPortsSelect();

  };

  detailPnl = (bool) => {
    this.setState({
      detailPnlVisible: bool,
    });
  };

  getDevRec = (rec) => {
    this.setState({
      recData: rec,
    });

    this.viewDevice(rec);
  };

  getDevIds = (val, recs) => {
    this.setState({
      deviceIds: val,
      deviceLists: recs,
    });

  };

  viewDevice = (d) => {
    const me = this;
    const desktop = Desktop._desktop_current;
    const deviceId = d.DeviceId;
    if (deviceId === null) {
      desktop.detail_device = null;
      Desktop.saveCurrentDesktop();
      Desktop._detailDevice = null;
      Desktop._detailDevicePort = null;
    } else if (Desktop._detailDevice != deviceId) {
      const old = desktop.detail_device;
      desktop.detail_device = deviceId;
      Desktop.saveCurrentDesktop();
      Desktop._detailDevice = deviceId;
      Desktop._requestMoreDetail = true;
      me.refs.getDetailPnl.setInfo(d,null,d);
     // _pnlDetail.clearInfo();
     // _pnlDetail.setOffline();
      // me._firstRequestDetail = true;
      this.setState({
        _firstRequestDetail:true,
      });
      // _pnlDetail.setLoading(F.C.Loading);
      // _pnlDetail.show();

      // me.fireEvent('change_view_device', me, deviceId, old);
    }
    this.detailPnl(true);
  };

  monitorPnl = () => {
    this.setState({
      monitorPnlVisible: !this.state.monitorPnlVisible,
      detailPnlVisible: false,
    });
  };

  // 定位到设备
  posdevice = (data) => {
    let p = null;
    let static1 = false;
    if (typeof data.StaticLat !== 'undefined' &&
      typeof data.StaticLng !== 'undefined') {
      p = [data.StaticLat, data.StaticLng];
      static1 = true;
    } else if (typeof data.Lat !== 'undefined' &&
      typeof data.Lng !== 'undefined') {
      p = [data.Lat, data.Lng];
    }
    if (p) {
      this.state._map.panTo(p, static1);
    }
  };

  // 参数覆盖到地图
  map_set_para_overlay = (paramConfig,rec,param) => {
    const deviceId = rec.DeviceId;
    const port = rec.PortNum;
    const deviceName = rec.Name;
    const paramId = param.Code;
    const network = param.NetType;

    const url = `api/Airfleet/GetParam?paramId=${  paramId  }&netType=${  network}`;
    const tagId = `${deviceId  }_${  port  }_${  paramId}`;
    let cfg = '';
    for(const i in paramConfig) {
     // cfg = paramConfig[i];
      param = paramConfig[i];
      if (param.ThresholdsStr) {
        param.Thresholds = JSON.parse(param.ThresholdsStr);
      }
      if(param.Code === paramId && param.NetType === network){
        cfg = param;
      }
    }
      // console.log(cfg);
      if(cfg !== ''){
        const pitem = {
          TagId: tagId,
          Hide: false,
          DeviceId: deviceId,
          DeviceName: deviceName,
          Port: port,
          ParamId: paramId,

          ParamName: cfg.Name,
          Scale: cfg.Scale,
          ThresholdType: cfg.ThresholdType,
          Thrholds: cfg.Thresholds,

          Historys: [],
        };
        this.makeParamOnMap(pitem, tagId);
      }else{
        const dc = (new Date()).getTime();
        fetch(`${url }&_dc=${dc}`, {
          credentials: 'include',
          method: 'GET',
        })
          .then((resp) => resp.json())
          .then((respData) => {
            console.log(respData);
            const d = respData.data;
            if (d.ThresholdsStr) {
              d.Thresholds = JSON.parse(d.ThresholdsStr);
            }
            const pitem2 = {
              TagId: tagId,
              Hide: false,
              DeviceId: deviceId,
              DeviceName: deviceName,
              Port: port,
              ParamId: paramId,

              ParamName: d.Name,
              Scale: d.Scale,
              ThresholdType: d.ThresholdType,
              Thrholds: d.Thresholds,

              Historys: [],
            };
            this.makeParamOnMap(pitem2, tagId);
          })
          .catch((error) => {
            console.log(error);
          });
      }
  };

  makeParamOnMap = (pitem, tagId) => {
    const me = this;
    const _portParaHistory = me.state._portParaHistorys;
    // console.info(me.state._portParaHistorys);
    let containsTagId = false;

      for(let i =0;i<_portParaHistory.length;i++) {
        const portParaHistory = _portParaHistory[i];

        if (portParaHistory.TagId === tagId) {
          containsTagId = true;
        }
      }

    if(!containsTagId){
      _portParaHistory.push(pitem);
      me.refs._pnlMap.getParamLegend(pitem);  // 显示参数覆盖图例
      me.refs._pnlMap.initComponent(me.state._map); // 更新地图
    }

    me.setState({
      _portParaHistorys:_portParaHistory,
    });
  };

  changePortParaHistorys = (tagId) => {
    const me = this;
    const _portParaHistory = me.state._portParaHistorys;
    const index = null;
    for(let i =0;i<_portParaHistory.length;i++) {
      const portParaHistory = _portParaHistory[i];

      if (portParaHistory.TagId === tagId) {
        // index = i;
        _portParaHistory.splice(i,1);
        break;
      }
    }

    if(index !== null){
      _portParaHistory.splice(index,1);
    }
    // me.setState({
    //   _portParaHistorys:_portParaHistory
    // });
   // console.log(me.state._portParaHistorys);
  };

  hideParamLayer = (tagId) => {
    const me = this;
    const hide = ! me.state.hideRec;
    const _portParaHistory = me.state._portParaHistorys;
    for(let i =0;i<_portParaHistory.length;i++) {
      const portParaHistory = _portParaHistory[i];

      if (portParaHistory.TagId === tagId) {
        portParaHistory.Hide = hide;
      }
    }
    me.setState({
      _portParaHistorys:_portParaHistory,
      hideRec:hide,
    });
  };
  // 请求重组
  getRequest = () => {
    // console.log(this.state.deviceLists)
    const deviceStore = this.state.deviceLists;
    const data2 = {};
    deviceStore.map((rec) => {
      const deviceId = rec.DeviceId;
      const lastGPS = rec.LastRequestGPS;
      const time = {};
      if (typeof lastGPS !== 'undefined') {
        time.GPS = lastGPS;
      }
      if (typeof rec.StaticLat !== 'undefined') {
        time.GPS = -1;// 定点设备不需要GPS历：史
      }
      data2[deviceId] = time;
    });

    const _portParaHistory = this.state._portParaHistorys;
    const Id4ParaHistorys = [];
    _portParaHistory.map((item) => {
      const deviceId = item.DeviceId;
      const port = item.Port;
      const paramId = item.ParamId;
      const lastRequestTime = item.LastRequestTime;
      Id4ParaHistorys.push({
        Id: deviceId,
        Port: port,
        ParamId: paramId,
        LastRequestTime: lastRequestTime,
      });
    });

    const oldReqBodyUrl = this.state._reqBodyUrl;
    oldReqBodyUrl.Id4Status = data2;
   oldReqBodyUrl.Id4ParaHistorys = Id4ParaHistorys;
    this.setState({
      _reqBodyUrl:oldReqBodyUrl,
    })

  };

  render() {
    const parentMethods = {
      ondata:this.ondata,
      firstdata:this.firstdata,
      paramPnlVisible: this.state.paramPnlVisible,
      alarmEventFormVisible: this.state.alarmEventFormVisible,
      alarmPnlVisible: this.state.alarmPnlVisible,
      eventPnlVisible: this.state.eventPnlVisible,
      detailPnlVisible: this.state.detailPnlVisible,
     // detailData: this.state.detailData,
      monitorPnlVisible: this.state.monitorPnlVisible,
      paramPnl: this.paramPnl,
      map_set_para_overlay:this.map_set_para_overlay,
      alarmEventForm: this.alarmEventForm,
      devPortLists:this.state.devPortLists,
      detailPnl: this.detailPnl,
      getDevRec: this.getDevRec,
      monitorPnl: this.monitorPnl,
      getRequest:this.getRequest,

      eventList: this.state.eventList,
      fetchEvent: this.fetchEvent,
      fetchFilteredEvent:this.fetchFilteredEvent,
      getDevIds: this.getDevIds,
      deviceIds: this.state.deviceIds,
      deviceLists: this.state.deviceLists,
      posdevice:this.posdevice,

      getMap:this.getMap,
      _portParaHistorys:this.state._portParaHistorys,
      changePortParaHistorys:this.changePortParaHistorys,
      hideParamLayer:this.hideParamLayer,
    };

    return (
      <Layout>

        <Sider
          width='380px'
          style={{ background: '#f0f2f5', height: '100%', flexDirection: 'cloumn' }}
          collapsible
          collapsed={!this.state.monitorPnlVisible}
          collapsedWidth="0"
        >

          <MonitorPnl
            style={{ flex: 1, overflow: 'hidden' }}
            {...parentMethods}
            _reqBodyUrl={this.state._reqBodyUrl}
            onSetReqBodyUrl={this.handlerSetReqBodyUrl.bind(this)}
          />

          <DetailPnl style={{ flex: 1 }} {...parentMethods} ref="getDetailPnl" />

        </Sider>

        <Content style={{display:'flex',flexDirection:'column', background: '#3ba0e9', height: '100%' }}>
          <MapPnl style={{flex:'6'}} {...parentMethods} ref="_pnlMap" />
          <ParamPnl
            style={{flex:'4'}}
            {...parentMethods}
            ref="_pnlPara"
            oldReqBodyUrl={this.state._reqBodyUrl}
            onSetReqBodyUrl={this.handlerSetReqBodyUrl.bind(this)}
          />
        </Content>

        <Sider
          width='380px'
          style={{ height: '100%' }}
          collapsible
          collapsed={!this.state.alarmEventFormVisible}
          collapsedWidth="0"
        >
          <AlarmEventForm {...parentMethods} />
        </Sider>
      </Layout>
    );
  }
}
