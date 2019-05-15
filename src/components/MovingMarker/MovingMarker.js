import React from 'react';
import PropTypes from 'prop-types';
import {Marker} from 'react-leaflet';
import {Moving} from './leaflet.movingmarker';

export default class MovingMarker extends Marker {

    static PropTypes = {
        latlngs:PropTypes.array,
        durations:PropTypes.array,
        options:PropTypes.object
    };

    componentWillMount() {
        super.componentWillMount();
        const {latlngs,durations,options} = this.props;
        this.leafletElement = new L.Marker.movingMarker(this.props);
    }

    componentDidUpdate(prevProps) {
        //console.log(prevProps);
    }

}