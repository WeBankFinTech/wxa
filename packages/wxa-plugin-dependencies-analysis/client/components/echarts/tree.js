import filesize from 'filesize';
const echarts = require('echarts/lib/echarts.js');
require('echarts/lib/chart/treemap.js');
require('echarts/lib/component/tooltip.js');
require('echarts/lib/component/title.js');
const formatUtil = echarts.format;

export default function updateTree(chart, data) {
    chart.hideLoading();

    chart.setOption({
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            formatter(info) {
                const {
                    value, data
                } = info;
      
                // for (let i = 1; i < treePathInfo.length; i++) {
                //   treePath.push(treePathInfo[i].name);
                // }
      
                let tip = [
                  '<div class="tooltip-title">Name: ' + data.name + '</div>',
                  '<div class="tooltip-title">Kind: ' + data.kind + '</div>',
                  '<div class="tooltip-title">Size: ' + filesize(value) + '</div>',
                  '<div class="tooltip-title">Path: ' + data.path + '</div>',
                ]

                if(data.category) {
                    tip.unshift('<div class="tooltip-title">Category: ' + data.category + '</div>')
                }

                return tip.join('');
              }
        },
        series: [
            {
                type: 'tree',

                data: [data],

                top: '1%',
                left: '7%',
                bottom: '1%',
                right: '20%',

                symbolSize: 7,

                label: {
                    normal: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 9
                    }
                },

                leaves: {
                    label: {
                        normal: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    }
                },

                expandAndCollapse: true,
                animationDuration: 550,
                animationDurationUpdate: 750
            }
        ]
    });
}