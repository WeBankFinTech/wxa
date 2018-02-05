const eventbus = require('../src/utils/eventbus.js').Eventbus;

test('add event', ()=>{
    let bus = new eventbus();
    bus.on('x', ()=>{});
    bus.on('x', ()=>{});
    bus.on('x', ()=>{});

    expect(bus.storage.x).toHaveLength(3);
    expect(bus.storage.y).toBeFalsy();

    expect(bus.clear()).toMatchObject({});
});

test('off event', ()=>{
    let bus = new eventbus();
    let f1 = ()=>{};
    let f2 = ()=>{};
    bus.on('x', f1);
    bus.on('x', f2);
    expect(bus.storage.x).toHaveLength(2);
    bus.off('x', f1);
    bus.off('y', f1);
    expect(bus.storage.x).toHaveLength(1);

    bus.on('x', ()=>{});
    expect(bus.storage.x).toHaveLength(2);

    bus.on('y', f2);
    bus.off('y');
    expect(bus.storage.y).toHaveLength(1);

    bus.clear();
    expect(bus.storage).toMatchObject({});
});

test('emit event', ()=>{
    let bus = new eventbus();
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
    let bus = new eventbus();
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
    expect(bus.storage.x).toHaveLength(0);

    bus.clear();
    expect(bus.storage).toMatchObject({});
});
