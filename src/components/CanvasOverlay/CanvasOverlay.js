import React,{Component} from 'react';
import {TileLayer} from 'react-leaflet';
import {canvasOverlay} from './L.CanvasOverlay';

export default class CanvasOverlay extends Component {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.canvasOverlay;
  }
}
