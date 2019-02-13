import mapState from '../src/mapState'
import shallowequal from 'shallowequal';
import 'jest-plugin-console-matchers/setup';

test('shallowequal', ()=>{
    let state = {
        register$: {
            ret: false
        }
    };

    let source = {
        register$: {
            ret: true
        }
    };

    expect(shallowequal(state, source)).not.toBeNull();
})

test('mapState', ()=>{
    let map = {
        register$: (state)=>state.register$
    }; 

    let state = {
        register$: {
            ret: false
        }
    };

    let source = {
        register$: {
            ret: true
        }
    };

    expect(mapState(map, state, source)).not.toBeNull();
    expect(mapState(map, state, state)).toBeNull();
})

test('map null', ()=>{
    let map = null;

    let state = {
        register$: {
            ret: false
        }
    };

    let source = {
        register$: {
            ret: true
        }
    };

    expect(mapState(map, state, source)).toBeNull();
})

test('console log and jump mapState while value is not a function ', ()=>{
    let map = {
        x: 1,
        y: null,
        z: {}
    }

    let state = {
        register$: {
            ret: false
        }
    };

    let source = {
        register$: {
            ret: true
        }
    };

    expect(()=>mapState(map, state, source)).toConsoleLog();
})