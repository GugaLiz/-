export var Desktop = {
  _storage_key: "__desktop",

  _desktop_current: {
    detail_device: 0, //设备详细信息
    track_device: false, //设备地图上是否跟踪
    devices: [], //当前选择的设备
    paras: [], //解码参数界面选择的参数
    ports: [], //解码参数界面选择的端口
    mos_ports: [], //mos监控窗口
    desktop_id: 0,//TODO:桌面的Id 允许6个桌面设置
    test_grid: null, //测试网格
    test_navigation: null, //测试导航

    show_para: false, //是否显示参数
    show_mos: false, //是否显示实时MOS

    show_alarm: undefined, //是否显示告警
    show_event: undefined, //是否显示事件

    have_atu: false //devices中是否有ATU
  },

  saveInLocal: function (key, data) {
    let me = this;
    if (localStorage) {
      localStorage.removeItem(key);
      if (data) {
        // localStorage.setItem(key, Ext.JSON.encode(data));
        localStorage.setItem(key, eval(data));
      }
    }
  },

  saveCurrentDesktop: function () {
    let me = this;
    me.saveInLocal(me._storage_key,
      me._desktop_current);
  },

  getInLocal: function (key) {
    let me = this;
    if (localStorage) {
      let data = [];
      try {
        //data = Ext.JSON.decode(localStorage.getItem(key));
        data = JSON.parse(localStorage.getItem(key));
      } catch (e) {
      }
      if (data) {
        return data;
      } else {
        localStorage.removeItem(key);
      }
    }
    return null;
  },

  loadCurrentDesktop: function () {
    let me = this;
    let desktop = me.getInLocal(me._storage_key);
    if (desktop) {
      me._desktop_current = desktop;
    }
  },

  getRequest: function(){
    let me = this;
    let desktop = me._desktop_current;
    let isDecodeEvent = me._EventType == 2;
    let Id4Status = null;
    let Id4Detail = null;
    let Id4PortCellLine= null;
    let Id4Paras = [];
    let Id4ParaHistorys = [];

    if (me._detailDevice !== null) { //设备详情
      Id4Detail = me._detailDevice;
    }
    if (me._detailDevicePort !== null) { //设备详情
      Id4PortCellLine = me._detailDevicePort;
    }
    if (me._deviceStore !== null) { //设备列表
      let data2 = {};
      //me._deviceStore.each(function (rec) {
      me._deviceStore.map((rec) => {
        let deviceId = rec.data.DeviceId;
        let lastGPS = rec.data.LastRequestGPS;
        let lastAlarm = rec.data.LastRequestAlarm;
        let lastEvent = rec.data.LastRequestEvent;
        let lastDecodeEvent = rec.data.LastRequestDecodeEvent;
        let time = {};
        if (typeof lastGPS != 'undefined') {
          time.GPS = lastGPS;
        }
        if (typeof rec.data.StaticLat != 'undefined') {
          time.GPS = -1;//定点设备不需要GPS历：史
        }
        data2[deviceId] = time;
      });
      Id4Status = data2;
    }
    if (me._devicePorts.length > 0 &&
      me._portParas.length > 0) { //参数信息
      me._devicePorts.map( (port) => {
        let deviceId = port.DeviceId;
        let no = port.PortNum;
        let paras = [];
        me._portParas.map( (para) => {
          paras.push(para.Code);
        });
        Id4Paras.push({
          Id: deviceId,
          Port: no,
          Para: paras
        });
      });
    }
    //参数历史覆盖
    if (me._portParaHistorys.length > 0) {
      me._portParaHistorys.map( (key, item) => {
        let deviceId = item.DeviceId;
        let port = item.Port;
        let paramId = item.ParamId;
        let lastRequestTime = item.LastRequestTime;
        Id4ParaHistorys.push({
          Id: deviceId,
          Port: port,
          ParamId: paramId,
          LastRequestTime: lastRequestTime
        });
      });
    }

    if (Id4Status === null &&
      Id4Paras.length === 0 &&
      Id4ParaHistorys.length === 0 &&
      Id4Detail === null) {
      return null;
    } else {
      let data = {};
      if (me._requestMoreDetail) {
        data.RequestMoreDetail = true; //第一次请求, 请求全量的信息和GPS历史列表信息
        me._requestMoreDetail = false;
      }
      if (Id4Status) { data.Id4Status = Id4Status; }
      if (Id4Detail) { data.Id4Detail = Id4Detail; }
      if (Id4PortCellLine) { data.Id4PortCellLine = Id4PortCellLine; }
      if (Id4ParaHistorys) { data.Id4ParaHistorys = Id4ParaHistorys; }
      if (Id4Paras && desktop.show_para) { data.Id4Paras = Id4Paras; }
      data.EventLastTime = me.EventLastTime;
      console.log(data);
      return data;
    }
  },

  _requestMoreDetail: false,

  _deviceStore: null, //MainView.js负责新建，存储当前选择的设备
  _detailDevice: null,

  //参数_start
  _devicePorts: [],
  _portParas: [],
  //参数_end

  //参数覆盖，历史参数
  _portParaHistorys: [],

  ////实时Mos
  _mosPorts: [],

  loadFromDesktop: function () {
    let me = this;
    let desktop = me._desktop_current;
    //me._deviceStore.removeAll();
    me._deviceStore = [];
    let detail_id = null;
    let have_atu = false;
    if (desktop.devices) {
      let recs = [];
      desktop.devices.map(  (r) => {
        let id = r.Id;
        if (r.DeviceType == 1) {
          have_atu = true;
        }
        if (desktop.detail_device == id) {
          detail_id = id;
        }
        r.GPSOffset = null;
        r.StatusDescription = null;
        r.Status = -1;
        r.LastRequestGPS = null;
        r.LastRequestAlarm = null;
        r.LastRequestEvent = null;
        r.LastRequestDecodeEvent = null;
        recs.push(r);
      });
     // me._deviceStore.add(recs);
      me._deviceStore.push(recs);
    }
    desktop.have_atu = have_atu; //是否有ATU
    desktop.detail_device = detail_id; //详情
    me._detailDevice = detail_id;
    me._trackDevice = desktop.track_device;
    //me._devicePorts.removeAll();
    me._devicePorts = [];
    if (desktop.ports) {
      desktop.ports.map( (r) => {
        let id = r._id;
        if (!me._devicePorts.containsKey(id)) {
          //me._devicePorts.add(id, r);
          me._devicePorts.push(id,r);
        }
      });
    }

   // me._portParas.removeAll();
    me._portParas = [];
    if (desktop.paras) {
      desktop.paras.map( (r) => {
        let id = r.Code;
        // if (!me._portParas.containsKey(id)) {
        //   me._portParas.add(id, r);
        // }
        for(let i in desktop.paras){
          let p = desktop.paras[i];
          if(p.id === id){
            me._portParas.push(id,r);
          }
            }
      });
    }

    if (me._mosPorts) {
      //me._mosPorts.removeAll();
      me._mosPorts = [];
      if (desktop.mos_ports) {
        desktop.mos_ports.map(  (r) => {
          let id = r._id;
          // if (!me._mosPorts.containsKey(id)) {
          //   me._mosPorts.add(id, r);
          // }
          for(let i in _mosPorts){
            let p = _mosPorts[i];
            if(p.id === id){
              me._mosPorts.push(id,r);
            }
          }
        });
      }
    }
  },
};
