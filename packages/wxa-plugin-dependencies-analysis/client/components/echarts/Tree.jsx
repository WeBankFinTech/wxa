import React, {Component} from 'react';
const echarts = require('echarts/lib/echarts.js');
require('echarts/lib/chart/tree.js');
require('echarts/lib/component/tooltip.js');
require('echarts/lib/component/title.js');

import updateTree from './tree.js';

export default class Tree extends Component {
    componentDidMount() {
        this.vm = echarts.init(document.getElementById('chart-main'));

        console.log(this)
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const data = {
            children: this.props.treemapData,
            name: 'ROOT'
        }
        echarts.util.each(data.children, function (datum, index) {
            index % 2 === 0 && (datum.collapsed = true);
        });

        updateTree(this.vm, data)
    }

    render() {
        return (
            <div id='chart-main'
            style={{
              width: window.innerWidth,
              height: window.innerHeight,
              margin: '0',
              background: '#fff'
            }}
          />
        );
    }
}