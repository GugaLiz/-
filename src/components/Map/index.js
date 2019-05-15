import React, { PureComponent } from 'react';
import styles from './index.less';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Row, Col, Card, Tooltip, Menu, Dropdown, Icon, Button, Layout, Checkbox, Divider } from 'antd';
import { CellRender } from './CellRender';
import MapTools from './MapTools';

import { BaiduLayer } from 'components/BaiduLayer';
import { Eviltransform } from 'components/Eviltransform';
import {CanvasOverlay} from 'components/CanvasOverlay';
import {CanvasOverlayGL} from 'components/CanvasOverlayGL';
import {CanvasOverlayGPS} from 'components/CanvasOverlayGPS';
import {CanvasOverlayParam} from 'components/CanvasOverlayParam';


const { Content } = Layout;
const SubMenu = Menu.SubMenu;

//把图标重新引入
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.imagePath = '';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('../../assets/markers/marker-icon-2x.png'),
  iconUrl: require('../../assets/markers/marker-icon.png'),
  shadowUrl: require('../../assets/markers/marker-shadow.png'),
});

class MapPanel extends PureComponent{
  state = {
    map: {},
    position: [22.2743053, 113.5703612],  //珠海
    //position:[39.86233781452473,116.46124720573427], //北京
    // soso 22.269161,113.560181 妇幼 ，珠海人民医院 22.274701,113.575909
    // Google map 22.269121,113.5588313  ，22.2743053,113.5703612
    // 百度map 22.261475,113.553052   ，22.280276,113.582328
    showScaleControl:true,
    maxZoom: 18,
    minZoom: 4,
    baseLayers: [],
    _baseLayer:{},
    _currentMapType:1,
    menuTxt: [],
    _gpsMarker:[],

    isRequestedAllSites:false,
    _loadType:0,
    btnLTE:true,
    btnWCDMA:true,
    btnCDMA:true,
    btnTD:true,
    btnGSM:true,
    NetworkType:{ GSM: 0,
      CDMA: 1,
      WCDMA: 2,
      TDSCDMA: 3,
      LTE: 7},

    _cdn:{ loadType: null, netType: [] },
  };

  componentDidMount() {
    //修改坐标的值
    let offsetType = 2;
    let leafletMap = L.map('map', {
      // crs: offsetType === 2 ? L.CRS.BEPSG3857 : L.CRS.EPSG3857,
      //layers: [this.state._baseLayer],
      attributionControl: false,
      editable: true,
      center: this.state.position,
      zoom: 13,
      zoomControl: this.showScaleControl
    });

    let baseLayers = [];
    let maxZoom = this.state.maxZoom;
    let minZoom = this.state.minZoom;

    let gda = L.tileLayer.provider('GaoDe.Annotion', {
      maxZoom: maxZoom,
      minZoom: minZoom,
      offsetType: 2,
    });
    let sosoGda = L.layerGroup([L.tileLayer.provider('SosoMap.Satellite', {
      maxZoom: maxZoom ? maxZoom : 18,
      minZoom: minZoom,
      offsetType: 1,
    }), gda]);
    sosoGda.options = {
      offsetType: 1,
      mars: 1,
    };

    let baiduLayer = L.tileLayer.baiduLayer();

    let sosoMap = L.tileLayer.provider('SosoMap.DE', {
      maxZoom: maxZoom,
      minZoom: minZoom,
      offsetType: 1,
      mars: 1,
    });

    let qqa = L.tileLayer.provider('QQMap.Label', {
      maxZoom: maxZoom,
      minZoom: minZoom,
    });
    let qqGda = L.layerGroup([L.tileLayer.provider('QQMap.Satellite', {
      maxZoom: maxZoom ? maxZoom : 18,
      minZoom: minZoom,
    }), qqa]);
    qqGda.options = {
      mars: 1,
      offsetType: 1,
    };

    let qqDEM = L.layerGroup([L.tileLayer.provider('QQMap.DEM', {
      maxZoom: maxZoom ? maxZoom : 18,
      minZoom: minZoom,
    }), L.tileLayer.provider('QQMap.Label2', {
      maxZoom: maxZoom,
      minZoom: minZoom,
    })]);
    qqDEM.options = {
      mars: 1,
      offsetType: 1,
    };

    baseLayers.push({
        text: 'Google Street', //F.SH.GoogleStreet,
        layer: L.tileLayer.provider('Google.De', {
          maxZoom: maxZoom,
          minZoom: minZoom,
          'crs': L.CRS.BEPSG3857,
          offsetType: 1,
          hkNoMars: 1, //香港澳门不需要偏移
          mars: 1,
        }),
      }, {
        text: 'Google Satellite',
        layer: L.tileLayer.provider('Google.Satellite', {
          maxZoom: maxZoom,
          minZoom: minZoom,
          hkNoMars: 1,
          offsetType: 1,
          mars: 1,
        }),
      },
      {
        text: 'Baidu Map',
        layer: baiduLayer,
      },
      {
        text: 'SOSO Map',
        layer: sosoMap,
      }, {
        text: 'SOSO Map Satellite',
        layer: L.tileLayer.provider('SosoMap.Satellite', {
          maxZoom: maxZoom,
          minZoom: minZoom,
          offsetType: 1,
          mars: 1,
        }),
      }, {
        text: 'SOSO Map Satellite With Road',
        layer: sosoGda,
      }, {
        text: 'QQ Map Terrain',
        layer: qqDEM,
      }, {
        text: 'QQ Map Satellite',
        layer: L.tileLayer.provider('QQMap.Satellite', {
          maxZoom: maxZoom,
          minZoom: minZoom,
          mars: 1,
          offsetType: 1,
        }),
      }, {
        text: 'QQ Map Satellite With Road',
        layer: qqGda,
      }, {
        text: 'Open Street Map',
        layer: L.tileLayer.provider('OpenStreetMap.Mapnik', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'OpenStreetMap Black and White',
        layer: L.tileLayer.provider('OpenStreetMap.BlackAndWhite', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Gray',
        layer: L.tileLayer.provider('MapBox.Gray', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Dark',
        layer: L.tileLayer.provider('MapBox.Dark', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Light',
        layer: L.tileLayer.provider('MapBox.Light', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Emerald',
        layer: L.tileLayer.provider('MapBox.Emerald', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Satellite',
        layer: L.tileLayer.provider('MapBox.Satellite', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      },
      {
        text: 'Map Satellite Street',
        layer: L.tileLayer.provider('MapBox.SatelliteStreet', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: 'Map Streets Classic',
        layer: L.tileLayer.provider('MapBox.StreetsClassic', {
          maxZoom: maxZoom,
          minZoom: minZoom,
        }),
      }, {
        text: '离线地图',
        layer: L.tileLayer.provider('StaticMap', {
          maxZoom: maxZoom,
          minZoom: minZoom,
          offsetType: 1,
        }),
      }, {
        text: '不使用地图',
        layer: null,
      });

    let baseLayer = baseLayers[0].layer;
    this.setState({
      _baseLayer:baseLayer
    });
    let url = baseLayers[0].layer._url;
    let options = baseLayers[0].layer.options;
    L.tileLayer(url, options).addTo(leafletMap);
    leafletMap._baseLayer = baseLayer;

    if(this.state.showScaleControl){
      L.control.scale({ position: 'bottomleft' }).addTo(leafletMap);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);
    }
    leafletMap.showStatusInfo =  (text, fontColor) => {
      this.getStatusPanel(text, fontColor);
    };

    leafletMap.removeStatusBox = () => {
      this.removeStatusBox();
    };

    leafletMap.on('moveend',function(e){
      let center = leafletMap.getCenter();
      let zoom = leafletMap.getZoom();
      let str = [zoom, center.lat, center.lng].join(',');
      // if (me.rememberPos) {
      //   me.saveInLocal(me.RememberPosKEY, str);
      // }
    });
    // add a marker
    var marker = L.marker([22.2743053, 113.5703612]).addTo(leafletMap);

    if (leafletMap) {
      this.setState({
        map: leafletMap,
        marker: marker,
      });
      //this.props.getMap(leafletMap);
    }


    let menuTxt = [];
    for (let layer in baseLayers) {
      menuTxt.push(baseLayers[layer].text);
    }

    this.setState({
      baseLayers: baseLayers,
      menuTxt: menuTxt,
    });
  }
  // componentWillUnmount () {
  //   let map = this.state.map;
  //   map.remove();
  // };

  showMonitorPnl = () => {
    this.props.monitorPnl();
  };
  /*
  * 坐标转换
  * */

  getMarsGPSFunc = (marsType, latlng) => {
    if (marsType === 2) { // baidu maps mars
      return L.EvilTransform.bd_encrypt2(latlng[0], latlng[1]);
    } else if (marsType === 1) { //坐标是火星类型
      return L.EvilTransform.transform(latlng[0], latlng[1]);
    } else {
      return latlng;
    }
  };
  getMarsGPS = (marsType, latlng) => { // 返回自己或者[lat, lng]
    return this.getMarsGPSFunc(marsType, latlng);
  };
  toGoodGPSFunc = (marsType, latlng) => {
    if (marsType === 2) { // 百度地图
      return L.EvilTransform.bd_decrypt2(latlng[0], latlng[1]);
    } else if (marsType === 1) { // 火星到正确
      return L.EvilTransform.gcj2wgs(latlng[0], latlng[1]);
    } else {
      return latlng;
    }
  };
  toGoodGPS = (marsType, latlng) => {
    return this.toGoodGPSFunc(marsType, latlng);
  };
//end 坐标转换
  onChangeSiteCity = (v) => {
    this.setState({
      _loadType:v
    });
  };
  onChangeNetType = (key) => {
    switch(key)
    {
      case "LTE":
        this.setState({
          btnLTE:!this.state.btnLTE
        });
        break;
      case "WCDMA":
        this.setState({
          btnWCDMA:!this.state.btnWCDMA
        });
        break;
      case "CDMA":
        this.setState({
          btnCDMA:!this.state.btnCDMA
        });
        break;
      case "TDSCDMA":
        this.setState({
          btnTD:!this.state.btnTD
        });
        break;
      case "GSM":
        this.setState({
          btnGSM:!this.state.btnGSM
        });
        break;
    }
  };

  getSiteCdn = () => {
    //let cdn = this.state._cdn;
    let cdn = { loadType: null, netType: [] };
    let me = this;
    cdn.loadType = parseInt(me.state._loadType);
    let btnLTE = me.state.btnLTE;
    let btnWCDMA = me.state.btnWCDMA;
    let btnCDMA = me.state.btnCDMA;
    let btnTD = me.state.btnTD;
    let btnGSM = me.state.btnGSM;
    const NetworkType = this.state.NetworkType;
    if (btnLTE)
      cdn.netType.push(NetworkType.LTE);
    if (btnWCDMA)
      cdn.netType.push(NetworkType.WCDMA);
    if (btnCDMA)
      cdn.netType.push(NetworkType.CDMA);
    if (btnTD)
      cdn.netType.push(NetworkType.TDSCDMA);
    if (btnGSM)
      cdn.netType.push(NetworkType.GSM);

    me.setState({
      _cdn:cdn
    });
    return cdn;
  };
  getNearestCity = (location,fn) => {
    let lat = location.lat;
    let lng = location.lng;
    //fetch CellInfo
    let url = '/api/CellInfo/GetNearestCity';
    let params = "Lat="+lat+"&Lng="+lng;
    fetch(url  , {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:params
    })
      .then((resp) => resp.json())
      .then((respData) => {
        let city = respData.data;
        fn(city);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  getCellRender = (callback) => {
    let me = this;
    CellRender.addTo(this.state.map);
    CellRender.setVisible(true);
    let isRequestedAllSites = me.state.isRequestedAllSites;
    let cdn = me.getSiteCdn();
    if(cdn.netType.length === 0){
      alert("请先勾选要显示的网络。");
    }
    let params = {};
    if(cdn.loadType === 1){//全部基站
      isRequestedAllSites = true;
      me.setState({
        isRequestedAllSites:isRequestedAllSites
      });

      params = {
        City:'',
        NetType:cdn.netType
      };

      CellRender.loadData(params,false,callback);
    }else if(cdn.loadType === 0){
      let fn = (city) => {
        params = {
          City: city,
          NetType: cdn.netType
        };
        CellRender.loadData(params,false,callback);
      };

      let map = me.state.map;
      let loc = map.getCenter();
      //let loc = me.state.position;
      me.getNearestCity(loc,fn);
    }else {
      if(callback){
        callback();
      }
      alert("请先勾选显示项。");
    }
  };

  //加载基站显示
  getStatusPanel = (text,fontColor) => {
    let me = this;
    fontColor = fontColor || 'black';
    let map = this.state.map;
    let legend = L.control({position: 'bottomright'});
    let statusPanel = '';
    legend.onAdd = function (map) {
      statusPanel = L.DomUtil.create('div', 'info legend');
      statusPanel.innerHTML = "<p style='background:rgba(0,0,0,0.3);border-radius:5px;font-size:14px;margin:50px 50px -50px 0px'>"+text+"</p>" ;
      return statusPanel;
    };
    legend.addTo(map);
    me.legend = legend;
  };

  removeStatusBox = () => {
    if(this.legend){
      this.legend.remove();
    }
  };

  getCurrentMapType = (offsetType) => {
    this.setState({
      _currentMapType:offsetType
    })
  };
//验证经纬度合法性
  validLngLat = (lng,lat) => {
    if(lng && lat){
      if (lng >= -180 && lng <= 180
        && lat <= 90 && lat >= -90) {
        return true;
      }
    }
  };
  panTo = (p,noMarker) => {
    console.log(p);
    let me = this;
    let map = this.state.map;
    let pp = me.getMarsGPS(this.state._currentMapType,p);
    let gps = { lat: pp[0], lng: pp[1] };
    if (gps) {
      console.log(gps)
      if (gps.length == 2 &&
        me.validLngLat(gps[1], gps[0])) {
        map.panTo(gps);
        if (!noMarker) {
          let mark = me.state._gpsMarker;
          let content = gps.join(',');
          if (!mark) {
            mark = L.marker(gps);
            mark.addTo(map).bindPopup(content).openPopup();
            //me._gpsMarker = mark;
            me.setState({
              _gpsMarker:mark
            });
          } else {
            mark.setPopupContent(content);
            mark.setLatLng(gps);
          }
        }
      }
    }
  };
  refreshGPS =  () => {
    let me = this;
    //Ext.defer(function () {
    let lyr = me._GL_Layer;
    lyr.refresh();
    //});
  };

  getParamLegend = (pitem) => {
    let me = this;
    me.refs._paramLegend.addParam(pitem);
  };

  changePortParaHistorys = (tagId) =>{
    this.props.changePortParaHistorys(tagId);
  };

  hideParamLayer = (tagId) => {
    this.props.hideParamLayer(tagId);
  };
  render() {
    const { monitorPnl, monitorPnlVisible, paramPnlVisible } = this.props;
    const display = monitorPnlVisible ? 'none' : 'block';
    const isDisplay = { display: display };
    const h = window.innerHeight - 64;
    const height = paramPnlVisible ? 0.6 * h : h;

    const style = {
      width: '100%',
      height: height * 0.8,
      //height: '600px',
      //height:'100%'
    };

    const style1 = {
      display: display,
      margin: '10px 0 0 5px',
      position: 'absolute',
      zIndex: 19999,
    };

    const parentMethods = {
      map: this.state.map,
      baseLayers: this.state.baseLayers,
      menuTxt: this.state.menuTxt,
      getMarsGPS: this.getMarsGPS,
      toGoodGPS: this.toGoodGPS,
      marker: this.state.marker,
      getCellRender:this.getCellRender,
      onChangeSiteCity:this.onChangeSiteCity,
      onChangeNetType:this.onChangeNetType,
      getCurrentMapType:this.getCurrentMapType,
      changePortParaHistorys:this.changePortParaHistorys,
      hideParamLayer:this.hideParamLayer,
    };

    return (
      <div >
        <div style={style1}>
          <Tooltip title="侧边栏">
            <Button size="small" style={{ width: '32px', height: '32px' }} onClick={this.showMonitorPnl}>
              A
            </Button>
          </Tooltip>
        </div>

        <div id="map" style={style}>
          <MapTools {...parentMethods} />
          {/*<ParamLegend {...parentMethods} ref="_paramLegend" style={{pointerEvents:'auto'}}/>*/}
        </div>

      </div>

    );
  }

}

export default MapPanel;
