import React from 'react';
import {TileLayer} from 'react-leaflet';
import {canvasOverlayGL} from './L.CanvasOverlayGL';

export default class CanvasOverlayGL extends TileLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.canvasOverlayGL;
  }
}
