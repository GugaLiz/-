import React from 'react';
import {TileLayer} from 'react-leaflet';
import {LeafletEviltransform} from './leaflet-eviltransform';

export default class Eviltransform extends TileLayer {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.EvilTransform;
  }
}
