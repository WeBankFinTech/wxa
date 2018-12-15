import React, { Component } from 'react';
const echarts = require('echarts/lib/echarts.js');
require('echarts/lib/chart/treemap.js');
require('echarts/lib/component/tooltip.js');
require('echarts/lib/component/title.js');
import filesize from 'filesize';

export default class Treemap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chart: null
    };
  }

  componentDidMount() {
    this.initTreemap(this.props.treemapData);
  }

  componentDidUpdate() {
    console.log('Treemap componentDidUpdate');
    this.updateTreemap(this.state.chart, this.props.treemapData);
  }

  initTreemap(treemapData) {
    const chart = echarts.init(document.getElementById('chart-main'));

    this.updateTreemap(chart, treemapData);

    this.setState({
      chart
    }) 
  }

  updateTreemap(chart, treemapData) {
    chart.showLoading();

    const formatUtil = echarts.format;

    function getLevelOption() {
      return [
        {
          itemStyle: {
            normal: {
              borderColor: '#777',
              borderWidth: 0,
              gapWidth: 1
            }
          },
          upperLabel: {
            normal: {
              show: false
            }
          }
        },
        {
          itemStyle: {
            normal: {
              borderColor: '#555',
              borderWidth: 5,
              gapWidth: 1
            },
            emphasis: {
              borderColor: '#ddd'
            }
          }
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            normal: {
              borderWidth: 5,
              gapWidth: 1,
              borderColorSaturation: 0.6
            }
          }
        }
      ];
    }

    chart.setOption({

      title: {
        text: '依赖关系Treemap',
        left: 'center'
      },

      tooltip: {
        formatter(info) {
          const value = info.value;
          const path = info.data.path;
          const treePathInfo = info.treePathInfo;
          const treePath = [];

          for (let i = 1; i < treePathInfo.length; i++) {
            treePath.push(treePathInfo[i].name);
          }

          return [
            '<div class="tooltip-title">dep path: ' + formatUtil.encodeHTML(treePath.join('->')) + '</div>',
            '<div class="tooltip-title">size: ' + filesize(value) + '</div>',
            //'outputPath: ' + formatUtil.encodeHTML(path)
          ].join('');
        }
      },

      series: [
        {
          name: '依赖路径',
          type: 'treemap',
          visibleMin: 300,
          label: {
            show: true,
            formatter: '{b}'
          },
          upperLabel: {
            normal: {
              show: true,
              height: 30
            }
          },
          itemStyle: {
            normal: {
              borderColor: '#fff'
            }
          },
          levels: getLevelOption(),
          data: treemapData
        }
      ]
    });

    chart.hideLoading();
  }
  
  render() {
    return (
      <div id='chart-main'
        style={{
          width: 960,
          height: 640,
          margin: 'auto',
          background: '#ccc'
        }}
      />
    );
  }
}
