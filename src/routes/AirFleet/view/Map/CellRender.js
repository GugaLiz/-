//import L from 'leaflet';
import { CanvasExtend } from './canvas-extend';

export var CellRender = {

  state: {
    _map: {},
    _temCans: null,
    splitZoom: 12,
    _status: 'unload',
    _isVisible: false,
    _drawInfo: { r: 0, innerR: 0, items: [] },
    _isGL: null,
    CellDisplayConfig: {},

    _glLayer: null,
    _d3layer: null,
    store: [],

    count: 3000,
    step: 0,
    allDatas: [],
    _filterCdn: null,
    _visibleBounds: null,

    _requestKey: 0,
  },

  addTo: function(map) {
    let me = this;
    this.state._map = map;
    if (this.state._temCans == null) {
      this.state._temCans = document.createElement('canvas');
    }

    this.state._map.on('zoomend', function(type, target) {
      if (!me.state._isVisible) {
        return;
      }
      me.changeRenderLayer(me.state._map.getZoom());
    });
    let point = { x: 0, y: 0 };
    let layer = this.getCanvasLayer();
    let cans = layer._canvas, ctx = cans.getContext('2d');
    CanvasRenderingContext2D.prototype.circleSector = function(x, y, radius, innerR,
                                                               sDeg, eDeg, color, lineWidth, lineColor) {

      let grad = this.createRadialGradient(x, y, 1, x, y, radius + radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.75)');
      grad.addColorStop(1, 'rgba(48,133,157,0.8)');
      this.beginPath();
      this.moveTo(x, y);
      this.arc(x, y, radius, this.DEG * sDeg, this.DEG * eDeg, false);
      this.lineTo(x, y);
      this.strokeStyle = lineColor;
      this.lineWidth = lineWidth;
      this.fillStyle = grad;

      this.stroke();
      this.fill();
      this.closePath();
      this.beginPath();
      this.arc(x, y, innerR, 0, Math.PI * 2, false);
      this.fillStyle = 'rgb(0,156,0)';
      this.lineWidth = lineWidth;
      this.strokeStyle = 'rgba(0,0,0,1)';
      this.stroke();
      this.fill();
      this.closePath();
      return this;
    };
    CanvasRenderingContext2D.prototype.hasPixel = function(x, y) {
      let pixel = this.getImageData(x, y, 1, 1);
      if (pixel) {
        let array = pixel.data;
        if (array[3] == 0) {
          return false;
        } else {
          return (array[0] + array[1] + array[2]) > 0;
        }

      }
      return false; // data.data;
    };
    CanvasRenderingContext2D.prototype.getPixel = function(x, y) {
      let data = this.getImageData(x, y, 1, 1);
      return data.data;

    };
    cans.addEventListener('click', function(e) {
      point.x = e.offsetX;
      point.y = e.offsetY;
    });
    cans.onmousemove = function(e) {
      let x = e.offsetX, y = e.offsetY;
      cans.style.cursor = '';
      let data = ctx.getPixel(x, y);
      let color = data[0] + data[1] + data[2];
      if (color > 0) {
        cans.style.cursor = 'pointer';
      } else {
        cans.style.cursor = '';
      }
    };
    this.state._map.on('click', function(e) {
      let mouserLatlng = e.latlng;
      let mouseP = map.latLngToContainerPoint(mouserLatlng).round();
      let x = mouseP.x, y = mouseP.y;
      // if (!ctx.hasPixel(x, y)) {
      //   return;
      // }
      let items = me.state._drawInfo.items, len = items.length;
      if (len === 0) {
        return;
      }

      me.state._temCans.height = layer._canvas.height;
      me.state._temCans.width = layer._canvas.width;
      let temCtx = me.state._temCans.getContext('2d');
      temCtx.clearRect(0, 0, me.state._temCans.width, me.state._temCans.height);

      let r = me.state._drawInfo.r;
      let r1 = me.state._drawInfo.r;

      for (let i = len - 1; i >= 0; i--) {
        let item = items[i],
          cell = item.cell;
        let azimuth = cell.Azimuth - 90,
          azimuthEnd = azimuth + 65;
        //  区分2G/3G/4G
        if (cell.NetWorkType.toLowerCase() == 'gsm' || cell.NetWorkType.toLowerCase() == 'cdma' || cell.NetWorkType.toLowerCase() == 'evdo') {
          azimuth = azimuth - 45;
          azimuthEnd = azimuth + 90;
        } else if (cell.NetWorkType.toLowerCase() == 'wcdma' || cell.NetWorkType.toLowerCase() == 'td-scdma') {
          r1 = r + 10;
          azimuth = azimuth - 30;
          azimuthEnd = azimuth + 60;
        } else if (cell.NetWorkType.toLowerCase() == 'ltefdd' || cell.NetWorkType.toLowerCase() == 'ltetdd') {
          r1 = r + 20;
          azimuth = azimuth - 15;
          azimuthEnd = azimuth + 30;
        }

        let left = item.x - r1,
          right = item.x + r1,
          top = item.y - r1,
          bottom = item.y + r1;
        if (x < left || x > right || y < top || y > bottom) {
          continue;
        }

        if (cell.Azimuth == 360 || cell.OutdoorIndoor.toLowerCase() == 'indoor') {
          temCtx.circleSector(item.x, item.y, me.state._drawInfo.r / 3, me.state._drawInfo.innerR, '#ff0000', 1);
        } else {
          temCtx.circleSector(item.x, item.y, r1, me.state._drawInfo.innerR, azimuth, azimuthEnd, '#ff0000', 1.5);
        }

        if (temCtx.hasPixel(x, y)) {
          let isRRU = false;
          if (cell.CoverType.toLowerCase() === 'railroad') {
            isRRU = true;
          }
          let html = me._createHtml(isRRU, cell);
          L.popup().setLatLng(item.latlng).setContent(html).openOn(map);
          //me.fireEvent("onClick", record);
          return cell;
        }
      }
    });
  },
  setVisible: function(isVisible) {
    if (this.state._isVisible === isVisible) {
      return;
    }
    let glLayer = this.getGLLayer();
    let d3Layer = this.getCanvasLayer();
    this.state._isVisible = isVisible;
    if (isVisible) {
      this.state._isGL = this.state._map.getZoom() <= this.state.splitZoom; //当前渲染的图层是否GL渲染
      this.setIsVisible_GLLayer(this.state._isGL);
      this.setIsVisible_CanvasLayer(!this.state._isGL);

    } else {
      this.setIsVisible_CanvasLayer(false);
      this.setIsVisible_GLLayer(false);
    }
  },
  loadData: function(params, fitBound, callback) {
    if (!this.state._isVisible) {
      alert('请先打开基站图层。');
      return;
    }
    let me = this;
    if (this.state._status === 'loading') {
      alert('正在请求基站，请稍等。');
      return;
    }
    me.clear();
    me.state._map.removeStatusBox();
    me.state._map.showStatusInfo('正在请求数据...');
    let count = this.statecount;
    let step = this.state.step;
    if (this.state._status === 'loading') {
      alert('正在请求基站，请稍等。');
      return;
    }
    me.state._status = 'loading';
    let _filterCdn = this.state._filterCdn;

    this._getInitBounds();

    //this.props.reload();

    //请求标识
    let requestKey = this.state._requestKey;
    if (requestKey === 0) {
      requestKey++;
    }
    this.state._requestKey = requestKey;

    let key = this.state._requestKey;

    let allDatas = [];
    setTimeout(function() {
      me._stepLoad(key, params, fitBound, allDatas, callback);
    }, 200);
  },
//分步加载
  _stepLoad: function(key, params, fitBound, allDatas, callback) {
    let me = this;
    params = params || {};
    let url = '/api/CellInfo/GetCellInfos';
    let start = this.state.step * this.state.count;
    let count = this.state.count;
    // let _formData = { Start: start, Count: count, Key: key };
    // let _formDataCon = Object.assign(_formData, params);
    // let _formDataStr = JSON.stringify(_formData);

    let hideFn = function () {
      me.hideStatusBarTimeout = setTimeout(function () {
        me.state._map.removeStatusBox();
      }, 7000);
    };

    fetch(url, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 60000,
      body: 'Start=' + start + '&Count=' + count + '&Key=' + key + '&City=' + params.City + '&NetTypes=' + params.NetType[0]
        + '&NetTypes=' + params.NetType[1] + '&NetTypes=' + params.NetType[2] + '&NetTypes=' + params.NetType[3]
        + '&NetTypes=' + params.NetType[4],
    })
      .then((resp) => resp.json())
      .then((respData) => {
        //this.setState({ store: respData });
        //console.log(respData);
        //this.state.store = respData.Data;
        //处理data组装成基站点的数据
        //todo:requireId !==_requestKey  reload
        // var key = a.params.Key;
        // if (key !== me._requestKey) {
        //   //已经重新请求了
        //   hideFn();
        //   if (callback)
        //     callback();
        //   return;
        // }
        //数组对象转化为json
        let obj = respData;
        let titles = obj.Titles, total = obj.Total, array = obj.Data;
        let temData = [], tLen = titles.length;
        if (total > 0 && array && array.length > 0) {
          for (let i = 0, len = array.length; i < len; i++) {
            let obj2 = {}, item = array[i];
            for (let j = 0; j < tLen; j++) {
              obj2[titles[j]] = item[j];
            }
            temData.push(obj2);
          }
        }
        let opacity = 0.8;
        let cSize = 5.0;
        //debugger;
        let data1 = me.render(temData, opacity, cSize);
        data1.map((d) => {
          allDatas.push(d);
        });
        this.state.allDatas = allDatas;
        //me.fireEvent("loaded", temData);
        let network = 0;
        if (array && array.length > 0) {
          network = array[0][array[0].length - 4];
        }
        if (array && array.length === me.state.count) {
          me.state._map.removeStatusBox();
          let loadingAlert = '已加载'+start+'条基站数据，共'+total+'条';
          me.state._map.showStatusInfo(loadingAlert);
          me.state.step++;
          setTimeout(function() {
            me._stepLoad(key, params, fitBound, allDatas, callback);
          }, 200);
          //me._stepLoad(key);
        } else {
          me.state._map.removeStatusBox();
          let loadingCompleted = '加载完成，总共'+total+'个基站';
          me.state._map.showStatusInfo(loadingCompleted);
          hideFn();
          //me.fireEvent("allLoaded", me.store, network);
          me.state._status = 'loaded';
          me.allLoaded();
          if (fitBound)
            me.fitBounds();
          if (callback)
            callback(true);

          me.state.store = allDatas;

        }
      })
      .catch((error) => {
        console.log(error);
        me.state._map.removeStatusBox();
        me.state._map.showStatusInfo('加载失败');
        hideFn();
        me.state._status = 'loaded';
        if (callback)
          callback();
      });
  },
  render: function(data, opacity, cSize) {
    let me = this;
    let glLayer = this.getGLLayer();
    let d3Layer = this.getCanvasLayer();
    let data1 = [];
    //当扇形覆盖类型为“RailRoad”时处理
    let RRUItems = [];
    // if (Ext.isEmpty(data)) {
    //   return data1;
    // }
    let fn = this.getFilterFn(this._filterCdn);

    for (let i = 0, len = data.length; i < len; i++) {
      let cell = data[i];
      cell.color = [0, 0.59, 0, 0.8];
      cell.size = -80;
      cell.lat = cell.Latitude;
      cell.lng = cell.Longitude;
      cell.isVisible = fn(cell);
      glLayer.data.push(cell);
      if (cell.isVisible) {
        this.state._visibleBounds.extend([cell.lat, cell.lng]);
      }

      if (cell.CoverType.toLowerCase() === 'railroad') {
        RRUItems.push(cell);
      } else {
        data1.push(cell);
      }
    }

    //同一个基站id就分到一组，赋同一个color值
    for (let j = 0; j < RRUItems.length; j++) {
      let sidx = []; //需要删除的id
      let color = me.getCol();
      RRUItems[j].s_color = color;
      data1.push(RRUItems[j]);
      let rec_id = RRUItems[j].BTSID;
      for (let k = 1; k < RRUItems.length - 1; k++) {
        let k_id = RRUItems[k].BTSID;
        if (k_id === rec_id) {
          RRUItems[k].s_color = color;
          data1.push(RRUItems[k]);
          sidx.push(k);
        }
      }
      for (let z = 0; z < sidx.length; z++) {
        let k_id1 = sidx[z];
        if (k_id1 === sidx[0]) {
          RRUItems.splice(k_id1, 1);
        } else {
          RRUItems.splice(k_id1 - z, 1);
        }
      }
    }

    if (this.state._isVisible) {
      this.state._isGL = this.state._map.getZoom() <= this.state.splitZoom; //当前渲染的图层是否GL渲染
      this.setIsVisible_GLLayer(this.state._isGL);
      this.setIsVisible_CanvasLayer(!this.state._isGL);
    }
    return data1;
  },
  _getInitBounds: function() {
    let _visibleBounds = this.state._visibleBounds;
    if (_visibleBounds === null) {
      _visibleBounds = L.latLngBounds([0, 0], [0, 0]);
    }
    _visibleBounds._northEast.lat = -91;
    _visibleBounds._northEast.lng = -181;
    _visibleBounds._southWest.lat = 91;
    _visibleBounds._southWest.lng = 181;
    this.state._visibleBounds = _visibleBounds;
    return _visibleBounds;
  },
  _createHtml: function(isRRU, cell) {
    let me = this;
    //let showAll = false;
    let showAll = true;
    let title = '';
    let network = cell.NetWork;
    let setting = {};
    // if (me.state.CellDisplayConfig) { //CellDisplayConfig要处理、在 common->lfmap->CellDisplaySetting.js
    //   let items = me.state.CellDisplayConfig;
    //   items.map((item) => {
    //     if(item.Display){
    //       setting[item.Id] = 1;
    //     }else{
    //       showAll = true;
    //     }
    //   });
    // }

    let list = [];
    if (showAll || setting.Province == 1) {
      list.push({ key: 'Province', title: '省份' });
    }
    if (showAll || setting.City == 1) {
      list.push({ key: 'City', title: '城市' });
    }

    if (showAll || setting.BSCID == 1) {
      title = 'BSC ID';
      if (network == 2 || network == 3)
        title = 'RNC ID';
      if (network != 7) {
        list.push({ key: 'BSCID', title: title });
      }
    }

    if (showAll || setting.BTSName == 1) {
      title = 'BTS Name';
      if (network == 2 || network == 3 || network == 7)
        title = 'NodeB Name';
      list.push({ key: 'BTSName', title: title });
    }

    if (showAll || setting.CellName == 1) {
      list.push({ key: 'CellName', title: '小区名称：' });
    }
    if (isRRU) {
      list.push({ key: 'RRUName', title: '物理小区名称' });
    }
    if (showAll || setting.LAC == 1) {
      title = 'LAC';
      if (network == 7)
        title = 'TAC';
      list.push({ key: 'LAC', title: title });
    }
    if (showAll || setting.BTSID == 1) {
      title = 'BTS ID';
      if (network == 2 || network == 3)
        title = 'NodeB ID';
      else if (network == 7)
        title = 'ENodeB ID';
      list.push({ key: 'BTSID', title: title });
    }

    if (showAll || setting.CellId == 1) {
      list.push({ key: 'CellId', title: '小区ID' });
    }

    if (showAll || setting.EARFCN == 1) {
      title = 'EARFCN';
      if (network === 0)
        title = 'BCCH';
      else if (network === 1)
        title = 'Frequency';
      else if (network == 2 || network == 3)
        title = 'UARFCN';
      list.push({ key: 'EARFCN', title: title });
    }
    if (showAll || setting.CPI == 1) {
      title = 'PCI';
      if (network === 0)
        title = 'BSIC';
      else if (network === 1)
        title = 'PN';
      else if (network === 2)
        title = 'PSC';
      else if (network === 3)
        title = 'CPI';
      list.push({ key: 'CPI', title: title });
    }
    if (showAll || setting.Azimuth == 1) {
      list.push({ key: 'Azimuth', title: '方位角' });
    }
    if (showAll || setting.OutdoorIndoor == 1) {
      list.push({ key: 'OutdoorIndoor', title: '室内/户外' });
    }
    if (showAll || setting.CoverType == 1) {
      list.push({ key: 'CoverType', title: '覆盖类型' });
    }
    if (showAll || setting.NetWorkType == 1) {
      list.push({ key: 'NetWorkType', title: '网络类型' });
    }
    let html = '';
    for (let i = 0, len = list.length; i < len; i++) {
      let item = list[i];
      html += item.title + '&nbsp;:&nbsp;' + cell[item.key] + '<br />';
    }
    return html;
  },
  changeRenderLayer: function(zoom) {
    if (zoom <= this.state.splitZoom) {
      if (!this.state._isGL) {
        this.setIsVisible_GLLayer(true);
        this.setIsVisible_CanvasLayer(false);
        this.state._isGL = true;
      }
    } else {
      if (this.state._isGL) {
        this.setIsVisible_GLLayer(false);
        this.setIsVisible_CanvasLayer(true);
        this.state._isGL = false;
      }
    }
  },
  getGLLayer: function() {
    let _glLayer = this.state._glLayer;
    if (!_glLayer) {
      // let webGL = this.state.map.getWebGL();
      let webGL = L.canvasOverlayGL().addTo(this.state._map);
      webGL.offsetFn = L.EvilTransform.google_encrypt;
      _glLayer = this.createGLLayer();
      this.state._glLayer = _glLayer;
      webGL.addLayer(_glLayer);
    }
    return _glLayer;
  },
  getCanvasLayer: function() {
    let me = this;
    let map = this.state._map;

    let _d3layer = this.state._d3layer;
    if (!_d3layer) {
      let ex = 0.0009;

      let d = L.canvasOverlay();
      _d3layer = L.canvasOverlay(function(layer, params, size, zoomScale, zoom1, options) {
        let ctx = layer._canvas.getContext('2d');
        CanvasRenderingContext2D.prototype.DEG = Math.PI / 180;

        CanvasRenderingContext2D.prototype.circleSector = function (x, y, radius, innerR,
                                                                    sDeg, eDeg, color, lineWidth, lineColor) {

          var grad = this.createRadialGradient(x, y, 1, x, y, radius + radius);
          grad.addColorStop(0, 'rgba(255,255,255,0.75)');
          grad.addColorStop(1, 'rgba(48,133,157,0.8)');


          this.beginPath();

          this.moveTo(x, y);
          this.arc(x, y, radius, this.DEG * sDeg, this.DEG * eDeg, false);
          this.lineTo(x, y);
          this.strokeStyle = lineColor;
          this.lineWidth = lineWidth;
          this.fillStyle = grad;

          this.stroke();
          this.fill();
          this.closePath();
          this.beginPath();
          this.arc(x, y, innerR, 0, Math.PI * 2, false);
          this.fillStyle = "rgb(0,156,0)";
          this.lineWidth = lineWidth;
          this.strokeStyle = "rgba(0,0,0,1)";
          this.stroke();
          this.fill();
          this.closePath();

          return this;
        };
        CanvasRenderingContext2D.prototype.circleSite = function (x, y, radius, innerR, color, lineWidth) {

          var grad = this.createRadialGradient(x, y, 1, x, y, radius + radius);
          grad.addColorStop(0, 'rgba(255,255,255,0.75)');
          grad.addColorStop(1, 'rgba(48,133,157,0.8)');

          var radius = radius;
          var innerRadius = innerR * 2;
          var beginAlpha1 = 0 * Math.PI / 180;
          var endAlpha1 = 90 * Math.PI / 180;

          //第一扇区
          this.beginPath();
          this.arc(x, y, radius, beginAlpha1, endAlpha1, false);
          this.lineTo(x + innerRadius * Math.cos(endAlpha1), y + innerRadius * Math.sin(endAlpha1));
          this.arc(x, y, innerRadius, endAlpha1, beginAlpha1, true);
          this.lineTo(x + radius, y);
          this.closePath();
          this.fillStyle = grad;
          this.fill();
          this.lineWidth = 1;
          this.strokeStyle = 'rgba(81,217,181,0.75)';
          this.stroke();
          //第二扇区
          var beginAlpha2 = 120 * this.DEG, endAlpha2 = 210 * this.DEG;
          this.beginPath();
          this.arc(x, y, radius, beginAlpha2, endAlpha2, false);
          this.lineTo(x + innerRadius * Math.cos(endAlpha2), y + innerRadius * Math.sin(endAlpha2));
          this.arc(x, y, innerRadius, endAlpha2, beginAlpha2, true);
          this.closePath();
          this.fill();
          this.stroke();
          //第三扇区
          var beginAlpha3 = 240 * this.DEG, endAlpha3 = 330 * this.DEG;
          this.beginPath();
          this.arc(x, y, radius, beginAlpha3, endAlpha3, false);
          this.lineTo(x + innerRadius * Math.cos(endAlpha3), y + innerRadius * Math.sin(endAlpha3));
          this.arc(x, y, innerRadius, endAlpha3, beginAlpha3, true);
          this.closePath();
          this.fill();
          this.stroke();
          //画中心点
          this.beginPath();
          this.arc(x, y, innerR, 0, Math.PI * 2, false);
          this.closePath();
          this.lineWidth = 0.5;
          this.strokeStyle = 'rgba(0,0,0,1)';
          this.fillStyle = 'rgb(0,156,0)';
          this.fill();

          this.stroke();

          return this;
        };
        CanvasRenderingContext2D.prototype.sector = function(x, y, radius, innerR,
                                                             sDeg, eDeg, color, lineWidth, lineColor) {
          //第二种基站画法
          var grad = this.createRadialGradient(x, y, 1, x, y, radius + radius);
          if (color !== 'rgba(48,133,157,0.8)') {
            grad.addColorStop(0, color);
            grad.addColorStop(1, color);
          } else {
            grad.addColorStop(0, 'rgba(255,255,255,0.75)');
            grad.addColorStop(1, 'rgba(48,133,157,0.8)');
          }

          this.beginPath();

          this.moveTo(x, y);
          this.arc(x, y, radius, this.DEG * sDeg, this.DEG * eDeg, false);
          this.lineTo(x, y);
          //this.strokeStyle = "rgba(81,217,181,0.75)";
          this.strokeStyle = lineColor;
          // this.lineWidth = 1;
          this.lineWidth = lineWidth;
          this.fillStyle = grad;

          this.stroke();
          this.fill();
          this.closePath();
          this.beginPath();
          this.arc(x, y, innerR, 0, Math.PI * 2, false);
          this.fillStyle = 'rgb(0,156,0)';
          //this.lineWidth = 1.5;
          this.lineWidth = lineWidth;
          this.strokeStyle = 'rgba(0,0,0,1)';
          this.stroke();
          this.fill();
          this.closePath();

          return this;
        };
        me.state._drawInfo.items = [];
        ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

        if (!layer.options.isVisible) {
          return;
        }
        let bounds = params.bounds,
          offsetX = 0,
          offsetY = 0;
        let ne = bounds.getNorthEast();
        let sw = bounds.getSouthWest();
        let exBounds = L.latLngBounds([
          [ne.lat + ex, ne.lng + ex],
          [sw.lat - ex, sw.lng - ex],
        ]);

        if (layer.offsetFn) {
          let topLeft = bounds.getNorthWest();
          let offset = layer.offsetFn(topLeft.lat, topLeft.lng);
          offsetX = offset.lng - topLeft.lng;
          offsetY = offset.lat - topLeft.lat;
        }
        let zoom = params.zoom,
          scale = me.getCellScale(zoom);
        let r = 18 + scale * 20;
        let innerR = 2 + scale * 2;
        me.state._drawInfo.r = r;
        me.state._drawInfo.innerR = innerR;

        let RRUItems = [];
        for (let i = 0, len = me.state.store.length; i < len; i++) {
          let data = me.state.store;
          let item = data[i];
          let latlng = [item.Latitude + offsetY, item.Longitude + offsetX];
          if (exBounds.contains(latlng) && item.isVisible) {
            let azimuth = item.Azimuth - 90;
            let azimuthEnd = azimuth + 65;
            let r1 = me.state._drawInfo.r;
            let color = 'rgba(48,133,157,0.8)';
            let lineColor = 'rgba(81,217,181,0.75)';
            if (item.NetWorkType.toLowerCase() == 'gsm' || item.NetWorkType.toLowerCase() == 'cdma' || item.NetWorkType.toLowerCase() == 'evdo') {
              lineColor = 'rgba(238,121,66,0.8)';
              azimuth = azimuth - 45;
              azimuthEnd = azimuth + 90;
            } else if (item.NetWorkType.toLowerCase() == 'wcdma' || item.NetWorkType.toLowerCase() == 'td-scdma') {
              lineColor = 'rgba(100,149,237,0.8)';
              r1 = r + 10;
              azimuth = azimuth - 30;
              azimuthEnd = azimuth + 60;
            } else if (item.NetWorkType.toLowerCase() == 'ltefdd' || item.NetWorkType.toLowerCase() == 'ltetdd') {
              lineColor = 'rgba(102,205,0,0.8)';
              r1 = r + 20;
              azimuth = azimuth - 15;
              azimuthEnd = azimuth + 30;
            }
            let pixel = layer._map.latLngToContainerPoint(latlng).round();

            if (item.CoverType.toLowerCase() !== 'railroad') {
              if (item.Azimuth == 360 || item.OutdoorIndoor.toLowerCase() == 'indoor') {
                ctx.circleSite(pixel.x, pixel.y, r / 3, innerR, '#ff0000', 1);
              } else {
                ctx.sector(pixel.x, pixel.y, r1, innerR, azimuth, azimuthEnd, color, 1.5, lineColor);
              }

            } else {
              let col = item.s_color;
              ctx.sector(pixel.x, pixel.y, r, innerR, azimuth, azimuthEnd, col, 1.5);

            }

            let drawInfo = me.state._drawInfo;
            drawInfo.items.push({
              x: pixel.x,
              y: pixel.y,
              latlng: latlng,
              cell: item,
            });
          }
        }

      }).addTo(this.state._map);
      _d3layer.offsetFn = L.EvilTransform.google_encrypt;
    }
    this.state._d3layer = _d3layer;
    return _d3layer;
  },
  createGLLayer: function() {
    let glLayer = {
      isVisible: true,
      glLayerType: 'CELL',
      zIndex: -1,
      data: [],
    }; // addTo(this.leMapPanel.map);
    return glLayer;
  },
  clear: function() {
    this.state.store = [];
    let _glLayer = this.state._glLayer;
    let _d3layer = this.state._d3layer;
    if (_glLayer !== null) {
      _glLayer.data = [];
      _glLayer.refresh();
    }
    if (_d3layer !== null) {
      _d3layer.redraw();
    }
  },
  setIsVisible_GLLayer: function(isVisible) {
    let glLayer = this.getGLLayer();
    glLayer.isVisible = isVisible;
    glLayer.refresh();
    this.state._glLayer = glLayer;
  },

  setIsVisible_CanvasLayer: function(isVisible) {
    let layer = this.getCanvasLayer();
    layer.options.isVisible = isVisible;
    layer.redraw();
  },
  refresh: function(cell) {
    let glLayer = this.getGLLayer();
    if (this.state._isGL) {
      glLayer.refresh();
    } else {
      this.getCanvasLayer().redraw();
    }
  },
  getCellScale: function(zoom) {
    return (zoom < 15 ? 0 : zoom - 15);
  },
  filterOnlyCity: function(cell, city) {
    return cell.City === city;
  },
  filterOnlyNetType: function(cell, net) {
    return cell.NetWorkType.toUpperCase() === net;
  },
  filterOnlyKeyWord: function(cell, keyWord) {
    return cell.BTSName.toLowerCase().indexOf(keyWord) > -1 || cell.CellName.toLowerCase().indexOf(keyWord) > -1;
  },
  getFilterFn: function(obj) {
    if (!obj) {
      return function() {
        return true;
      };
    }
    let me = this;
    let fn = function() {
      return true;
    };
    let filterKeywordFn = fn, filterCityFn = fn;
    filterNetFn = fn;
    obj = obj || {};
    if (obj.Keyword) {
      filterKeywordFn = this.filterOnlyKeyWord;
    }
    if (obj.City) {
      filterCityFn = this.filterOnlyCity;
    }
    if (obj.NetType) {
      filterNetFn = this.filterOnlyNetType;
    }
    return function(cell) {
      return filterKeywordFn(cell, obj.Keyword) &&
        filterCityFn(cell, obj.City) &&
        filterNetFn(cell, obj.NetType);
    };
  },
  allLoaded: function() {

  },
  fitBounds: function() {
    if (this.state._visibleBounds && this.state._map) {
      let sw = this.state._visibleBounds.getSouthWest();
      let ne = this.state._visibleBounds.getNorthEast();

      if (sw.lat !== 91 && sw.lng !== 181 && ne.lat !== -91 && ne.lng !== -181) {
        this.state._map.fitBounds(this.state._visibleBounds);
      }
    }
  },
  getCol: function () {
    let arr = [],
    i = 0,
    C = '0123456789ABCDEF'; //定义颜色代码的字符串
    while (i++ < 6) {
      let x = Math.random() * 16; //取0-16之间的随机数给变量x
      let b = parseInt(x); //取0-16之前的整数给变量b
      let c = C.substr(b, 1); //由第b（0-16之间的整数）位开始取一个字符
      arr.push(c);
    }
    let cl = "#" + arr.join(''); //去掉之前数组之间的逗号，前面再加一个井号
    return cl;
  },
};


