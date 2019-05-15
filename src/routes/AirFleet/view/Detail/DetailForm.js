import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Icon, Tooltip,
  Tabs, 
} from 'antd';

import styles from './DetailForm.less';

import MyIcon from 'components/MyIcon';

import StatusPnl from './StatusPnl';
import PortGrid from './PortGrid';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane; 

export default class DetailForm extends PureComponent {
  state={
    detailData:[],
    portGridVisible:false,
    portGridData:[]
  };

  close = () => {
    this.props.detailPnl(false);
  };

  setParamValue = () => {

  }

//处理ports数据
  setPorts = (data,ports) => {
    let me = this;
    if(ports){
      let _store = data;
      let _setParamValue = me.setParamValue;
      for(let portNum in ports){
        let p = ports[portNum];
        if(p && p.Paras){
          let paras = p.Paras;
          let networkId = paras[2132615169];
          if(typeof networkId != 'undefined' && typeof networkId.V != 'undefined'){
            let para1Name = null;
            let para1Value = null;
            let para1Id = null;
            let para1 = null;
            let para2Name = null;
            let para2Value = null;
            let para2Id = null;
            let para2 = null;
            let networkName = null;

        var network = parseInt(networkId.V);
        if (network == 0x01) {//GSM
            networkName = 'GSM';
            para1Name = 'RxLevelFull';
            para1Id = 2130706691;

          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }
            para2Name = 'RxQualSub';
            para2Id = 2130706694;
            if(paras[para2Id]){
              para2 = paras[para2Id];
              para2Value = para2.V;
            }

        } else if (network == 0x08) { //CDMA
            networkName = 'CDMA';
            para1Name = 'RxAGC';
            para1Id = 0x7F010001;
          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }
            para2Name = 'TotalEcIo';
            para2Id = 0x7F01000C;
          if(paras[para2Id]){
            para2 = paras[para2Id];
            para2Value = para2.V;
          }

        } else if (network == 0x011111) {//EVDO
            networkName = 'EVDO';
            para1Name = 'EV_RxAGC0';
            para1Id = 0x7F018001;
          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }

            para2Name = 'TotalSINR';
            para2Id = 0x7F018008;
          if(paras[para2Id]){
            para2 = paras[para2Id];
            para2Value = para2.V;
          }
        } else if (network == 0x02) { //WCDMA
            networkName = 'WCDMA';
            para1Name = 'TotalRSCP';
            para1Id = 0x7F02000D;
          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }

            para2Name = 'TotalEcIo';
            para2Id = 0x7F02000A;
          if(paras[para2Id]){
            para2 = paras[para2Id];
            para2Value = para2.V;
          }
        } else if (network == 0x04) { //TDSCDMA
            networkName = 'TDSCDMA';
            para1Name = 'PCCPCH_RSCP';
            para1Id = 0x7F03011B;
          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }

            para2Name = 'PCCPCH_SIR';
            para2Id = 0x7F030122;
          if(paras[para2Id]){
            para2 = paras[para2Id];
            para2Value = para2.V;
          }

        } else if (network == 0x10 || network == 0x30) { //LTE //NB-IoT
            networkName = 'LTE';
            if (network == 0x30) networkName = 'NB-IoT';
            //var technology = paras[2132615176];
            ////通过2132615176 判断是否在NB-IOT下
            //if (technology && technology == 41) {
            //    networkName = 'NB-IOT';
            //}
            para1Name = 'RSRP';
            para1Id = 0x7F06000E;
          if(paras[para1Id]){
            para1 = paras[para1Id];
            para1Value = para1.V;
          }

            para2Name = 'SINR';
            para2Id = 0x7F060001;
          if(paras[para2Id]){
            para2 = paras[para2Id];
            para2Value = para2.V;
          }
        } else if (network == 0x20) { //Unknown
            networkName = 'Unknown';
        } else if (network == 0x80) { //NoService
            networkName = 'NoService';
        }

        if(networkName ){
          p.CurrentNetwork = networkName;
        }
        if(para1Name ){
          p.Para1Name = para1Name;

        }
        if(para2Name){
          p.Para2Name = para2Name;
        }

        if(para1Value){
          p.Para1Value = para1Value;
        }
        if(para2Value){
          p.Para2Value = para2Value;
        }
          }
      }
    }
    _store.Ports = ports;
    this.setState({
      portGridData:_store
    });
  }
};

  //处理数据
  setInfo = (data, model, device, utcNow) => {
    //console.info(data,this.props.detailData);
    let me = this;
    if(device){
      data.IdentifierGuid = device.IdentifierGuid;
      data.Name = device.Name;
      data.DeviceType = device.DeviceType;
      data.Version = device.Version;
    }
    this.setState({
      detailData:data
    });
    let linePortData = null;
    let gotPortData = false;
    //处理ports
    if(data.Ports){
      let ports = [];

      let linePort = '';
      for(let portNum in data.Ports){
        let rec = data.Ports[portNum];
        if(portNum == linePort){
          let masterCell = rec.Cell;
          gotPortData = true;
          if(masterCell){
            linePortData = {
              data:rec,
              cell:masterCell
            };
          }
        }
        rec.PortNum = portNum;
        ports.push(rec);
      }
      me.setPorts(data,data.Ports);
    }
  };


  render() {
    const {detailPnl,detailPnlVisible} = this.props;
    //console.log(detailData);
    const height = window.innerHeight * 0.6;
    const display = detailPnlVisible ? 'block' : 'none';
    const style = {
      display:display,
      padding:'0px',
      height:height
    }

    const isDisplay = {display:display};
    const operations = <a name="close" style={{color:'rgba(0,0,0,0.85'}}><Icon type="close"  onClick={this.close} /></a>  ;

    return (
      <Card style = {style}>
      <div className={styles.titleStyle}>
          <text>设备详情</text>
      </div>
      <Tabs type="card" tabBarExtraContent={operations} size="small" onChange={this.changeKey}>
        <TabPane tab={<span><MyIcon iconName={"statuPnl"} />设备状态</span>}  key="1" >
        <StatusPnl detailData={this.state.detailData}></StatusPnl>
         
        </TabPane>

        <TabPane tab={<span><MyIcon iconName={"portGrid"} />端口列表</span>} key ="2" >
        <PortGrid portDatas={this.state.portGridData} ></PortGrid> 
        </TabPane>
      </Tabs>
      </Card>

    );
  }
}
