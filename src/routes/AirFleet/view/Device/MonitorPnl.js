import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Tooltip, Icon, Button, Table, Radio, Divider, Badge } from 'antd';
import querystring from 'querystring';
import numeral from 'numeral';
import { ChartCard, Field } from 'components/Charts';
import Trend from 'components/Trend';

import DeviceModal from './DeviceModal';
import ConfigModal from './ConfigModal';

import styles from './MonitorPnl.less';

//图标引入
import MyIcon from 'components/MyIcon';

const { Sider, Content } = Layout;

const url = '/api/Airfleet/GetDatas';
const time = 2500;
let first = true;
let monitoring = false;

let timer = null;
let previous = null;

export default class MonitorPnl extends Component {
  componentDidMount() {
    //this.startMonitor();
    monitoring = true;
    this.runMonitor(url,time,first,monitoring);
  }

  //页面关闭时候停止轮询
  componentWillUnmount() {

    monitoring = false;
    this.runMonitor(url,time,first,monitoring);
  }

  static defaultProps = {
    _reqBodyUrl: { 'Id4Status': {}, 'Id4ParaHistorys': [], 'Id4Paras': [] },//请求getDatas的请求参数
  };
  state = {
    _datas: {},
    _monitoring:true,
    //_data_time: 2500,
   // _data_time: 5000,
   // _data_url: '/api/Airfleet/GetDatas',
   // _first: false,
    lzw_json: true,
    _Id4Status: {},
    _onlineData: [],
    _data_list: [],
    _detail_list: [],

    pageNum:1,
    type:1,
    deviceId: [],
    deviceModalVisible: false,
    deviceList: [],
    isOnline: true,
    searchText: '',

    configModalVisible: false,
    eventData: [],
    fetching: false,

    navigationsList:[],
    listGridsList:[],
  };

  close = () => {
    this.props.monitorPnl();
  };


  getId4Status = (recs, val) => {
    if (recs && val) {
      this.setState({
        _data_list: recs,
        deviceId: val,
      });

    }
    this.runMonitor(url, time, false,true);
    this.props.getDevIds(val, recs);
  };


  runMonitor = (url, time, first, monitoring) => {
    let me = this;

    //console.log(monitoring);
    // if(!monitoring){
    //   return;
    // }
    let deviceId = this.state.deviceId;

    let dcTime = (new Date()).getTime();
    let lzw_json = this.state.lzw_json;
    let enableFetch = (typeof(fetch) != 'undefined') ? true : false;
    this.props.getRequest();
    let reqBodyStr = JSON.stringify(me.props._reqBodyUrl);
    reqBodyStr = 'Req=' + reqBodyStr;
    if (enableFetch) {
      fetch(url, {
        method: 'POST',
        headers: {
          'Lzw-Json': lzw_json ? '1' : '0',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: reqBodyStr,

      }).then(function(resp) {
        if (resp.ok && resp.status == 200) {
          if (lzw_json) {
            resp.text().then(function(val) {
              let szl = val.length;
              val = me.lzw_decode(val);
              let data = JSON.parse(val);
              // console.log("getData数据返回")
              //console.info(data);
              if (data) {
                if (first) {
                  me.props.firstdata(data);
                }
                me.props.ondata(data);

                //更新数据
                if (data.Online) {
                  me.setState({
                    _onlineData: data.Online,
                  });
                }

                me.setState({
                  _datas: data,
                });

                //轮询请求

                if (monitoring) {

                  let now = +new Date();
                  if(!previous) previous = now;
                  if(now - previous > 5000){
                    console.log(22222)
                    me.runMonitor(url,time,false,monitoring);
                    previous = now;
                    clearTimeout(timer);
                  }else{
                    //console.log(3333)
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                      me.runMonitor(url,time,false,monitoring);
                      previous = null;
                    },5000);
                  }

                }else if(!monitoring){
console.log(44444);
                  clearTimeout(timer);

                }

              }
            });
          } else {
            resp.json().then(function(data) {
              if (data) {
                if (first) {
                  me.props.firstdata(data);
                }
                me.props.ondata(data);
                //轮询请求
                if (monitoring) {
                  //setInterval(me.runMonitor(url, time, false,true), time);
                }
              }
            });
          }
         // setInterval(me.runMonitor, 5000);
         // me.runMonitor(url,time,false,true);
        } else {
          console.log('web error', resp.status, resp.statusText);
          me.setState({
            _monitoring: false,
          });
          me.reConnect(url,time);

        }
      }).catch(function(e) {
        console.log('oops,error', e);
        me.setState({
          _monitoring: false,
        });
        me.reConnect(url,time);
      });
    } else {
      //ajax
      //  console.log('ajax');
    }
  };


  //启动轮询器
  /*startMonitor = () => {
    console.log(88888)
    let me = this;
    // if (me.state._monitoring) {
    //   return;
    // }
    //me.state._monitoring = true;

    //me.setState(Object.assign( {}, theQuery ));

    let first = true;
    let url = me.state._data_url;
    let time = me.state._data_time;
    me.runMonitor(url, time, first);
  };

  //停止轮询器
  stopMonitor = () => {
    let me = this;
    let url = me.state._data_url;
    let time = me.state._data_time;
    console.log(111111111);
    me.runMonitor(url, time, false);
    me.setState((prevState,props) => ({
      _monitoring:false
    }));
  };*/


  reConnect = (url, time) => {
    // console.log('yyyyy');
  };

  lzw_decode = (data) => {
    let dict = [];
    let out = [];
    let old = '';
    let phrase = '';
    let R = 256;
    let currChar = data.charCodeAt(0);
    let oldPhrase = String.fromCharCode(currChar);
    out.push(oldPhrase);
    let code = R + 2;
    for (let i = 1; i < data.length; i++) {
      let currCode = data.charCodeAt(i);
      if (currCode < 256) {
        phrase = String.fromCharCode(currCode);
      } else if (currCode == R + 1) {
        dict = [];
        code = R + 2;
        continue;
      } else if (currCode == R) {
        break;
      } else {
        if (dict[currCode]) {
          phrase = dict[currCode];
        } else {
          phrase = (oldPhrase + currChar);
        }
      }
      out.push(phrase);
      currChar = phrase[0];
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }
    return out.join('');
  };

  //点击设备
  deviceModal = (flag) => {
    this.setState({
      deviceModalVisible: !!flag,
    });
    //如果显示发送请求加载数据
    if (!this.state.deviceModalVisible) {
      this.fetchDevice(1,1);
    }
  };

  //请求设备数据
  fetchDevice = (type,pageNum) => {
    let isChecked = this.state.isOnline;
    if (type === 2) {
      isChecked = !this.state.isOnline;
    }
    let dc = (new Date()).getTime();
    let url = '/api/AirFleet/DeviceList/';
    let page = pageNum;
    let range = (page - 1) * 15;
    let query = this.state.searchText;
    fetch(url + '?_dc=' + dc + '&OnlyOnlineDevice=' + isChecked +'&query='+query+ '&page='+page+'&start='+range+'&limit=15', {
      credentials: 'include',
      method: 'GET',
    })
      .then((resp) => resp.json())
      .then((respData) => {
        this.setState({ deviceList: respData });
      })
      .catch((error) => {
        //  console.log(error);
      });
  };

//是否勾选在线设备
  changeOnline = () => {
    let isOnline = !this.state.isOnline;
    this.setState({
      isOnline: isOnline,
      type:isOnline ? 2 : 1
    });
    this.fetchDevice(2,1);
  };

  //搜索设备
  setQuery = (value) => {
    this.setState({
      searchText: value
    });
    let type = this.state.type;
    let pageNum = this.state.pageNum;
    this.fetchDevice(type,pageNum);
  };

    fetchNavigations = (pageNum) =>{
      let url = '/api/airfleet/ListNavigations';
      let dc = new Date().getTime();
      let page = pageNum;
      let range = (page-1) * 25;
      let _formData = {page:page,start:range,limit:25};
      let _formDataStr = JSON.stringify(_formData);
      fetch(url + '?_dc=' + dc , {
        credentials: 'include',
        method: 'POST',
        body:_formDataStr
      })
        .then((resp) => resp.json())
        .then((respData) => {
          this.setState({ navigationsList: respData });
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchGrid = (pageNum) => {
      let url = '/api/airfleet/ListGrids';
      let dc = new Date().getTime();
      let page = pageNum;
      let range = (page-1) * 25;
      let _formData = {page:page,start:range,limit:25};
      let _formDataStr = JSON.stringify(_formData);
      fetch(url + '?_dc=' + dc , {
        credentials: 'include',
        method: 'POST',
        body:_formDataStr
      })
        .then((resp) => resp.json())
        .then((respData) => {
          this.setState({ listGridsList: respData });
        })
        .catch((error) => {
          console.log(error);
        });
    };

  configModal = (flag) => {
    this.setState({
      configModalVisible: !!flag,
    });
    if(!this.state.configModalVisible){
      this.fetchGrid(1);
    }
  };

  paramPnl = (flag) => {
    this.props.paramPnl();
  };

  //点击事件/告警
  alarmEventForm = () => {
    this.props.alarmEventForm();
  };

  // detailPnl = () => {
  //   this.props.detailPnl(true);
  // };

  getDevRec = (rec) => {
    //组织这样的请求参数 Id4Detail:5
   // console.log(rec);
    let oldReqBodyUrl = this.props._reqBodyUrl;
    oldReqBodyUrl.Id4Detail = rec.DeviceId;
    this.props.onSetReqBodyUrl(oldReqBodyUrl);

    this.props.getDevRec(rec);
  };

  position = (rec) => {
    // console.log(gps);
    //this.props.getPosition(gps);
    this.props.posdevice(rec);
  };

  remove = (index) => {
    let dlist = this.state._data_list;
    dlist.splice(index, 1);
    this.setState({
      _data_list: dlist,
    });
  };

  getPageNum = (pageNum) => {
    let type = this.state.type;
    this.setState({
      pageNum:pageNum
    });
    this.fetchDevice(type,pageNum);
  };

  getSettingPageNum = (type,pageNum) => {
    if(type == 1){
      this.fetchGrid(pageNum);
    }else if(type == 2){
      this.fetchNavigations(pageNum)
    }
  };

  render() {
    const { loading, monitorPnl, monitorPnlVisible, detailPnlVisible } = this.props;

    let deviceOnline = this.state._onlineData[0];
    let devictTotal = this.state._onlineData[1];

    const display = monitorPnlVisible ? 'block' : 'none';
    const isDisplay = { display: display };
    const h = window.innerHeight;
    const height = detailPnlVisible ? 0.4 * h : h;

    const style = {
      display: display,
      width: '100%',
      height: height,
      padding: '0px',
    };

    const styleTable = {
      height: height - 100,
    };

    const columns = [{
      // fixed:'left',
      dataIndex: 'Status',
      key: 'statu',
      width: '35px',
      render: val =>
        (val && parseInt(val) >= 2) ? (
          <Badge status="success" text="" />
        ) : (
          <Badge status="error" text="" />
        ),
     /* render: (val) => {
        if (val && parseInt(val) >= 2) {
          return <MyIcon iconName={'online'}/>;
        } else {
          return <MyIcon iconName={'offline'}/>;
        }
      },*/
    }, {
      title: '设备名称',
      //fixed:'left',
      dataIndex: 'Name',
      key: 'name',
      width: '200px',
      render: (val, rec) => {
        return <MyIcon type={'device'} value={rec}/>;
      },
    }, {
      title: '移除',
      //fixed:'right',
      dataIndex: 'remove',
      key: 'remove',
      width: '47px',
      render: (text, record, index) =>
        <a name="remove" onClick={() => this.remove(index)}><MyIcon iconName={'remove'}/></a>,

    }, {
      title: '定位',
      //fixed:'right',
      key: 'location',
      width: '45px',
      render: (val, record, index) => {
        if (record.Lat && record.Lng) //有gps
        {
          return <a name="remove" onClick={() => this.position(record)}><MyIcon
            iconName={'pos'}/></a>;
        }
        return <a name="remove" onClick={() => this.position(record)}><MyIcon
          iconName={'noPos'}/></a>;
      },
    }];

    const parentMethods = {
      handleConfigVisible: this.configModal,
      handleDeviceVisible: this.deviceModal,
      getId4Status: this.getId4Status,
      getPageNum:this.getPageNum,
      deviceList: this.state.deviceList,
      changeOnline: this.changeOnline,
      setQuery:this.setQuery,
      checkedVal: this.state.isOnline,
      deviceIdArr: this.state.deviceId,
      navigationsList:this.state.navigationsList,
      listGridsList:this.state.listGridsList,
      fetchGrid:this.fetchGrid,
      fetchNavigations:this.fetchNavigations,
      getSettingPageNum:this.getSettingPageNum
    };

    return (
      <Content style={style}>
        <ChartCard
          style={style}
          bordered={true}
          title="设备监控"
          action={
            <Tooltip title="">
              <Icon type="setting" onClick={this.configModal}/>
              <Icon type="close" onClick={this.close}/>
            </Tooltip>
          }
          footer={

            <Table size="small"
              //bordered
                   style={styleTable}
                   scroll={{ y: height - 180 }}
                   footer={() => {
                     return (<div>设备在线/总数：{deviceOnline}/{devictTotal}
                     </div>);
                   }}
                   columns={columns}
                   dataSource={this.state._data_list}
                   pagination={false}
                   onRowDoubleClick={(rec) => {
                     this.getDevRec(rec);
                     //this.detailPnl();
                   }}
            />
          }
          contentHeight={35}
        >
          <Trend>

            <Button size="small" style={{ marginRight: '5px' }} onClick={this.deviceModal}>
              <MyIcon iconName={'device'}/>设备
            </Button>
            <Button size="small" onClick={this.paramPnl}>
              <MyIcon iconName={'param'}/>
              参数
            </Button>
            <Button size="small" onClick={this.alarmEventForm}>
              <MyIcon iconName={'event'}/>事件/<MyIcon iconName={'alarm'}/>告警
            </Button>

          </Trend>
        </ChartCard>
        <ConfigModal
          {...parentMethods}
          modalVisible={this.state.configModalVisible}
        />
        <DeviceModal
          {...parentMethods}
          modalVisible={this.state.deviceModalVisible}
        />
      </Content>
    );
  }
}
