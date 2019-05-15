export  var ColorUtils = {
  toRGB: function (str) {
    let values, r, g, b,
      parse = parseInt,
      firstChar = str.substr(0, 1),
      colorValue;

    if ((str.length == 4 || str.length == 7) && firstChar === '#') {
      values = str.match(/\s*#([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)([0-9a-fA-F][0-9a-fA-F]?)\s*/);
      if (values) {
        //console.info(values);
        r = parse(values[1], 16) >> 0;
        g = parse(values[2], 16) >> 0;
        b = parse(values[3], 16) >> 0;
        if (str.length == 4) {
          r += (r * 16);
          g += (g * 16);
          b += (b * 16);
        }
      }
    }
    return [r / 255, g / 255, b / 255];
  },

  getColor: function (thrholds, v, usingGL, hides) {
    let color = null;
    let curThr = null;
    thrholds.map((thr) => {
      if (thr.IncludeLeft === 1 && thr.IncludeRight === 1) {
        if (v >= thr.LeftValue && v <= thr.RightValue) {
          curThr = thr;
          return false;
        }
      } else if (thr.IncludeLeft === 0 && thr.IncludeRight === 1) {
        if (v > thr.LeftValue && v <= thr.RightValue) {
          curThr = thr;
          return false;
        }
      } else if (thr.IncludeLeft === 1 && thr.IncludeRight === 0) {
        if (v >= thr.LeftValue && v < thr.RightValue) {
          curThr = thr;
          return false;
        }
      } else {
        if (v > thr.LeftValue && v < thr.RightValue) {
          curThr = thr;
          return false;
        }
      }
    });
    if (curThr && hides) {
      if (curThr._Idx in hides) {
        return null;
      }
    }
    if (curThr) {
      if (typeof curThr.Show != 'undefined' && !curThr.Show) return null; //不显示
      color = usingGL ? curThr.RGBColor : curThr.Color;
    }
    return color;
  },

  DiscreteColors: [
    "#0000ff", "#00ffff", "#ff0000", "#008200", "#00ff00",
    "#ff00ff", "#848200", "#000084", "#ff8e00", "#ffff00",

    "#bd8e8c", "#29ffad", "#efcf84", "#008284", "#adaaad",
    "#000000", "#840000", "#ffc3ce", "#d6d3d6", "#ff69b5",

    "#84cfff", "#840084", "#f7dfb5", "#deba84", "#4a0084",
    "#4282b5", "#6b59ce", "#6b696b"
  ],

  DiscreteColorsLen: 28,

  getDiscreteColor: function (holds, v, usingGL, item, cf) {
    if (v in holds) {
      return usingGL ? holds[v].RGB : holds[v].Color;
    }
    let colors = cf.DiscreteColors;
    let toRGB = cf.toRGB;
    let len = cf.DiscreteColorsLen;
    let idx = Object.getOwnPropertyNames(holds).length;
    if (idx >= len) {
      idx = idx - Math.floor(idx / len) * len;
    }
    let color = colors[idx];
    let hold = { Idx: idx };
    hold.RGB = toRGB(colors[idx]);
    hold.ThrStr = v.toString();
    hold.Color = color;
    holds[v] = hold;
    let tagId = item ? item.TagId : null;
    //通知面板刷新面板
    if (cf && tagId)
      //cf.fireEvent('discretecolor_add', cf, tagId);
      //todo:refresh paramLegend
      //this.props.discretecolor_add(tagId);
    return usingGL ? hold.RGB : hold.Color;
  },

  LatLongToPixelXY: function (latitude, longitude) {
    let pi_180 = Math.PI / 180.0;
    let pi_4 = Math.PI * 4;
    let sinLatitude = Math.sin(latitude * pi_180);
    let pixelY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (pi_4)) * 256;
    let pixelX = ((longitude + 180) / 360) * 256;

    let pixel = { x: pixelX, y: pixelY };
    return pixel;
  }
};


