import React,{Component} from 'react';
import {Measure} from './leaflet.lineMeasure';

export default class LineMeasureDraw extends Component {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.Draw.LineMeasure;
  }
}
