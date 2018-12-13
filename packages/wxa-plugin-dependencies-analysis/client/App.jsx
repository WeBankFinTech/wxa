import React, { Component } from 'react';
import Treemap from './components/Treemap';

export default class App extends Component {

  constructor(props) {
    super(props);

    const ws = this.initWS();

    this.state = {
      ws,
      treemapData: []
    }
  }

  componentDidMount() {

  }

  initWS() {
    try {
      let ws = new WebSocket(`ws://${location.host}`);

      ws.addEventListener('message', event => {
        console.log('[ws] message event: ', event);
        const msg = JSON.parse(event.data);

        if (msg.event === 'treemapDataUpdated') {
          console.log('[ws] treemapDataUpdated')

          this.setState({
            treemapData: msg.data
          })
        }
      });

      return ws;
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <Treemap
        treemapData={this.state.treemapData}
      />
    );
  }
}
