import { Component } from 'react';
import { Menu, message, Button, Tooltip, Icon, Dropdown, Divider, Input, Checkbox, Radio } from 'antd';
import styles from './ParamLegend.less';

export default class ParamLegend extends Component {
  state = {
    paramCache: {},
    _paramHtml: [],
    isTitleOpen: true,
    isThresholds:true,
  };

  addParam = (cfg) => {
    let me = this;
    let tagId = cfg.TagId;
    me.state.paramCache[tagId] = cfg;
    // let paramBody = me.paramBody;
    let thrs = cfg.Thrholds;
    let deviceId = cfg.DeviceId;
    let deviceName = cfg.DeviceName;
    let port = cfg.Port;
    let paramId = cfg.ParamId;
    let paramName = cfg.ParamName;
    let discrete = cfg.ThresholdType && cfg.ThresholdType == 1;
    let paramHtml = me.state._paramHtml;

    let thresholdsBody = tagId+"-threshodsBody";



    let portName = deviceName + '-P' + port + '-' + paramName;
    let type = me.state.isThresholds ? "down":"up";
    let portHtml = (
      <div className="" style={{ height: '18px' }}>
        <div className={styles.dabutton} da-tag-type="ICON_HIDE_THRESHOLDS" style={{ width: '200px' }}>
          <i className={styles.fa}><Icon type={type} theme="outlined" key={portName} onClick={() => me.hideThresholds(tagId)} /></i>
          {portName}
        </div>
      </div>
    );

    let divId = 'param-item-' + tagId;
    let discreteH = discrete ? 'class="da-param-discrete" ' : '';
    let html = '';
    if (thrs) {
      let thrDivArr = [];
      thrs.map((thr) => {
        let color = thr.Color.replace('0x', '#');
        let style = { background: color };
        let thrDiv = (
          <div>
            <span className={styles.daparambox} style={style}>
            </span>
            {thr.ThrStr}
          </div>
        );
        thrDivArr.push(thrDiv);
      });
      html = (
        <div id={tagId}>
          <tr className="da-layer-param-item" id={divId}>
            <td discreteH>
              {portHtml}
            </td>
            <td className={styles.tac}>
              <input type="checkbox" class="da-hide-layer da-button-tag" da-tag-type="ICON_HIDE_LAYER" checked="0"
                     da-tag={tagId} onClick={() => me.hideParamLayer(tagId)}/>
            </td>
            <td className={styles.tac}>
              <i className={styles.dabutton} da-tag={tagId} da-tag-type="ICON_REMOVE_LAYER"
                 style={{ color: 'red', fontWeight: 'bold' }} onClick={() => me.removeParam(tagId)} >
                <Icon type="close" />
              </i>
            </td>
          </tr>

          <tr className="da-layer-param-thrs" id={thresholdsBody}>
            <td colSpan="3" style={{ padding: '0 0 0 26px' }}>
              {thrDivArr.map((item) => {
                return item;
              })}
            </td>
          </tr>
        </div>
      );
    }
    paramHtml.push(html);
    me.setState({
      _paramHtml: paramHtml,
    });
    //me.checkEvents(paramBody);
  };

  checkEvents = () => {

  };

  changeIcon = () => {
    let isTitleOpen = !this.state.isTitleOpen;
    this.setState({
      isTitleOpen: isTitleOpen,
    });
    let containerBody = document.getElementById('containerBody');
    if (isTitleOpen) {
      containerBody.style.display = 'block';
    } else {
      containerBody.style.display = 'none';
    }
  };
  hideThresholds = (key) => {
    let isThresholds = !this.state.isThresholds;
    this.setState({
      isThresholds: isThresholds,
    });
    let divId = key + '-thresholdsBody';
    let thresholdsBody = document.getElementById(key);
    let thresholdTrs = thresholdsBody.getElementsByTagName('tr');
    let thresholdDiv = thresholdTrs[1];
    if (isThresholds) {
      thresholdDiv.style.display = 'block';
    } else {
      thresholdDiv.style.display = 'none';
    }
  };
  hideParamLayer = (tagId) => {
    //console.log(tagId);
    //this.props.hideParamLayer(tagId);
  };

  removeParam = (key) => {
    let me = this;
    let paramBody = me.state._paramHtml;
    let paramCache = this.state.paramCache;

    let thresholdsBody = document.getElementById(key);
    thresholdsBody.remove();
    delete paramCache[key];

    for(let i =0;i<paramBody.length;i++){
      let pb = paramBody[i];
      if(pb.props.id == key){
        paramBody.splice(i,1);
        break;
      }
    }

    me.props.changePortParaHistorys(key);
  };

  render() {

    let titleIcon = this.state.isTitleOpen ? (<Icon type="up" theme="outlined"/>) : (
      <Icon type="down" theme="outlined"/>);

    return (
      <div className={styles.dacontainer}>
        <div className={styles.datitle}>
          <div className={styles.daleft}>
            <i><Icon type="bars" theme="outlined"/></i>
            <span className={styles.datitletext}>参数覆盖</span>
          </div>
          <div className={styles.daright}>
            <i><Icon type="sliders" theme="outlined"/></i>
            <i onClick={this.changeIcon}>
              {titleIcon}
            </i>
          </div>
        </div>
        <div className={styles.dacontainerbody} id='containerBody'>
          <table class="da-border1 da-width100 da-layer-param da-overflowbody da-ddgroup-layer">
            <thead>
            <tr>
              <th class="bottom_b1" colSpan="3">
                <span className={styles.padding8l}>参数</span>
              </th>
            </tr>
            </thead>
            <tbody style={{ maxHeight: '250px' }}>
            {this.state._paramHtml}
            </tbody>
          </table>

          <table class="da-border1 da-width100 margin3t da-layer-gps da-overflowbody">
            <thead>
            <tr>
              <th class="bottom_b1" colSpan="3">
                <span className={styles.padding8l}>GPS</span>
              </th>
            </tr>
            </thead>
            <tbody style={{ maxHeight: '250px' }}>

            </tbody>
          </table>

        </div>
      </div>
    );
  }

}
