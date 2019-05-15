import { Component } from 'react';
import { Menu,  message, Button, Tooltip, Icon, Dropdown, Divider, Input, Checkbox,Radio } from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';
import styles from './MapTools.less';
import FetchJsonp from 'fetch-jsonp';
//图标引入
import MyIcon from 'components/MyIcon';

import L from 'leaflet';
import { ProviderLayer } from 'components/ProviderLayer';
import {Editable} from 'components/Editable';
import {LineMeasure} from 'components/LineMeasure';

const SubMenu = Menu.SubMenu;
const Search = Input.Search;
const RadioGroup = Radio.Group;

export default class MapTools extends Component {
  state = {
    searchDisplay: 'none',
    currentMapType: 1,//Google map
    searchMarkLayerGroup: null,
    _measurePolyline:null,
    _pressed:false,
    _isClear:true,
    current:'Google Street',

    isDisabled:false,

    currentCityChecked:true,
    allCityChecked:false,
    btnLTE:true,
    btnWCDMA:true,
    btnCDMA:true,
    btnTD:true,
    btnGSM:true,
  };

  changeDisplay = () => {
    this.setState({
        searchDisplay: 'block',
      },
    );
  };

  handleLoadSite = () => {
    //let map = this.props.map;
    let callback = () => {
      // this.setState({
      //   isDisabled:true
      // });
    };
    this.props.getCellRender(callback);
  };

//搜索框内容为空时清除地图上搜索的坐标
  handlerSearchKeyUp = (val) => {
    if (!val.target.value) {
      this.clearSearchMarkInMap();
    }
  };
  //清除地图上搜索的坐标
  clearSearchMarkInMap = () => {
    let searchMarkLayerGroup = this.state.searchMarkLayerGroup;
    if (searchMarkLayerGroup) {
      searchMarkLayerGroup.clearLayers();
    }
  };
  //搜索栏功能
  searchPlace = (val) => {
    this.baiduSearchPlace(val, (addrArr) => {
      if (addrArr.length <= 0 || !addrArr[0].location) {
        //就是没有查到地方
        message.warning('查询不到该地址');
        return;
      }
      let searchMarkLayerGroup = this.state.searchMarkLayerGroup;
      this.clearSearchMarkInMap();
      for (let i = 0; i < addrArr.length; i++) {
        let address = addrArr[i];
        let baiduLoc = address.location; //百度服务器返回的坐标
        //  let loc = L.EvilTransform.bd_decrypt(parseFloat(baiduLoc.lat), parseFloat(baiduLoc.lng));//转换为百度的坐标进行打点
        let getMarsGPS = this.props.getMarsGPS;
        let toGoodGPS = this.props.toGoodGPS;
        let oldLatlngArr = [baiduLoc.lat, baiduLoc.lng];
        let oldMapType = this.state.currentMapType;
        let goodlatLngArr = toGoodGPS(2, oldLatlngArr);
        let marsLatLngArr = getMarsGPS(oldMapType, goodlatLngArr);
        let map = this.props.map;
        let marker = L.marker(marsLatLngArr, { title: address.name });
        if (searchMarkLayerGroup == null) {
          searchMarkLayerGroup = L.layerGroup(marker).addTo(map);
        } else {
          searchMarkLayerGroup.addLayer(marker).addTo(map);
        }
        // var marker = L.marker(marsLatLngArr, { title: address.name }).addTo(map);
        if (i === 0) {
          map.setView(L.latLng(marsLatLngArr[0], marsLatLngArr[1]));//设置中心位置
        }
      }//end for
      this.setState({
        searchMarkLayerGroup: searchMarkLayerGroup,
      });
    });
  };
  //验证用户输入和调用
  preGeoCoder = (address, callback) => {
    if (!typeof (callback) === 'function') {
      return true;
    }
    if (!address) {
      //清除地图上的搜索标注
      this.clearSearchMarkInMap();
      return true;
    }
    let arraystr = address.split(',');
    if (arraystr.length === 2) {
      let lng = parseFloat(arraystr[0]);
      let lat = parseFloat(arraystr[1]);
      callback(L.latLng([lat, lng]));
      return true;
    }
    return false;
  };
  //百度地图搜索接口
  baiduSearchPlace = (address, callback) => {
    if (this.preGeoCoder(address, callback)) {
      return;
    }
    //调用了这个api获取位置,写死了全国,以后可以扩展 11111
    let url = 'http://api.map.baidu.com/place/v2/search?query=' + address + '&region=全国&output=json&ak=BSIrfxmbVkcqgaLtfexkr8GUjZemXNs7';
    FetchJsonp(url)
      .then(function(response) {
        return response.json();
      }).then(function(json) {
      let addrArr = json.results;
      callback(addrArr);
    }).catch(function(ex) {
      console.log('error');
      console.info(ex);
      message.error('请求百度地图获取位置出错');
    });
  };

  changeBaseLayer = (val) => {
    let getMarsGPS = this.props.getMarsGPS;
    let toGoodGPS = this.props.toGoodGPS;
    let marker = this.props.marker;
    let map = this.props.map;
    let _baseLayerName = val.key;
    //let _baseLayer = {};
    let _baseLayer = map._baseLayer;

    let baseLayers = this.props.baseLayers;
    for (let i = 0; i < baseLayers.length; i++) {
      let baseLayer = baseLayers[i];
      if (baseLayer.text == _baseLayerName) {
        map.removeLayer(_baseLayer);//去除旧底图
        _baseLayer = baseLayer.layer;
        map._baseLayer = _baseLayer;
        this.setState({
          current: baseLayer.text
        });
        break;
      }
    }
    //坐标转换
    let oldMapType = this.state.currentMapType;
    let offsetType = _baseLayer.options.offsetType;
    let oldLatlng = marker._latlng;
    //转换为数组
    let oldLatlngArr = [oldLatlng.lat, oldLatlng.lng];
    let goodlatLngArr = toGoodGPS(oldMapType, oldLatlngArr);
    let marsLatLngArr = getMarsGPS(offsetType, goodlatLngArr);
    //console.log("百度火星坐标：")
    //console.info(marsLatLngArr)
    marker.setLatLng({ lat: marsLatLngArr[0], lng: marsLatLngArr[1] });
    map.addLayer(_baseLayer);
    this.setState({
      currentMapType: offsetType,
    });
    this.props.getCurrentMapType(offsetType);
  };

  setStateOff = () => {
    let mesurPolyline = this.state._measurePolyline;
    if(mesurPolyline){
      mesurPolyline.dispose();
      mesurPolyline = null;
    }
  };

  onShapeClick = (map) => {
    let  del = function (e) {
      console.log(e);
      //e.target.bindTooltip("双击删除图形").openTooltip();
      e.target.remove()
    };
    map.on("layeradd",function(e) {
      // e.layer.bindTooltip("单击绘制起点，双击完成图形").openTooltip();
      if (e.layer instanceof L.Path) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', del, e.layer);
      if (e.layer instanceof L.Path) e.layer.on('click', L.DomEvent.stop).on('click', e.layer.toggleEdit);
    })
  };
  onMeasure = () => {
    this.setStateOff();
    let map = this.props.map;
    let mesurePolyline = this.state._measurePolyline;
    mesurePolyline = new L.Draw.LineMeasure(map);
    mesurePolyline.enable();
  };

  onDraw = (val) => {
    let map = this.props.map;
    let type = val.key;
    if (type === "polyline") {
      map.editTools.startPolyline();
    } else if (type === "polygon") {
      map.editTools.startPolygon();
    } else if (type === "rectangle") {
      map.editTools.startRectangle();
    } else if (type === "marker") {
      map.editTools.startMarker();
    }
    this.onShapeClick(map);
  };

  onChangeSiteCity = (val) => {
    if(val.key === "0"){
      this.setState({
        currentCityChecked:true,
        allCityChecked:false
      });
    }else{
      this.setState({
        currentCityChecked:false,
        allCityChecked:true
      });
    }
    this.props.onChangeSiteCity(val.key);
  };

  onChangeNetType = (val) => {
    let key = val.key;
    this.props.onChangeNetType(key);
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

  render() {
    const { map, menuTxt } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const site = (
      <Menu inlineCollapsed={false}>
        <SubMenu title="显示" >
          <MenuItem trigger={['click']} onClick={this.onChangeSiteCity} key={0}>
            <Checkbox checked={this.state.currentCityChecked}/>
            <Divider type="vertical"/>当前城市</MenuItem>
          <MenuItem trigger={['click']} onClick={this.onChangeSiteCity} key={1}>
            <Checkbox checked={this.state.allCityChecked}/>
            <Divider type="vertical"/>全部</MenuItem>
        </SubMenu>
        <SubMenu title="网络">
          <MenuItem key="LTE" onClick={this.onChangeNetType}>
            <Checkbox checked={this.state.btnLTE}  />
            <Divider type="vertical"/>LTE</MenuItem>
          <MenuItem key="WCDMA" onClick={this.onChangeNetType}>
            <Checkbox checked={this.state.btnWCDMA}  />
            <Divider type="vertical"/>WCDMA</MenuItem>
          <MenuItem key="CDMA" onClick={this.onChangeNetType}>
            <Checkbox checked={this.state.btnCDMA} />
            <Divider type="vertical"/>CDMA</MenuItem>
          <MenuItem key="TD" onClick={this.onChangeNetType}>
            <Checkbox checked={this.state.btnTD}  />
            <Divider type="vertical"/>TD</MenuItem>
          <MenuItem key="GSM" onClick={this.onChangeNetType}>
            <Checkbox checked={this.state.btnGSM} />
            <Divider type="vertical"/>GSM</MenuItem>
        </SubMenu>
      </Menu>
    );

    const toolBox = (
      <Menu style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
        <MenuItem key="measure" onClick={this.onMeasure}><MyIcon iconName={'measure'}/></MenuItem>
        <MenuItem key="polyline" onClick={this.onDraw}><MyIcon iconName={'polyline'}/></MenuItem>
        <MenuItem key="polygon" onClick={this.onDraw}><MyIcon iconName={'polygon'}/></MenuItem>
        <MenuItem key="rectangle"  onClick={this.onDraw}><MyIcon iconName={'rectangle'}/></MenuItem>
        <MenuItem key="marker"  onClick={this.onDraw}><MyIcon iconName={'marker'}/></MenuItem>
        {/*<MenuItem key="clear"  onClick={this.onDraw}><MyIcon iconName={'clear'}/></MenuItem>*/}
      </Menu>
    );

    const baseLayer = (
      <Menu
        selectedKeys={this.state.current}
      >
        {menuTxt.map((item) => (
          <MenuItem key={item} onClick={this.changeBaseLayer}>{item}</MenuItem>
        ))}
      </Menu>
    );

    const style1 = {
      display: 'flex',
      width: '100%',
      margin: '10px',
      position: 'absolute',
      zIndex: 999,
      justifyContent: 'space-between',
    };

    return (
      <div style={style1}>
        <div>
          <Search
            style={{ width: '250px', display: 'block', marginLeft: '30px' }}
            placeholder="北京市天安门广场"
            onSearch={this.searchPlace}
            onKeyUp={this.handlerSearchKeyUp}
            enterButton
          />
        </div>

        <Button.Group style={{ marginRight: '60px' }}>
          <Dropdown.Button disabled={this.state.isDisabled} onClick={this.handleLoadSite}  overlay={site} trigger={['click']}>
            <Tooltip title="基站" placement="rightBottom">
              <MyIcon iconName={'site'}/>
            </Tooltip>
          </Dropdown.Button>

          <Dropdown overlay={toolBox} trigger={['click']}>
            <Tooltip title="工具栏" placement="rightBottom">
              <Button>
                <MyIcon iconName={'tools'}/>
              </Button>
            </Tooltip>
          </Dropdown>

          <Dropdown overlay={baseLayer} trigger={['click']}>
            <Tooltip title="底图" placement="rightBottom">
              <Button>
                <MyIcon iconName={'layer'}/>
              </Button>
            </Tooltip>
          </Dropdown>

        </Button.Group>

      </div>
    );
  }
}
