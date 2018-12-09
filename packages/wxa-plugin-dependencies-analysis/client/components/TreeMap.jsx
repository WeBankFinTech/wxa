import React, { Component } from 'react';
const echarts = require('echarts/lib/echarts.js');
require('echarts/lib/chart/treemap.js');

export default class TreeMap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    componentDidMount() {
        this.initChart();
    }

    initChart() {
        const chart = echarts.init(document.getElementById('chart-main'));

        chart.showLoading();
        const diskData = require('../../test/test-stats.json');
        chart.hideLoading();

        function colorMappingChange(value) {
            var levelOption = getLevelOption(value);
            chart.setOption({
                series: [{
                    levels: levelOption
                }]
            });
        }

        var formatUtil = echarts.format;

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
                text: 'Disk Usage',
                left: 'center'
            },

            tooltip: {
                formatter: function (info) {
                    var value = info.value;
                    var treePathInfo = info.treePathInfo;
                    var treePath = [];

                    for (var i = 1; i < treePathInfo.length; i++) {
                        treePath.push(treePathInfo[i].name);
                    }

                    return [
                        '<div class="tooltip-title">' + formatUtil.encodeHTML(treePath.join('/')) + '</div>',
                        'Disk Usage: ' + formatUtil.addCommas(value) + ' KB',
                    ].join('');
                }
            },

            series: [
                {
                    name:'Disk Usage',
                    type:'treemap',
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
                    data: diskData
                }
            ]
        });
    }

    render() {
        return (
            <div id='chart-main' 
                style={{
                    width: 960,
                    height: 800
                }}
            />
        );
    }
}
