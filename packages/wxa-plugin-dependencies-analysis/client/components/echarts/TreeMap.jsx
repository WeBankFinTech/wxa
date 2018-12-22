import React, { Component } from 'react';
const echarts = require('echarts/lib/echarts.js');
require('echarts/lib/chart/treemap.js');
require('echarts/lib/component/tooltip.js');
require('echarts/lib/component/title.js');

import update from './treemap';

export default class Treemap extends Component {
  componentDidMount() {
    this.instance = echarts.init(document.getElementById('chart-main'));

    this.updateTreemap();
  }

  componentDidUpdate() {
    this.updateTreemap();
  }

  updateTreemap() {
    update(this.instance, this.props.treemapData);
  }
  
  render() {
    return (
      <div id='chart-main'
        style={{
          width: window.innerWidth,
          height: window.innerHeight,
          margin: '0',
          background: '#333333'
        }}
      />
    );
  }
}
