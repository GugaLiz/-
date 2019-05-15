import React from 'react';
import PropTypes from 'prop-types';
import {TileLayer} from 'react-leaflet';
import {Baidu} from './leaflet.baiduLayer.js';

export default class BaiduLayer extends TileLayer {
  static propTypes = {
    provider:PropTypes.string,
    options:PropTypes.object,

  };

  componentWillMount() {
    super.componentWillMount();
    const {provider, options } = this.props;
    this.leafletElement = L.tileLayer.baiduLayer(provider, options);
  }
}
