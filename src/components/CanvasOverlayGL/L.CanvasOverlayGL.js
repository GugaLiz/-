
/*
Generic  Canvas Overlay for leaflet,
Stanislav Sumbera, April , 2014

- added userDrawFunc that is called when Canvas need to be redrawn
- added few useful params fro userDrawFunc callback
- fixed resize map bug
inspired & portions taken from  :   https://github.com/Leaflet/Leaflet.heat


*/

L.CanvasOverlayGL = L.Layer.extend({
  //_layers: [],
  _resort: function () {
    this._layers.sort(function (a, b) {
      return a.zIndex > b.zIndex;
    });
  },
  addLayer: function (layer) {
    if (typeof (layer.isVisible) == "undefined") {
      layer.isVisible = true;
    }
    if (typeof (layer.zIndex) == "undefined") {
      layer.zIndex = 0;
    }
    layer.owner = this;
    layer.refresh = function () {
      this.owner.refresh(this);
    };
    layer._verts = [];
    layer._renderCount = 0;
    this._layers.push(layer);
    this._resort();
    if (layer.data.length > 0) {
      this.refresh();
    }
    return this;
  },

  DefaultPointSize: {
    4: 4,
    5: 4,
    6: 4,
    7: 4,
    8: 4,
    9: 4,
    10: 6,
    11: 6,
    12: 10,
    13: 10,
    14: 10,
    15: 12,
    16: 14,
    17: 14,
    18: 28
  },

  getLayerData: function (cmp, layer, usingGL) {
    var me = this;
    var toPixel = me.LatLongToPixelXY;
    var map = cmp._map;
    var zoom = map.getZoom();
    var pointSize = 4;
    var onmars = map._baseLayer.options.mars;
    var layers = me._layers;
    var verts = [];
    var count = 0;
    var cSize = 5;
    var lngSize = 180 / Math.pow(2, zoom - 1) / 256;
    var latSize = 90 / Math.pow(2, zoom - 1) / 256;

    if (usingGL) {
      if (layer) {
        var data = layer.data;
        layer._renderCount = 0;
        for (var j = 0, jLen = data.length; j < jLen; j++) {
          var p = data[j];
          var offset = p.offset;
          if (offset) {
            var sz1 = p.offset[0] * latSize;
            var sz2 = p.offset[1] * lngSize;
            p._pixel = toPixel(p.lat + sz1, p.lng + sz2, p);
          } else {
            p._pixel = toPixel(p.lat, p.lng, p);
          }
        }
      }
    } else {
      if (zoom in me.DefaultPointSize) {
        pointSize = me.DefaultPointSize[zoom];
      }
      toPixel = function (x, y, p) {
        if (onmars) {
          if (!p._xy) {
            p._xy = L.EvilTransform.transform(x, y);
          }
          x = p._xy[0];
          y = p._xy[1];
        }
        return map.latLngToContainerPoint([x, y]);
      };
    }
    for (var i = 0, len = layers.length; i < len; i++) {
      var temLayer = layers[i];
      if (!temLayer.isVisible) {
        continue;
      }
      var psize = 7; //默认点大小
      var type = 0; //使用配置点大小
      if (temLayer.glLayerType == 'CELL') {
        type = 1; //基站层，需要传点大小size
      } else {
        if (zoom >= 13) {
          psize = temLayer._ParamPointSize + 3;  //如果放大到13就加大2码来显示吧~
        } else {
          psize = temLayer._ParamPointSize; //参数图层使用设置
        }

        //console.info(me, psize);
        if (!psize) psize = 7;
      }
      var points = temLayer.data;
      //verts = verts.concat(temLayer._verts);
      //count += temLayer._renderCount;
      //var temVerts = temLayer._verts;
      for (var k = 0, kLen = points.length; k < kLen; k++) {
        var p1 = points[k];
        cSize = p1.cSize;
        if (p1.isVisible) {
          if (usingGL && p1._pixel) {
            if (type == 1) {
              psize = p1.size;
            }
            verts.push(p1._pixel.x, p1._pixel.y,
              psize,
              p1.color[0], p1.color[1], p1.color[2], p1.color[3]);
          } else {
            var xy = toPixel(p1.lat, p1.lng, p1);
            //console.info(xy);
            if (!p1._color) {
              var r = parseInt(p1.color[0] * 255);
              var g = parseInt(p1.color[1] * 255);
              var b = parseInt(p1.color[2] * 255);
              p1._color = 'rgb(' + r + ',' + g + ',' + b + ')';
            }
            verts.push({
              x: xy.x,
              y: xy.y,
              color: p1._color,
              size: pointSize,
              alpha: p1.color[3],
              //cSize:p.cSize
            });
          }
          count++;
        }
      }
    }
    //console.log(verts)
    return { data: verts, total: count ,cSize:cSize};
  },
  removeLayer: function (layer) {
    for (var i = 0, len = this._layers.length; i < len; i++) {
      if (layer === this._layers[i]) {
        this._layers.splice(i, 1);
        this.refresh();
        return layer;
      }
    }
  },
  clearLayers: function () {
    this._layers = [];
    this.refresh();
  },
  refresh: function (layer) {
    var me = this;
    var usingGL = me._usingGL;
    if (!usingGL) {
      me._clear();
    }
    var d = me.getLayerData(me, layer, usingGL);
    if (usingGL) {
      me.loadData(d.data, d.total,d.cSize);
    } else {
      var ctx = me._canvas.getContext('2d');
      //console.info(d.data, d.total);
      me.redrawCanvas(ctx, d);
    }
  },

  _clear: function () {
    var me = this;
    if (!me._usingGL) {
      var ctx = me._canvas.getContext('2d');
      ctx.clearRect(0, 0, me._canvas.width, me._canvas.height);
    }
  },
  isSupportGL: function () {
    var isIE = navigator.userAgent.indexOf("MSIE") >= 0;
    if (isIE && navigator.appVersion.match(/6./i) == "6.") {
      return false;
    }
    else if (isIE && navigator.appVersion.match(/7./i) == "7.") {
      return false;
    }
    else if (isIE && navigator.appVersion.match(/8./i) == "8.") {
      return false;
    }
    else if (isIE && navigator.appVersion.match(/9./i) == "9.") {
      return false;
    } else if (isIE && navigator.appVersion.match(/10./i) == "10.") {
      return false;
    }
    return true;
  },

  initialize: function (userDrawFunc, options) {
    this._userDrawFunc = userDrawFunc;
    L.setOptions(this, options);
    this._offset = { x: 0, y: 0 };
  },

  drawing: function (userDrawFunc) {
    this._userDrawFunc = userDrawFunc;
    return this;
  },

  params: function (options) {
    L.setOptions(this, options);
    return this;
  },

  canvas: function () {
    return this._canvas;
  },

  redrawCanvas: function (ctx, data) {
    var me = this;
    var map = this._map;
    var dd = data.data;
    var total = data.total;

    //var size = 8;
    for (var i = 0; i < total; i++) {
      var d = dd[i];
      var c = d.color;
      var size = d.size;
      ctx.fillStyle = c;
      ctx.fillRect(d.x, d.y, size, size);
    }
  },

  redraw: function () {
    if (!this._frame) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  },
  onAdd: function (map) {
    var me = this;
    this._map = map;
    this._layers = [];
    var supportGL = this.isSupportGL();
    if (!supportGL) {
      //IE11以下不支持WEBGL，使用IEWEBGL插件(object对象css需要设置为绝对定位，才能跟地图对应上)
      this._canvas = L.DomUtil.create('object', 'leaflet-heatmap-layer');
      this._canvas.style.position = "absolute";
    } else {
      this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
      this._canvas.style.position = "absolute";
      this._canvas.style.zindex = 1;
    }

    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


    map._panes.overlayPane.appendChild(this._canvas);
    //map._panes.overlayPane.appendChild(this.getTemCanvas());

    if (!supportGL) {
      //插件对要先添加document对象里，然后设置type类型，才能正确加载IEWEBGL，GL类不能完全加载如：float32array
      this._canvas.onreadystatechange = function () {

      };
      this._canvas.type = "application/x-webgl";
    }

    map.on("click", this._mapClick, this);
    map.on('moveend', this._reset, this);
    map.on('moveend', this._doZoomEnd, this);
    map.on('resize', this._resize, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this);
    }

    me._usingGL = supportGL;
    me._reset();
    me.drawing(me.drawingOnCanvas);
    me.setWebGL(); //_usingGL again in function
  },

  _doZoomEnd: function(){
    var me = this;
    var zoom = this._map.getZoom();

    if (zoom === 13) {  //当放大到13时刷新一下图层固定点大小
      me.refresh();
    }
    if (zoom === 12) {   //当小于12是刷新一下图层恢复为设置的点的大小
      me.refresh();
    }

  },

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('moveend', this._reset, this);
    map.off('resize', this._resize, this);
    map.off("click", this._mapClick, this);

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this);
    }
    this._canvas = null;

  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _resize: function (resizeEvent) {
    this._canvas.width = resizeEvent.newSize.x;
    this._canvas.height = resizeEvent.newSize.y;
    if (this._gl) {
      this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    }
  },
  _reset: function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    //L.DomUtil.setPosition(this.getTemCanvas(), topLeft);

    this._redraw();
  },

  _redraw: function () {
    var me = this;
    var size = this._map.getSize();
    var bounds = this._map.getBounds();
    var zoomScale = (size.x * 180) / (20037508.34 * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
    var zoom = this._map.getZoom();

    // console.time('process');

    if (this._userDrawFunc) {
      this._userDrawFunc(this,
        {
          canvas: this._canvas,
          bounds: bounds,
          size: size,
          zoomScale: zoomScale,
          zoom: zoom,
          options: this.options
        });
    }


    // console.timeEnd('process');
    if (!me._usingGL) {
      me.refresh();
    }
    this._frame = null;
  },

  _animateZoom: function (e) {
    var bounds = this._map.getBounds();
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map._latLngToNewLayerPoint(bounds.getNorthWest(), e.zoom, e.center);

    L.DomUtil.setTransform(this._canvas, offset, scale);

  },
  offsetFn: function (lat, lng) {
    return L.latLng(lat, lng);
  },
  setWebGL: function () {
    var me = this;
    var gl = this._canvas.getContext('experimental-webgl', { antialias: true });
    if (!gl) {
      me._usingGL = false;
      return;
    }

    me._gl = gl;

    this._pixelsToWebGLMatrix = new Float32Array(16);
    this._mapMatrix = new Float32Array(16);

    // -- WebGl setup
    if (!gl) return;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    //if (!document.getElementById('vshader')) return;
    //获取vshader
    const vshaderText = `uniform mat4 u_matrix;
        attribute vec4 a_vertex;
        attribute float a_pointSize;
        attribute vec4 a_color;
        varying vec4 v_color;

        void main() {
        // Set the size of the point
        // a_pointSize;
        float size = a_vertex[2];
        if(size < 0.0 ){
            size = -size/a_pointSize;
            if(size < 3.0){
                size = 3.0;
            }
        }
        gl_PointSize = size;
        
        // multiply each vertex by a matrix.
        gl_Position = u_matrix * a_vertex;


        // pass the color to the fragment shader
        v_color = a_color;
        }`;

    //gl.shaderSource(vertexShader, document.getElementById('vshader').text);
    gl.shaderSource(vertexShader, vshaderText);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //if (!document.getElementById('fshader')) return;
    const fshaderText = `precision mediump float;
        varying vec4 v_color;
        uniform sampler2D uSampler;
        void main() {

        float border = 0.1;
        float radius = 0.5;
        vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);
        // 最后一个参数为 透明度设定
        vec4 color1 = vec4(v_color[0], v_color[1], v_color[2], v_color[3]);

        vec2 m = gl_PointCoord.xy - vec2(0.5, 0.5);
        float dist = radius - sqrt(m.x * m.x + m.y * m.y);

        float t = 0.0;
        if (dist > border)
        t = 1.0;
        else if (dist > 0.0)
        t = dist / border;

        // float centerDist = length(gl_PointCoord - 0.5);
        // works for overlapping circles if blending is enabled

        gl_FragColor = mix(color0, color1, t);


        // -- another way for circle
        /*float centerDist = length(gl_PointCoord - 0.5);
        float radius = 0.5;
        // works for overlapping circles if blending is enabled
        gl_FragColor = vec4(v_color[0], v_color[1], v_color[2], v_color[3] * step(centerDist, radius));*/
        

        
        // simple circles
        /*float d = distance (gl_PointCoord, vec2(0.5,0.5));
        d = floor(d*10) /10;
        if (d < 0.5 ){
        gl_FragColor =vec4(v_color[0], v_color[1], v_color[2], 0.8);
        }
        else{
        discard;
        }*/

        
        /*vec2 a=gl_PointCoord*2.0-1.0;
        float d=dot(a,a);
        if(d<0.64)gl_FragColor = vec4(v_color[0], v_color[1], v_color[2], 0.8);
        else if(d<1.0)gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        else discard;*/


        // -- squares
        //gl_FragColor = v_color;
        //gl_FragColor =vec4(v_color[0], v_color[1], v_color[2], 0.2); // v_color;

        }`;
    //gl.shaderSource(fragmentShader, document.getElementById('fshader').text);
    gl.shaderSource(fragmentShader, fshaderText);
    gl.compileShader(fragmentShader);

    // link shaders to create our program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //gl.blendEquation(gl.FUNC_ADD); //相加
    //gl.blendFunc(gl.SRC_COLOR, gl.DST_COLOR);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.enable(gl.POINT_SMOOTH);
    //  gl.disable(gl.DEPTH_TEST);
    // ----------------------------
    // look up the locations for the inputs to our shaders.
    this._u_matLoc = gl.getUniformLocation(program, "u_matrix");
    this._colorLoc = gl.getAttribLocation(program, "a_color");
    this._vertLoc = gl.getAttribLocation(program, "a_vertex");
    gl.aPointSize = gl.getAttribLocation(program, "a_pointSize");
    // Set the matrix to some that makes 1 unit 1 pixel.

    this._pixelsToWebGLMatrix.set([2 / this._canvas.width, 0, 0, 0, 0, -2 / this._canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    gl.uniformMatrix4fv(this._u_matLoc, false, this._pixelsToWebGLMatrix);
  },
  loadData: function (data, total, cSize) {
    var me = this;
    var gl = me._gl;
    var usingGL = me._usingGL;
    var verts = data;

    this._size = verts[2];
    this._cSize = cSize;

    this._numPoints = total;
    if (usingGL) {
      if (!this._buffer) {
        var vertBuffer = gl.createBuffer();
        this._buffer = vertBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.enableVertexAttribArray(this._vertLoc);
        gl.enableVertexAttribArray(this._colorLoc);
      }

      //this._buffer = vertBuffer;
      //var vertArray = new Float32Array(verts);
      var vertArray = new Float32Array(verts);

      var fsize = vertArray.BYTES_PER_ELEMENT;


      gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
      //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxNormals()), gl.STATIC_DRAW);
      gl.vertexAttribPointer(this._vertLoc, 3, gl.FLOAT, false, fsize * 7, 0);

      // -- offset for color buffer
      gl.vertexAttribPointer(this._colorLoc, 4, gl.FLOAT, false, fsize * 7, fsize * 3);

    }

    this.redraw();
  },
  drawingOnCanvas: function () {
    var me = this;
    if (me._gl == null) return;
    var gl = me._gl;
    var map = me._map;
    gl.clear(gl.COLOR_BUFFER_BIT);
    me._pixelsToWebGLMatrix.set([2 / me._canvas.width, 0, 0, 0, 0, -2 / me._canvas.height, 0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    //gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    var pointSize = 78271.5170 / Math.pow(2, map.getZoom() - 1);

    gl.vertexAttrib1f(gl.aPointSize, pointSize);

    // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
    me._mapMatrix.set(me._pixelsToWebGLMatrix);
    //debugger;
    var bounds = map.getBounds();
    var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());

    var newLatlng = me.offsetFn(topLeft.lat, topLeft.lng);

    var offset = me.LatLongToPixelXY(topLeft.lat - newLatlng.lat + topLeft.lat, topLeft.lng - newLatlng.lng + topLeft.lng);

    me._offset.x = offset.x;
    me._offset.y = offset.y;
    me._offset.topLeft = topLeft;
    //var offset = this.LatLongToPixelXY(topLeft.lat, topLeft.lng);

    // -- Scale to current zoom
    var scale = 1;
    var zoom = map.getZoom();
    var crs = map.options.crs;
    if (crs.code == L.CRS.BEPSG3857.code) {
      scale = me.getScale(zoom);
    } else {
      scale = Math.pow(2, zoom, crs.code);
    }

    this.scaleMatrix(this._mapMatrix, scale, scale);

    this.translateMatrix(this._mapMatrix, -offset.x, -offset.y);

    // -- attach matrix value to 'mapMatrix' uniform in shader
    gl.uniformMatrix4fv(this._u_matLoc, false, this._mapMatrix);
   // debugger;
    gl.drawArrays(gl.POINTS, 0, this._numPoints);
  },
  LatLongToPixelXY: function (latitude, longitude) {
    var pi_180 = Math.PI / 180.0;
    var pi_4 = Math.PI * 4;
    var sinLatitude = Math.sin(latitude * pi_180);
    var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
    var pixelX = ((longitude + 180) / 360) * 256;

    var pixel = { x: pixelX, y: pixelY };

    return pixel;
  },
  //对于百度地图，需要使用这个scale来webgl缩放
  getScale: function (zoom) {
    var idx = 18 - zoom;
    if (idx === -1)
      return 313086.06784;
    if (idx < 0 || idx > 19) return 0;
    var scales = {
      0: 156543.03392,
      1: 78271.51696,
      2: 39135.75848,
      3: 19567.87924,
      4: 9783.93962,
      5: 4891.96981,
      6: 2445.98490,
      7: 1222.99245,
      8: 611.49622,
      9: 305.74811,
      10: 152.87405,
      11: 76.43702,
      12: 38.21851,
      13: 19.10925,
      14: 9.55462,
      15: 4.77731,
      16: 2.38865,
      17: 1.19432,
      18: 0.59716,
      19: 0.29858,
    };
    return scales[idx];
  },
  translateMatrix: function (matrix, tx, ty) {
    // translation is in last column of matrix
    matrix[12] += matrix[0] * tx + matrix[4] * ty;
    matrix[13] += matrix[1] * tx + matrix[5] * ty;
    matrix[14] += matrix[2] * tx + matrix[6] * ty;
    matrix[15] += matrix[3] * tx + matrix[7] * ty;
  },
  scaleMatrix: function (matrix, scaleX, scaleY) {
    // scaling x and y, which is just scaling first two columns of matrix
    matrix[0] *= scaleX;
    matrix[1] *= scaleX;
    matrix[2] *= scaleX;
    matrix[3] *= scaleX;

    matrix[4] *= scaleY;
    matrix[5] *= scaleY;
    matrix[6] *= scaleY;
    matrix[7] *= scaleY;
  },
  _mapClick: function (e) {
    var ex = 0.0009;
    var bounds = this._map.getBounds(), ne = bounds.getNorthEast(), sw = bounds.getSouthWest();
    var exBounds = L.latLngBounds([[ne.lat + ex, ne.lng + ex], [sw.lat - ex, sw.lng - ex]]);
    var topLeft = this._offset.topLeft;
    if (!topLeft) {
      return;
    }
    var newLatlng = this.offsetFn(topLeft.lat, topLeft.lng);
    var oldTopLeftP = this.LatLongToPixelXY(topLeft.lat, topLeft.lng);
    var newTopLeftP = this.LatLongToPixelXY(newLatlng.lat, newLatlng.lng);
    var offsetX = newLatlng.lng - topLeft.lng, offsetY = newLatlng.lat - topLeft.lat;


    var mouserLatlng = e.latlng;
    var mouseP = this._map.latLngToContainerPoint(mouserLatlng).round();
    var temCan = this.getTemCanvas();
    var temCtx = temCan.getContext("2d");

    var len = this._layers.length;
    for (var i = len - 1; i >= 0; i--) {
      var temLayer = this._layers[i];
      var listeners = temLayer.listeners || {};
      if (!temLayer || !temLayer.isVisible || !listeners.click) {
        continue;
      }
      var pointSize = 78271.5170 / Math.pow(2, this._map.getZoom() - 1);
      temCtx.clearRect(0, 0, temCan.width, temCan.height);
      var points = temLayer.data;
      for (var jLen = points.length, j = jLen - 1; j >= 0; j--) {
        var p = points[j];
        if (!p.isVisible || !p._pixel || !p.item) {
          continue;
        }
        var latlng = [p.lat + offsetY, p.lng + offsetX];
        if (exBounds.contains(latlng)) {
          if (latlng.lng - ex > mouserLatlng.lng || latlng.lng + ex < mouserLatlng.lng|| latlng.lat - ex > mouserLatlng.lat || latlng + ex < mouserLatlng.lat) {
            continue;
          }

          var size = p.size;
          if (size < 0) {
            size = -size / pointSize;
            if (size < 7.0) {
              size = 7.0;
            }
          }

          var pixel = this._map.latLngToContainerPoint(latlng).round();
          //
          //

          if (pixel.x - size <= mouseP.x && pixel.x + size >= mouseP.x && pixel.y - size <= mouseP.y && pixel.y + size >= mouseP.y) {
            size = size / 2;
            temCtx.circle(pixel.x, pixel.y, size, 'rgb(0,156,0)');
            //temCtx.circle(mouseP.x, mouseP.y, size, 'rgb(156,0,0)');
            if (temCtx.hasPixel(mouseP.x, mouseP.y)) {
              listeners.click(p);

              return;
            }

          }
        }
      }
    }
  },
  getTemCanvas: function () {
    var me = this;
    if (!this._temCans) {
      this._temCans = document.createElement("canvas");
    }
    this._temCans.height = this._canvas.height;
    this._temCans.width = this._canvas.width;
    return this._temCans;
  }
});

L.canvasOverlayGL = function (userDrawFunc, options) {
  return new L.CanvasOverlayGL(userDrawFunc, options);
};


function Texture(img, gl) {
  var self = this;
  this.gl = gl;
  this.tex = gl.createTexture();
  this.image = new Image();
  this.image.onload = function () {
    self.handleLoadedTexture();
  };
  if (img != null) {
    this.setImage(img);
  }

}

Texture.prototype.setImage = function (file) {
  this.image.src = file;
};

Texture.prototype.handleLoadedTexture = function () {
  var gl = this.gl;
  console.info('loading image ' + this.image.src);
  gl.bindTexture(gl.TEXTURE_2D, this.tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
};
