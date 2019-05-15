import React,{Component} from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import {editable} from './leaflet.editable';


export default class Ediable extends Component {
  componentWillMount() {
    super.componentWillMount();
    this.leafletElement = L.Editable;
  }
  
}
