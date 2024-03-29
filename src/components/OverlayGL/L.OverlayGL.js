
L.OverlayGL = L.Layer.extend({

  refresh: function () {
    var me = this;
    var map = me._map;
    var noGL = !(me._gl);
    if (noGL) {
      me._clear();
    }
    var d = me._getData(me, map, !noGL);
    if (noGL) {
      var ctx = me._canvas.getContext('2d');
      me.redrawCanvas(ctx, d);
    } else {
      me.loadData(d.data, d.total);
    }
  },

  _clear: function () {
    var me = this;
    if (!me._gl) {
      var ctx = me._canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, me._canvas.width, me._canvas.height);
      }
    }
  },

  _click: function (e) {
    var me = this;
    var map = me._map;
    var gl = me._gl;
    var canvas = me._canvas;
    var x, y, top = 0, left = 0;
    var latlng = e.latlng;
    var pos = map.latLngToContainerPoint(latlng).round();
    if (gl) {
      var width = gl.drawingBufferWidth;
      var height = gl.drawingBufferHeight;
      x = pos.x;
      y = height - pos.y;
      var pixels = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      if (pixels[0] > 0 || pixels[1] > 0 ||
        pixels[2] > 0 || pixels[3] > 0) {
        me.fire('click_item', {
          latlng: e.latlng,
          pos: pos
        });
      }
    } else {
      var ctx = canvas.getContext('2d');
      x = e.containerPoint.x;
      y = e.containerPoint.y;
      var c = ctx.getImageData(x, y, 1, 1).data;
      if (c[0] > 0 || c[1] > 0 ||
        c[2] > 0 || c[3] > 0) {
        me.fire('click_item', {
          latlng: e.latlng,
          pos: pos
        });
      }
    }
  },

  initialize: function (getData, opts) {
    var me = this;
    me._getData = getData;
    me.visible = true;
    L.setOptions(this, opts);
  },

  redrawCanvas: function (ctx, data) {
    var me = this;
    var map = me._map;
    var dd = data.data;
    var total = data.total;

    var size = 8;
    for (var i = 0; i < total; i++) {
      var d = dd[i];
      var c = d.color;
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
    me._map = map;
    var supportGL = me.isSupportGL();
    // supportGL = false;
    if (!supportGL) {
      //IE11以下不支持WEBGL，使用IEWEBGL插件(object对象css需要设置为绝对定位，才能跟地图对应上)
      this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
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
      me._canvas.onreadystatechange = function () {

      };
      me._canvas.type = "application/x-webgl";
    } else {
      var cfg = { antialias: true, preserveDrawingBuffer: true };
      var gl = me._canvas.getContext('webgl', cfg) ||
        me._canvas.getContext('experimental-webgl', cfg);
      me._gl = gl;
    }

    map.on('moveend', me._reset, this);
    map.on('resize', me._resize, this);
    map.on('click', me._click, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', me._animateZoom, this);
    }

    me._reset();
    me.drawing(me.drawingOnCanvas);
    me.setWebGL(); //_usingGL again in function
  },


  drawing: function (userDrawFunc) {
    this._userDrawFunc = userDrawFunc;
    return this;
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

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('moveend', this._reset, this);
    map.off('resize', this._resize, this);

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
    var me = this;
    this._canvas.width = resizeEvent.newSize.x;
    this._canvas.height = resizeEvent.newSize.y;
    if (this._gl) {
      this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    }
  },

  _reset: function () {
    var me = this;
    var topLeft = me._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(me._canvas, topLeft);
    me._redraw();
  },

  _redraw: function () {
    var me = this;
    var map = me._map;
    var size = map.getSize();
    var bounds = map.getBounds();
    var zoomScale = (size.x * 180) / (20037508.34 * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
    var zoom = map.getZoom();

    if (!me._gl) {
      me.refresh();
    } else {
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
    }
    me._frame = null;
  },

  _animateZoom: function (e) {
    var me = this;
    var map = me._map;
    var bounds = map.getBounds();
    var scale = map.getZoomScale(e.zoom),
      offset = map._latLngToNewLayerPoint(bounds.getNorthWest(), e.zoom, e.center);

    L.DomUtil.setTransform(me._canvas, offset, scale);
  },

  setWebGL: function () {
    var me = this;
    if (!me._gl) return;
    var gl = me._gl;
    me._pixelsToWebGLMatrix = new Float32Array(16);
    me._mapMatrix = new Float32Array(16);
    //me._frameBuffer = gl.createFramebuffer();
    //gl.bindFramebuffer(gl.FRAMEBUFFER, me._frameBuffer);

    // -- WebGl setup
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById('vshader').text);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, document.getElementById('fshader').text);
    gl.compileShader(fragmentShader);

    // link shaders to create our program
    var program = gl.createProgram();
    this._program = program;
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

    this._pixelsToWebGLMatrix.set([2 / this._canvas.width, 0, 0, 0, 0, -2 / this._canvas.height,
      0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);

    gl.uniformMatrix4fv(this._u_matLoc, false, this._pixelsToWebGLMatrix);
  },

  loadData: function (data, total) {
    var me = this;
    var gl = me._gl;
    var verts = data;
    me._numPoints = total;
    if (!me._buffer) {
      var vertBuffer = gl.createBuffer();
      me._buffer = vertBuffer;
      gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
      gl.enableVertexAttribArray(me._vertLoc);
      gl.enableVertexAttribArray(me._colorLoc);
    }


    //this._buffer = vertBuffer;
    //var vertArray = new Float32Array(verts);
    var vertArray = new Float32Array(verts);

    var fsize = vertArray.BYTES_PER_ELEMENT;

    gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxNormals()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(me._vertLoc, 3, gl.FLOAT, false, fsize * 7, 0);

    // -- offset for color buffer
    gl.vertexAttribPointer(me._colorLoc, 4, gl.FLOAT, false, fsize * 7, fsize * 3);

    me.redraw();
  },
  _offset: {},

  drawingOnCanvas: function () {
    var me = this;
    var gl = me._gl;
    var canvas = me._canvas;
    var map = me._map;
    if (gl == null) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    me._pixelsToWebGLMatrix.set([2 / canvas.width, 0, 0, 0, 0, -2 / canvas.height,
      0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
    var pointSize = 78271.5170 / Math.pow(2, map.getZoom() - 1);
    gl.vertexAttrib1f(gl.aPointSize, pointSize);

    me._mapMatrix.set(me._pixelsToWebGLMatrix);
    var bounds = map.getBounds();
    var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());

    var newLatlng = new L.LatLng(topLeft.lat, topLeft.lng);

    var offset = this.LatLongToPixelXY(topLeft.lat - newLatlng.lat + topLeft.lat,
      topLeft.lng - newLatlng.lng + topLeft.lng);

    this._offset.x = offset.x;
    this._offset.y = offset.y
    this._offset.topLeft = topLeft;
    //console.info(this._offset);

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
    gl.drawArrays(gl.POINTS, 0, this._numPoints);
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

  LatLongToPixelXY: function (latitude, longitude) {
    var pi_180 = Math.PI / 180.0;
    var pi_4 = Math.PI * 4;
    var sinLatitude = Math.sin(latitude * pi_180);
    var pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
    var pixelX = ((longitude + 180) / 360) * 256;

    var pixel = { x: pixelX, y: pixelY };

    return pixel;
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
  }
});

L.overlayGL = function (getData, options) {
  return new L.OverlayGL(getData, options);
};
