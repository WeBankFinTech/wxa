import React, { Component } from 'react';
import * as d3 from 'd3';
import testData from '../test/test-data';

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            treemap: null,
            width: props.width || '960',
            height: props.height || '960',
        };
    }

    componentDidMount() {
        this.setState({
            treemap: this.createTreemap()
        })
    }

    createTreemap() {
        let {width, height} = this.state;

        let color = d3.scaleOrdinal(d3.schemeCategory10);
        let format = d3.format(",d");

        let svg = d3.select("svg");
        let root = d3.hierarchy(testData);
        let treemap = d3.treemap()
            .size([width, height])
            .round(true)
            .padding(6);

        treemap(root.count());

        let cell = svg.selectAll('rect')
            .data(root.descendants())
            .enter()
            .append('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => {
                return color(d.data.name);
            })
            
        cell.append('title')
            .text(d => {
                return d.data.name;
            })
        
    }

    render() {
        return (
            <svg width={this.state.width} 
                height={this.state.height}
            >
            </svg>
        );
    }
}
