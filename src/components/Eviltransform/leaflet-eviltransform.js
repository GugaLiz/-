L.EvilTransform = L.Class.extend({
    statics: {
        PI: 3.1415926535897932384626,
        A: 6378245.0, EE: 0.00669342162296594323,
        X_M_PI: 3.1415926535897932384626 * 3000.0 / 180.0,
        transformDiff: function (wgLat, wgLon) {
            if (L.EvilTransform.outOfMainChina(wgLat, wgLon)) {
                mgLat = wgLat;
                mgLon = wgLon;
                return [0.0, 0.0];
            }
            var dLat = L.EvilTransform.transformLat(wgLon - 105.0, wgLat - 35.0);
            var dLon = L.EvilTransform.transformLon(wgLon - 105.0, wgLat - 35.0);
            var radLat = wgLat / 180.0 * L.EvilTransform.PI;
            var magic = Math.sin(radLat);
            magic = 1 - L.EvilTransform.EE * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((L.EvilTransform.A * (1 - L.EvilTransform.EE)) / (magic * sqrtMagic) * L.EvilTransform.PI);
            dLon = (dLon * 180.0) / (L.EvilTransform.A / sqrtMagic * Math.cos(radLat) * L.EvilTransform.PI);
            return [dLat, dLon];
        },
        transform: function (wgLat, wgLon) {
            var mgLat = 0.0, mgLon = 0.0;
            if (L.EvilTransform.outOfMainChina(wgLat, wgLon)) {
                mgLat = wgLat;
                mgLon = wgLon;
                return [mgLat, mgLon];
            }
            var dLat = L.EvilTransform.transformLat(wgLon - 105.0, wgLat - 35.0);
            var dLon = L.EvilTransform.transformLon(wgLon - 105.0, wgLat - 35.0);
            var radLat = wgLat / 180.0 * L.EvilTransform.PI;
            var magic = Math.sin(radLat);
            magic = 1 - L.EvilTransform.EE * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((L.EvilTransform.A * (1 - L.EvilTransform.EE)) / (magic * sqrtMagic) * L.EvilTransform.PI);
            dLon = (dLon * 180.0) / (L.EvilTransform.A / sqrtMagic * Math.cos(radLat) * L.EvilTransform.PI);
            mgLat = wgLat + dLat;
            mgLon = wgLon + dLon;
            return [mgLat, mgLon];
        },

        inHK: function (lat, lon) {
            if (lon < 114.490681 && lon > 113.869772
                && lat < 22.428722 && lat > 22.171913) {
                return true;// in ���
            } else if (lon < 114.464235 && lon > 113.983606
                    && lat < 22.508876 && lat > 22.382745) {
                return true;// in ���
            }
            var _mc = [
                [113.559451, 22.152668, 113.625997, 22.108475],
                [113.551833, 22.161371, 113.613133, 22.151731],
                [113.54515, 22.174157, 113.608319, 22.16512],
                [113.539329, 22.193166, 113.579788, 22.178575],
                [113.545437, 22.215653, 113.575189, 22.202603],
                [113.543856, 22.205146, 113.580435, 22.191158],
                [113.54206, 22.197517, 113.579429, 22.185469],
                [113.539688, 22.194973, 113.579717, 22.180583]
            ];
            for (var i = 0; i < _mc.length; i++) {
                var item = _mc[i];
                if (lon < item[2] && lon > item[0] && lat < item[1] && lat > item[3]) {
                    return true;
                }
            }
            return false;
        },

        outOfMainChina: function (lat, lon) {
            if (lon < 121.09130859375 && lon > 119.273071289063
                && lat < 24.322071022276 && lat > 21.3968193740822) {
                return true;// in taiwan
            }
            if (lon < 122.783203125 && lon > 120.223388671875
                && lat < 25.5226146476233 && lat > 21.4019338382352) {
                return true;// in taiwan
            } else if (lon < 129.7265625 && lon > 118.9599609375
                && lat < 20.8382778060589 && lat > 2.94304091005513) {
                return true;// ���ɱ�1
            }
            if (lon < 134.384766 && lon > 124.123535
                && lat < 39.300299 && lat > 27.566721) {
                return true;// in korea 
            }
            if (lon < 72.004 || lon > 137.8347)
                return true;
            if (lat < 0.8293 || lat > 55.8271)
                return true;
            return false;
        },
        transformLat: function (x, y) {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * L.EvilTransform.PI) + 20.0 * Math.sin(2.0 * x * L.EvilTransform.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * L.EvilTransform.PI) + 40.0 * Math.sin(y / 3.0 * L.EvilTransform.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * L.EvilTransform.PI) + 320 * Math.sin(y * L.EvilTransform.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        },
        transformLon: function (x, y) {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * L.EvilTransform.PI) + 20.0 * Math.sin(2.0 * x * L.EvilTransform.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * L.EvilTransform.PI) + 40.0 * Math.sin(x / 3.0 * L.EvilTransform.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * L.EvilTransform.PI) + 300.0 * Math.sin(x / 30.0 * L.EvilTransform.PI)) * 2.0 / 3.0;
            return ret;
        },
        bd_encryptFromGoogle: function (y, x) {
            var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * L.EvilTransform.X_M_PI);
            var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * L.EvilTransform.X_M_PI);
            return [z * Math.sin(theta) + 0.006, z * Math.cos(theta) + 0.0065];
        },
        bd_decryptToGoogle: function (y, x) {
            x = x - 0.0065, y = y - 0.006; 
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * L.EvilTransform.X_M_PI);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * L.EvilTransform.X_M_PI);
            return [z * Math.sin(theta), z * Math.cos(theta)];
        },
        gcj2wgs: function (lat, lng) {
            if (L.EvilTransform.outOfMainChina(lat, lng)) {
                return [lat, lng];
            }
            var latlng = L.EvilTransform.transform(lat, lng);
            return [2 * lat - latlng[0], 2 * lng - latlng[1]];
        },
        no_encrypt: function (lat, lng) {
            return new L.latLng(lat, lng);
        },
        google_encrypt: function (lat, lng) {
            var array = L.EvilTransform.transform(lat, lng);
            return new L.latLng(array[0], array[1]);
        },
        google_decrypt: function (lat, lng) {
            var array = L.EvilTransform.gcj2wgs(lat, lng);
            return new L.latLng(array[0], array[1]);
        },
        bd_encrypt: function (lat, lng) {
            var array = L.EvilTransform.transform(lat, lng);
            array = L.EvilTransform.bd_encryptFromGoogle(array[0], array[1]);
            return new L.latLng(array[0], array[1]);
        },
        bd_encrypt2: function (lat, lng) {
            var array = L.EvilTransform.transform(lat, lng);
            array = L.EvilTransform.bd_encryptFromGoogle(array[0], array[1]);
            return [array[0], array[1]];
        },
        bd_decrypt: function (lat, lng) {
            var array = L.EvilTransform.bd_decryptToGoogle(lat, lng);
            array = L.EvilTransform.gcj2wgs(array[0], array[1]);
            return new L.latLng(array[0], array[1]);
        },
        bd_decrypt2: function (lat, lng) {
            var array = L.EvilTransform.bd_decryptToGoogle(lat, lng);
            array = L.EvilTransform.gcj2wgs(array[0], array[1]);
            return [array[0], array[1]];
        },
        bdToGoogle: function (lat, lng) {
            var array = L.EvilTransform.bd_decryptToGoogle(lat, lng);
            return new L.latLng(array[0], array[1]);
        },
        googleToBd: function (lat, lng) {
            var array = L.EvilTransform.bd_encryptFromGoogle(lat, lng);
            return new L.latLng(array[0], array[1]);
        }
    }
});
