/**
 * Projection class for Baidu Spherical Mercator
 *
 * @class BaiduSphericalMercator
 */
L.Projection.BaiduSphericalMercator = {
  /**
   * Project latLng to point coordinate
   *
   * @method project
   * @param {Object} latLng coordinate for a point on earth
   * @return {Object} leafletPoint point coordinate of L.Point
   */
  project: function(latLng) {
    var projection = new BMap.MercatorProjection();
    var point = projection.lngLatToPoint(
      new BMap.Point(latLng.lng, latLng.lat),
    );
    var leafletPoint = new L.Point(point.x, point.y);
    return leafletPoint;
  },

  /**
   * unproject point coordinate to latLng
   *
   * @method unproject
   * @param {Object} bpoint baidu point coordinate
   * @return {Object} latitude and longitude
   */
  unproject: function(bpoint) {
    var projection = new BMap.MercatorProjection();
    var point = projection.pointToLngLat(
      new BMap.Pixel(bpoint.x, bpoint.y),
    );
    var latLng = new L.LatLng(point.lat, point.lng);
    return latLng;
  },

  /**
   * Don't know how it used currently.
   *
   * However, I guess this is the range of coordinate.
   * Range of pixel coordinate is gotten from
   * BMap.MercatorProjection.lngLatToPoint(180, -90) and (180, 90)
   * After getting max min value of pixel coordinate, use
   * pointToLngLat() get the max lat and Lng.
   */
  bounds: (function() {
    var MAX_X = 20037726.37;
    var MIN_Y = -11708041.66;
    var MAX_Y = 12474104.17;
    var bounds = L.bounds(
      [-MAX_X, MIN_Y], //-180, -71.988531
      [MAX_X, MAX_Y],  //180, 74.000022
    );
    var MAX = 33554432;
    bounds = new L.Bounds(
      [-MAX, -MAX],
      [MAX, MAX],
    );
    return bounds;
  })(),
};

/**
 * Coordinate system for Baidu EPSG3857
 *
 * @class BEPSG3857
 */
L.CRS.BEPSG3857 = L.extend({}, L.CRS.EPSG3857, {
  code: 'BEPSG:3857',
  projection: L.Projection.BaiduSphericalMercator,

  transformation: (function() {
    var z = -18 - 8;
    var scale = Math.pow(2, z);
    return new L.Transformation(scale, 0.5, -scale, 0.5);
  }()),
});

/**
 * Tile layer for Baidu Map
 *
 * @class BaiduLayer
 */
L.TileLayer.BaiduLayer = L.TileLayer.extend({
  options: {
    minZoom: 5,
    maxZoom: 19,
    offsetType: 2,
    subdomains: ['online0', 'online1', 'online2', 'online3'],
    attribution: '',//'© 2014 Baidu - GS(2012)6003;- Data © <a target="_blank" href="http://www.navinfo.com/">NavInfo</a> & <a target="_blank" href="http://www.cennavi.com.cn/">CenNavi</a> & <a target="_blank" href="http://www.365ditu.com/">DaoDaoTong</a>',
  },

  initialize: function(url, options) {
    url = url || 'http://{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl';
    L.TileLayer.prototype.initialize.call(this, url, options);
  },

  getTileUrl: function(coords) {
    var offset = Math.pow(2, coords.z - 1),
      x = coords.x - offset,
      y = offset - coords.y - 1,
      baiduCoords = L.point(x, y);
    baiduCoords.z = coords.z;
    return L.TileLayer.prototype.getTileUrl.call(this, baiduCoords);
  },
});

L.tileLayer.baiduLayer = function(url, options) {
  return new L.TileLayer.BaiduLayer(url, options);
};
