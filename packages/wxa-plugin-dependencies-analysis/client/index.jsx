import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
    <App />, 
    document.getElementById('root')
);

try {
    let ws = new WebSocket(`ws://${location.host}`);
    ws.addEventListener('message', event => {
        console.log('ws message event: ', event);
       
    });
} catch(err) {
    console.error(err);
}
