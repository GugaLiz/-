
/*
Airfleet中GPS绘制
*/

L.CanvasOverlayGPS = L.Layer.extend({

  refresh: function () {
    var me = this;
    //me._drawed = false;
    var usingGL = me._usingGL;
    me.clear();
    var d = me.getLayerData(me, usingGL);
    if (usingGL) {
      me.loadData(d.data, d.total);
    } else {
      var ctx = me._canvas.getContext('2d');
      me.redrawCanvas(ctx, d);
    }
    //me._drawed = true;
  },

  clear: function () {
    var me = this;
    if (!me._usingGL) {
      var ctx = me._canvas.getContext('2d');
      ctx.clearRect(0, 0, me._canvas.width, me._canvas.height);
    } else {
      me._gl.clear(me._gl.COLOR_BUFFER_BIT);
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

  initialize: function (getLayerData, options) {
    var me = this;
    me.getLayerData = getLayerData;
    L.setOptions(this, options);
    me._offset = { x: 0, y: 0 };
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

    var size = 8;
    //ctx.globalAlpha = 0.7;
    /*
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 3;
    ctx.shadowColor = 'grey';*/
    /*
    ctx.fillRect(50, 50, size, size);
    ctx.fillRect(63, 50, size, size);
    var p2 = map.latLngToContainerPoint([ 22.5559202, 113.415413]);
    ctx.fillRect(p2.x, p2.y, 80, 80);*/
    //console.info(p1, p2, map);

    for (var i = 0; i < total; i++) {
      var d = dd[i];
      var c = d.color;
      ctx.fillStyle = c;
      //console.info(d);
      //console.info(c);
      ctx.fillRect(d.x, d.y, size, size);
    }
    //console.info(total);
  },

  redraw: function () {
    var me = this;
    if (!me._frame) {
      me._frame = L.Util.requestAnimFrame(me._redraw, me);
    }
    return me;
  },

  onAdd: function (map) {
    var me = this;
    me._map = map;
    me._layers = [];
    var supportGL = me.isSupportGL();
    var zIndex = 1;
    if (me.options && typeof me.options.zIndex != 'undefined') {
      zIndex = me.options.zIndex;
    }
    if (!supportGL) {
      //IE11以下不支持WEBGL，使用IEWEBGL插件(object对象css需要设置为绝对定位，才能跟地图对应上)
      me._canvas = L.DomUtil.create('object', 'leaflet-heatmap-layer');
      me._canvas.style.position = "absolute";
    } else {
      me._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
      me._canvas.style.position = "absolute";
      me._canvas.style.zIndex = zIndex;
    }

    var size = me._map.getSize();
    me._canvas.width = size.x;
    me._canvas.height = size.y;

    var animated = me._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(me._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

    map._panes.overlayPane.appendChild(me._canvas);
    //map._panes.overlayPane.appendChild(this.getTemCanvas());

    if (!supportGL) {
      //插件对要先添加document对象里，然后设置type类型，才能正确加载IEWEBGL，GL类不能完全加载如：float32array
      me._canvas.onreadystatechange = function () { };
      me._canvas.type = "application/x-webgl";
    }

    map.on('moveend', me._reset, me);
    //map.on('movestart', me._clear, me);
    map.on('resize', me._resize, me);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', me._animateZoom, me);
    }

    me._usingGL = supportGL;
    me._reset();
    me.drawing(me.drawingOnCanvas);
    me.setWebGL(); //_usingGL again in function
    me.refresh();
  },

  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._canvas);

    map.off('moveend', this._reset, this);
    //map.off('movestart', this._clear, this);
    map.off('resize', this._resize, this);

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this);
    }
    this_canvas = null;

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
    var size = me._map.getSize();
    var bounds = me._map.getBounds();
    var zoomScale = (size.x * 180) / (20037508.34 * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
    var zoom = me._map.getZoom();

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
    me._reset();
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
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

    var vertArray = new Float32Array(verts);
    var fsize = vertArray.BYTES_PER_ELEMENT;


    gl.bufferData(gl.ARRAY_BUFFER, vertArray, gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BuildBoxNormals()), gl.STATIC_DRAW);
    gl.vertexAttribPointer(me._vertLoc, 3, gl.FLOAT, false, fsize * 7, 0);

    // -- offset for color buffer
    gl.vertexAttribPointer(me._colorLoc, 4, gl.FLOAT, false, fsize * 7, fsize * 3);

    me.redraw();
  },
  drawingOnCanvas: function () {
    var me = this;
    //if (me._drawed) return;
    if (this._gl == null) return;
    var gl = this._gl;
    if (this._numPoints > 0) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      this._pixelsToWebGLMatrix.set([2 / this._canvas.width, 0, 0, 0, 0, -2 / this._canvas.height,
        0, 0, 0, 0, 0, 0, -1, 1, 0, 1]);
      //gl.viewport(0, 0, this._canvas.width, this._canvas.height);


      //debugger;
      var pointSize = 78271.5170 / Math.pow(2, this._map.getZoom() - 1);
      gl.vertexAttrib1f(gl.aPointSize, pointSize);

      // -- set base matrix to translate canvas pixel coordinates -> webgl coordinates
      this._mapMatrix.set(this._pixelsToWebGLMatrix);
      //debugger;
      var bounds = this._map.getBounds();
      var topLeft = new L.LatLng(bounds.getNorth(), bounds.getWest());

      var offset = this.LatLongToPixelXY(topLeft.lat, topLeft.lng);
      // -- Scale to current zoom
      var scale = 1;
      var zoom = this._map.getZoom();
      var crs = this._map.options.crs;
      if (crs.code == L.CRS.BEPSG3857.code) {
        scale = me.getScale(zoom);
      } else {
        scale = Math.pow(2, zoom, crs.code);
      }
      //console.info(zoom, scale);
      this.scaleMatrix(this._mapMatrix, scale, scale);

      this.translateMatrix(this._mapMatrix, -offset.x, -offset.y);

      // -- attach matrix value to 'mapMatrix' uniform in shader
      gl.uniformMatrix4fv(this._u_matLoc, false, this._mapMatrix);
      //debugger;
      gl.drawArrays(gl.POINTS, 0, this._numPoints);
    }
  },

  //对于百度地图，需要使用这个scale来webgl缩放
  getScale : function(zoom){
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

L.canvasOverlayGPS = function (datas, options) {
  return new L.CanvasOverlayGPS(datas, options);
};

