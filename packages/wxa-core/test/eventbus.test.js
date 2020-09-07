const Eventbus = require('../src/utils/eventbus.js').Eventbus;

test('add event', ()=>{
    let bus = new Eventbus();
    bus.on('x', ()=>{});
    bus.on('x', ()=>{});
    bus.on('x', ()=>{});

    expect(bus._storage.x).toHaveLength(3);
    expect(bus._storage.y).toBeFalsy();

    expect(bus.clear()).toMatchObject({});
});

test('off event', ()=>{
    let bus = new Eventbus();
    let f1 = ()=>{};
    let f2 = ()=>{};
    bus.on('x', f1);
    bus.on('x', f2);
    expect(bus._storage.x).toHaveLength(2);
    bus.off('x', f1);
    bus.off('y', f1);
    expect(bus._storage.x).toHaveLength(1);

    bus.on('x', ()=>{});
    expect(bus._storage.x).toHaveLength(2);

    bus.on('y', f2);
    bus.off('y');
    expect(bus._storage.y).toHaveLength(1);

    bus.clear();
    expect(bus._storage).toMatchObject({});
});

test('emit event', ()=>{
    let bus = new Eventbus();
    let x = 0;
    bus.on('x', ()=>{
        x ++;
    });
    bus.on('x', ()=>{
        x ++;
    });
    bus.on('x', ()=>{
        x ++;
    });

    bus.emit('x');
    expect(x).toBe(3);

    bus.emit('y');
    expect(x).toBe(3);
});

test('clear event', ()=>{
    let bus = new Eventbus();
    let x = 0;
    bus.on('x', ()=>{
        x ++;
    });
    bus.on('x', ()=>{
        x ++;
    });
    bus.on('y', ()=>{
        x ++;
    });

    bus.clear('x');
    expect(bus._storage.x).toHaveLength(0);

    bus.clear();
    expect(bus._storage).toMatchObject({});
});

describe('eventbus scope and once', ()=>{
    let eventbus = new Eventbus();

    test('add event to eventbus with scope', ()=>{
        let current;

        let fn = function() {
            current = this.current;
        };

        eventbus.on('hello', fn, {current: 'scope'});

        eventbus.emit('hello');

        expect(current).toBe('scope');

        current = '';
        eventbus.off('hello', fn);
        eventbus.emit('hello');
        expect(current).toBe('');
    });

    test('call fn once', ()=>{
        let current;
        let fn = function() {
            current = this.current;
        };
        eventbus.once('hey', fn, {current: 'hey'});

        eventbus.emit('hey');

        expect(current).toBe('hey');

        current = 'Hi';

        eventbus.emit('hey');
        expect(current).toBe('Hi');
    });
});
