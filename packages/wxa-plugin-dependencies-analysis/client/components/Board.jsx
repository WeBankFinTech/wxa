import React, { Component } from 'react';
import './board.css';
import Treemap from './echarts/TreeMap.jsx'
import Tree from './echarts/Tree.jsx'

export default class Board extends Component {
    constructor(prop) {
        super(prop)

        this.state = {
            kind: 'Tree',
            repo: ['Tree', 'TreeMap']
        }
    }

    componentDidMount() {}

    change(tar) {
        console.log(tar)
        this.setState({kind: tar});
    }

    render() {
        return (
            <main>
                <ul className="switcher">
                    {
                        this.state.repo.map((item)=>(
                            <li 
                                key={item}
                                className={item === this.state.kind ? 'active' : ''} 
                                onClick={()=>this.change(item)}
                            >{item}</li>
                        ))
                    }
                </ul>
                <section>
                    {
                        this.state.kind === 'TreeMap' && <Treemap treemapData={this.props.treemapData}></Treemap>
                    }
                    {
                        this.state.kind === 'Tree' && <Tree treemapData={this.props.treemapData}></Tree>
                    }
                </section>
            </main>
        );
    }
}