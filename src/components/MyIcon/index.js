import React, { PureComponent } from 'react';
import styles from './index.less';

//图标引入
import device from '../../assets/images/monitor/device.ico';
import param from '../../assets/images/monitor/para.ico';
import event from '../../assets/images/monitor/event.ico';
import alarm from '../../assets/images/monitor/alarm.ico';
import online from '../../assets/images/monitor/online.ico';
import offline from '../../assets/images/monitor/offline.ico';
import remove from '../../assets/images/monitor/remove.ico';
import pos from '../../assets/images/monitor/pos.ico';
import noPos from '../../assets/images/monitor/pos-disabled.ico';

import portGrid from '../../assets/images/detail/port_gri.ico';
import statuPnl from '../../assets/images/detail/statu_pnl.ico';

import s_port from '../../assets/images/param/c_port.ico';
import s_param from '../../assets/images/param/para.ico';

import site from '../../assets/images/map/site.ico';
import tools from '../../assets/images/map/tools.ico';
import layer from '../../assets/images/map/layer.png';

import measure from '../../assets/images/map/measure.ico';
import polyline from '../../assets/images/map/polyline.ico';
import polygon from '../../assets/images/map/polygon.ico';
import rectangle from '../../assets/images/map/rectangle.ico';
import marker from '../../assets/images/map/marker.ico';
import clear from '../../assets/images/map/clear.ico';

import light from '../../assets/images/device/light.ico';
import liteprobe from '../../assets/images/device/liteprobe.ico';
import pioneer from '../../assets/images/device/pioneer.ico';
import RCU from '../../assets/images/device/RCU.ico';
import scout from '../../assets/images/device/scout.ico';
import walktour from '../../assets/images/device/walktour.ico';
import walktourpack from '../../assets/images/device/walktourpack.ico';
import ATU from '../../assets/images/device/ATU.png';
import VIP from '../../assets/images/device/VIP.png';
import indoor_ATU from '../../assets/images/device/indoor.png';
import scout2 from '../../assets/images/device/scount2.png';
import BCU from '../../assets/images/device/BCU.png';
import CTU from '../../assets/images/device/CTU.png';

import Evdo from '../../assets/images/nettype/Evdo.ico';
import GSM from '../../assets/images/nettype/GSM.ico';
import LTE from '../../assets/images/nettype/LTE.ico';
import Tdscdma from '../../assets/images/nettype/Td-scdma.ico';
import Wcdma from '../../assets/images/nettype/Wcdma.ico';
import Wifi from '../../assets/images/nettype/WiFi.ico';

class MyIcon extends PureComponent {
  state = {
    icon: '',
    txt: '',
    deviceArr: [{ Value: '0', Icon: RCU, Text: 'light' },
      { Value: '1', Icon: ATU, Text: 'ATU' },
      { Value: '2', Icon: walktour, Text: 'Walktour' },
      { Value: '3', Icon: scout, Text: 'Scout' },
      { Value: '4', Icon: VIP, Text: 'VIP' },
      { Value: '5', Icon: pioneer, Text: 'Pioneer' },
      { Value: '6', Icon: walktourpack, Text: 'WalktourPack' },
      { Value: '7', Icon: indoor_ATU, Text: 'Indoor_ATU' },
      { Value: '8', Icon: scout2, Text: 'Scout2_0' },
      { Value: '9', Icon: light, Text: 'RCU_Light' },
      { Value: '10', Icon: BCU, Text: 'BCU' },
      { Value: '11', Icon: CTU, Text: 'CTU' },
      { Value: '13', Icon: liteprobe, Text: 'Liteprobe' }],
    netType: [
      { Value: '0', Icon: GSM, Text: 'GSM' },
      // {Value:'1',Icon:Tdscdma,Text:'Tdscdma'},
      { Value: '2', Icon: Wcdma, Text: 'WCDMA' },
      { Value: '3', Icon: Tdscdma, Text: 'TDSCDMA' },
      { Value: '7', Icon: LTE, Text: 'LTE' },
    ],
  };

  setDeviceIcon = (type, val) => {
    let arr = [];
    let icon = null, txt = '';
    let model = null;
    if (type == 'device') {
      arr = this.state.deviceArr;
      for (let i = 0; i < arr.length; i++) {
        model = arr[i];
        txt = val.Name;
        if (model !== null && model.Value == val.DeviceType) {
          icon = model.Icon;
          break;
        }
      }
    } else if (type == 'nettype') {
      arr = this.state.netType;
      for (let j = 0; j < arr.length; j++) {
        model = arr[j];
        txt = val.PortNum;
        if (model !== null && model.Text == val.Network) {
          icon = model.Icon;
          break;
        }
      }
    }

    this.setState({
      icon: icon,
      txt: txt,
    });
  };

  render() {
    const { iconName, type, value } = this.props;
    let img = (<span></span>);
    if (iconName) {
      let icon = {};
      let txt = '';
      switch (iconName) {
        case 'device':
          txt = device;
          icon = device;
          break;
        case 'param':
          txt = param;
          icon = param;
          break;
        case 's_port':
          txt = s_port;
          icon = s_port;
          break;
        case 's_param':
          txt = s_param;
          icon = s_param;
          break;
        case 'event':
          txt = event;
          icon = event;
          break;
        case 'alarm':
          txt = alarm;
          icon = alarm;
          break;
        case 'online':
          txt = online;
          icon = online;
          break;
        case 'offline':
          txt = offline;
          icon = offline;
          break;
        case 'remove':
          txt = remove;
          icon = remove;
          break;
        case 'pos':
          icon = pos;
          break;
        case 'noPos':
          txt = noPos;
          icon = noPos;
          break;
        case 'portGrid':
          txt = portGrid;
          icon = portGrid;
          break;
        case 'statuPnl':
          txt = statuPnl;
          icon = statuPnl;
          break;
        case 'site':
          txt = site;
          icon = site;
          break;
        case 'tools':
          txt = tools;
          icon = tools;
          break;
        case 'layer':
          txt = layer;
          icon = layer;
          break;
        case 'measure':
          txt = measure;
          icon = measure;
          break;
        case 'polyline':
          txt = polyline;
          icon = polyline;
          break;
        case 'polygon':
          txt = polygon;
          icon = polygon;
          break;
        case 'rectangle':
          txt = rectangle;
          icon = rectangle;
          break;
        case 'marker' :
          txt = marker;
          icon = marker;
          break;
        case 'clear':
          txt = clear;
          icon = clear;
          break;
      }

      img = (
        <span><img alt={txt} className={styles.icon} src={icon}/></span>
      );
    }

    if (type && value) {
      if (type) {
        this.setDeviceIcon(type, value);

        let txt = this.state.txt;
        let icon = this.state.icon;
        if (icon !== null) {
          img = (
            <span>
              <img alt={txt} src={icon}/>{txt}
              </span>
          );
        } else {
          img = (
            <span>{txt}</span>
          );
        }
      }
    }

    return (
      <span>{img}</span>
    );
  }
}

export default MyIcon;
