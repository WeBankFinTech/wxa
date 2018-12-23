import filesize from 'filesize';
const formatUtil = require('echarts/lib/echarts.js').format;
require('echarts/lib/chart/treemap.js');
require('echarts/lib/component/tooltip.js');
require('echarts/lib/component/title.js');

export default function updateTreeMap(chart, treemapData) {
    chart.showLoading();

    function colorMappingChange(value) {
        var levelOption = getLevelOption(value);
        chart.setOption({
            series: [{
                levels: levelOption
            }]
        });
    }
    
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
            text: '',
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

        series: [{
            name: '依赖路径',
            type: 'treemap',
            visibleMin: 300,
            label: {
                show: true,
                formatter: '{b}'
            },
            upperLabel: {
                normal: {
                    show: false,
                    height: 30,
                    backgroundColor: 'green',
                    position: 'inside'
                }
            },
            itemStyle: {
                normal: {
                    borderColor: '#fff'
                }
            },
            levels: getLevelOption(),
            leafDepth: 2,
            data: treemapData
        }]
    });

    chart.hideLoading();
}