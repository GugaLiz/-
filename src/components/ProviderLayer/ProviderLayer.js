import React from 'react';
import PropTypes from 'prop-types';
import {TileLayer} from 'react-leaflet';
import {Provider} from './leaflet.provider';

export default class ProviderLayer extends TileLayer {
  static propTypes = {
    provider:PropTypes.string,
    options:PropTypes.object,
    
  };

  componentWillMount() {
    super.componentWillMount();
    const {provider, options } = this.props;
    this.leafletElement = L.tileLayer.provider(provider, options); 
  }

}
