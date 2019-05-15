import React from 'react';
import {TileLayer} from 'react-leaflet';
import {canvasOverlayGPS} from './L.CanvasOverlayGPS';

export default class CanvasOverlayGPS extends TileLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.canvasOverlayGPS;
  }
}
