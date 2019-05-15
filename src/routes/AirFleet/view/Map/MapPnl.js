import { Component } from 'react';
import { Menu,  message, Button, Tooltip, Icon, Dropdown, Divider, Input, Checkbox,Radio } from 'antd';
import Map from './Map';
import {ColorUtils} from './ColorUtils';

export default class MapPnl extends Component{
  state = {
    _map:{},
    _GL_Layer:null,
    rememberBaseMap: true,
    rememberPos: true,
    contextmenu: false,
    maxZoom: 17,
  };

  initComponent = (map) => {
    let me = this;
     // me.props.map_ready(map);
      //me.props.map_init(map);

    let usingGL = true;
    let lyr = L.canvasOverlayGPS(function (map, usingGL) {
      return me.getMapData(map,usingGL);
    });

      lyr.addTo(map);
      me.setState({
        _GL_Layer:lyr
      });


    // me.on('offset_change', function (oldOffsetType, newOffsetType) {
    //   var old = me._mapOnMars;
    //   var newMars = typeof newOffsetType != 'undefined' &&
    //     newOffsetType == 1;
    //   me._mapOnMars = newMars;
    //   if (old != newMars) {
    //     me.refreshGPS();
    //     me.redrawDevices();
    //   }
    // });
  };

  getMapData = (map,usingGL) => {
    let me = this;
    //let map = me.state._map;
    let toRGB = ColorUtils.toRGB;
    let toPixel = ColorUtils.LatLongToPixelXY;
    if (!usingGL) {
      toRGB = function (v) { return v; };
      toPixel = function (x, y) {
        return map.latLngToContainerPoint([x, y]);
      };
    }

    let paraHistorys = me.props._portParaHistorys;
    let verts = [];
    let pointSize = 10;
    let alpha = 0.7;
    let color = toRGB('#007A60');
    let count = 0;
    let utc = (new Date()).getTime();
    let pixelSize = 0.00025;
    /* gpsStore.eachKey(function (deviceId, obj, idx, len) {
      //console.info(obj, obj.Hide);
      if (obj && !obj.Hide) {
        let gps = obj.List;
        let offsetTop = obj.OffsetTop ? obj.OffsetTop * pixelSize : 0;
        let offsetLeft = obj.OffsetLeft ? obj.OffsetLeft * pixelSize : 0;
        if (gps && gps.length > 0) {
          //DONE:使用遍历绘制所有选择的GPS
          //console.info(gps);
          //var gps = [
          //    [22.244110107421875, 113.56826782226562],
          //    [22.244029998779297, 113.56822967529297],
          //    [22.243993759155273, 113.56819915771484],
          //    [22.243959426879883, 113.56816864013672]
          //];
          if (gps.length > 0) {
            utc = gps[gps.length - 1].CT;
          }
          for (let j = 0, jLen = gps.length; j < jLen; j++) {
            let hist = gps[j];
            let green = color[1];
            let p = me.getMarsGPS([hist.Y, hist.X]);
            let pixel = toPixel(p[0] + offsetTop, p[1] + offsetLeft);
            if (pixel.x < 0 || pixel.y < 0) continue;
            let x = pixel.x;
            let y = pixel.y;
            if (!usingGL) {
              verts.push({
                x: x,
                y: y,
                color: color
              });
            } else {
              verts.push(x, y, pointSize,
                color[0], green, color[2], alpha);
            }
            count++;
          }
        }
      }
    }); */
    let colorDict = {};
    paraHistorys.map((item) => {
      if (item.Historys && item.Historys.length > 0) {
        let historys = item.Historys;
        let offsetTop = item.OffsetTop ? item.OffsetTop * pixelSize : 0;
        let offsetLeft = item.OffsetLeft ? item.OffsetLeft * pixelSize : 0;
        if (!item.Hide) {
          let discrete = item.ThresholdType > 0;
          let Thrholds = item.Thrholds;
          if(Thrholds !== 'undefined'){
            Thrholds.map((thr) => {
              thr.Color = thr.Color.replace('0x', '#');
              thr.RGBColor = toRGB(thr.Color);
            });
          }

          let getColor = discrete ? ColorUtils.getDiscreteColor : ColorUtils.getColor;
          let holds = Thrholds;
          if (discrete && Thrholds && Thrholds.length > 0) {
            getColor = ColorUtils.getColor;
          } else if (discrete) {
            if (!item.DiscreteColor) {
              item.DiscreteColor = {};
            }
            holds = item.DiscreteColor;
          }

          for (let j = 0, jLen = historys.length; j < jLen; j++) {
            let hist = historys[j];
            let val = hist.Value;
            if (!hist.RGBColor) {
              let vv = val * item.Scale;
              hist.RGBColor = getColor(holds, vv, usingGL, item, me);
            }
            let color = hist.RGBColor;
            let p = me.refs._map.getMarsGPS(0,[hist.Y, hist.X]);
            let pixel = toPixel(p[0] + offsetTop, p[1] + offsetLeft);
            if (!usingGL) {
              if (pixel.x < 0 || pixel.y < 0) continue;
              verts.push({
                x: pixel.x,
                y: pixel.y,
                color: color
              });
            } else {
              verts.push(pixel.x, pixel.y, pointSize,
                color[0], color[1], color[2], alpha);
            }
            count++;
          }
        }
      }
    });
    return { data: verts, total: count };
  };

  getParamLegend = (pitem) => {
    let me = this;
    me.refs._map.getParamLegend(pitem);
  };

  changePortParaHistorys = (tagId) =>{
    this.props.changePortParaHistorys(tagId);
  };

  hideParamLayer = (tagId) => {
    this.props.hideParamLayer(tagId);
  };

  getMap = (leafletMap) => {
    this.setState({
      _map:leafletMap
    });
    this.initComponent(leafletMap);
    this.props.getMap(leafletMap);
  };

  showMonitorPnl = () => {
    this.props.monitorPnl();
  };
  render (){

    const parentMethods = {
      getMap:this.getMap,
      monitorPnlVisible:this.props.monitorPnlVisible,
      paramPnlVisible:this.props.paramPnlVisible,
      changePortParaHistorys:this.changePortParaHistorys,
      hideParamLayer:this.hideParamLayer,
    };
    return (
      <Map {...parentMethods} ref="_map" />
    )
  }

}
