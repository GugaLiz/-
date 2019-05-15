import React from 'react';
import {TileLayer} from 'react-leaflet';
import {canvasOverlayParam} from './L.CanvasOverlayParam';

export default class CanvasOverlayParam extends TileLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.canvasOverlayParam;
  }
}
