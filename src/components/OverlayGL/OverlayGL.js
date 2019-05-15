import React,{Component} from 'react';
import {TileLayer} from 'react-leaflet';
import {overlayGL} from './L.OverlayGL';

export default class OverlayGL extends Component {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.overlayGL;
  }
}
