import {wxaRedux, combineReducers, reducerRegistry, getStore} from '../src/index'
import fs from 'fs';
import path from 'path';

import 'jest-plugin-console-matchers/setup';

getCurrentPages = function() {
    return [{route: 'pages/index/index'}];
};

let og = global.getApp;

let todo = function(state=[], action) {
    switch(action.type) {
        case 'add' : {
            state = [...state, action.payload]
            return state;
        }
        case 'repl': {
            state = action.payload;
            return state;
        }
        default : return state;
    }
}

let comTodo = function(state=[], action) {
    switch(action.type) {
        case 'comAdd' : {
            state = [...state, action.payload]
            return state;
        }
        default : return state;
    }
}

let todoDel = function(state=[], action) {
    switch(action.type) {
        case 'del' : {
            state = [...state, action.payload]
            return state;
        }
        default : return state;
    }
}

describe('App register redux', ()=>{
    test('mount redux store and middlewares', ()=>{

        let reduxFn = wxaRedux({
            reducers: combineReducers({todo})
        });
    
        let mw = jest.fn();
        let reduxFnMW = wxaRedux({
            reducers: combineReducers({todo}),
            middlewares: [function(store){
                return function(){
                    mw();
                }
            }]
        });
    
        let vm = {}, vm2 = {};
    
        reduxFn(vm, 'App');
    
        reduxFnMW(vm2, 'App');
    
        expect(vm.$store).not.toBeNull();
        expect(mw.mock.calls.length).toBe(1);
    });

    test('mount redux store with array', ()=>{
        let reduxFn = wxaRedux([todo]);

        let vm = {};
        reduxFn(vm, 'App');

        expect(vm.$store).not.toBeFalsy();
    })
    
    // middlewares not can be handled by user.
    // test('middlewares not array', ()=>{
    //     let mw = jest.fn();
    
    //     let reduxFnMW = wxaRedux({
    //         reducers: combineReducers({todo}),
    //         middlewares: function(store){
    //             return function(){
    //                 mw();
    //             }
    //         }
    //     });
    
    //     reduxFnMW({}, 'App');
    
    //     expect(mw).not.toHaveBeenCalled();
    // })
    
    test('throw error while type undefined', ()=>{
        let reduxFn = wxaRedux({}, 'Hello');
    
        let page = {};
    
        expect(()=>{
            reduxFn(page)
        }).toThrowErrorMatchingSnapshot();
    });

    // test('reducers is null', ()=>{
    //     let warn = jest.fn();
    //     let ogWarn = console.warn;
    //     console.warn = warn;
        
    //     let reduxFn = wxaRedux();
    //     expect(warn).toHaveBeenCalled();

    //     console.warn = ogWarn;
    // })
})

let app = {};
global.getApp = ()=>app;
let reduxFn = wxaRedux({
    reducers: combineReducers({
        todo,
        todoDel,
        comTodo,
    })
});

reduxFn(getApp(), 'App');

describe('Page use redux', ()=>{

    test('subscribe redux', ()=>{

        let page = {
            setData
        }; 
    
        reduxFn(page, 'Page');
    
        expect(page.$unsubscribe).toBeFalsy();
        page.onLoad();
        expect(page.$unsubscribe).toBeDefined();
    });

    test('call with default function', ()=>{
        const onLoad = jest.fn();
        const onShow = jest.fn();
        const onHide = jest.fn();
        const onUnload = jest.fn();

        let page = {
            setData,
            onLoad, onShow, onHide, onUnload
        };

        reduxFn(page, 'Page');

        expect(onLoad.mock.calls.length).toBe(0);
        page.onLoad({scene: 110});
        expect(onLoad.mock.calls.length).toBe(1);
        expect(onLoad).toHaveBeenCalledWith({scene: 110});
        page.onLoad();
        page.onLoad();
        expect(onLoad.mock.calls.length).toBe(3);
        
        expect(onShow.mock.calls.length).toBe(0);
        page.onShow();
        expect(onShow.mock.calls.length).toBe(1);
        expect(page.$$isCurrentPage).toBe(true);
        
        expect(onHide.mock.calls.length).toBe(0);
        page.onHide();
        expect(onHide.mock.calls.length).toBe(1);
        expect(page.$$isCurrentPage).toBe(false);
        
        expect(onUnload.mock.calls.length).toBe(0);
        page.onUnload();
        expect(onUnload.mock.calls.length).toBe(1);
        expect(page.$unsubscribe).toBeNull();

    })

    test('update data', ()=>{
         let page = {
             data: {},
             mapState: {
                 todoList: (state)=>state.todo
             },
             setData: global.setData
         };

         reduxFn(page, 'Page');

         page.onLoad();

         page.$store.dispatch({type: 'add', payload: 'test+1'});
         expect(page.data).toMatchObject({});
         expect(page.$store.getState().todo.length).toBe(1);
         
         page.onShow();
         page.$store.dispatch({type: 'add', payload: 'test+2'});
         page.$store.dispatch({type: 'add', payload: 'test+3'});
         
         expect(page.data.todoList.length).toBe(3);

         page.$store.dispatch({type: 'del', payload: 'test+3'});
         expect(page.data.todoList.length).toBe(3);
         expect(page.$store.getState().todo.length).toBe(3);
         
         page.onHide();
         page.$store.dispatch({type: 'add', payload: 'test+2'});
         expect(page.data.todoList.length).toBe(3);
         expect(page.$store.getState().todo.length).toBe(4);
         
         page.onShow();
         page.onShow();
         expect(page.data.todoList.length).toBe(4);

         page.onUnload();
         page.onUnload();
    })

    test('page without map', ()=>{
        let page = {
            setData
        };

        reduxFn(page, 'Page');
        page.onLoad();
        page.onShow();
        page.$store.dispatch({type: 'add', payload: 'test+1'});
        expect(page.data).toBeFalsy();
    })

});

describe('Component use redux', ()=>{
    test('mount redux', ()=>{
        const created = jest.fn();
        let com = {
            app,
            created
        };
        let comWithoutApp = {};
        let q = {scene: 110};

        reduxFn(com, 'Component');
        expect(com.$store).not.toBeNull();
        com.created(q);
        expect(created.mock.calls.length).toBe(1);
        expect(created).toHaveBeenCalledWith(q);

        reduxFn(comWithoutApp, 'Component');
        comWithoutApp.attached();
        expect(comWithoutApp.$unsubscribe).toBeFalsy();
    });

    test('dispatch data to component', ()=>{
        const attached = jest.fn();
        const detached = jest.fn();

        let com = {
            data: {},
            attached,
            detached,
            mapState: {
                todoList: (state)=>state.comTodo,
                first: (state)=>state.comTodo && state.comTodo[0]
            },
            setData: global.setData
        }
        
        reduxFn(com, 'Component');
        com.created();
        
        com.attached();
        expect(attached.mock.calls.length).toBe(1);
        expect(com.data).toMatchObject({});
        expect(com.$unsubscribe).not.toBeFalsy();

        com.pageLifetimes.show.bind(com)();
        com.$store.dispatch({type: 'comAdd', payload: 'testcom'});
        expect(com.data.todoList.length).toBe(1);
        com.$store.dispatch({type: 'comAdd', payload: 'testcom'});
        com.$store.dispatch({type: 'comAdd', payload: 'testcom'});
        expect(com.data.todoList.length).toBe(3);
        expect(com.data.first).not.toBeFalsy();

        com.detached();
        expect(com.$unsubscribe).toBeNull();
    })
})

describe('registry reducer', ()=>{
    let reduxFn = wxaRedux({
        reducers: {
            todo
        }
    });

    let page = {
        setData
    }; 
    
    reduxFn(page, 'Page');

    test("check reduers' amount", () => {
        expect(page.$store).not.toBeFalsy();
        expect(Object.keys(page.$store.getState()).length).toBe(1);
    });
    
    test("lazy register reducer", ()=>{
        page.$store.dispatch({type: 'add', payload: 'xxx'});
        expect(page.$store.getState().todo.length).toBe(1);
        
        reducerRegistry.register('todoDel', todoDel);
        reducerRegistry.register('comTodo', comTodo);
        setTimeout(() => {
            expect(Object.keys(page.$store.getState()).length).toBe(3);
            expect(page.$store.getState().todo.length).toBe(1);
        });
    });
})

describe('while dispatch long long data', ()=>{
    let reduxFn = wxaRedux({
        reducers: {
            todo
        }
    });

    let page = {
        setData,
        mapState: {
            todo: (state)=>state.todo
        },
        data: {}
    }; 
    
    reduxFn(page, 'Page');

    test('long data', ()=>{
        page.onLoad();
        // page.onHide();
        expect(page.$$reduxDiff).not.toBeFalsy();
        let pic = fs.readFileSync(path.join(__dirname, './pic.base64.txt')).toString();
        page.$store.dispatch({type: 'add', payload: pic});
        expect(page.$store.getState().todo.length).toBe(1);
        expect(()=>page.onShow()).toConsoleError();
        expect(page.data.todo.length).toBe(0);
        
        page.$store.dispatch({type: 'add', payload: 'hey'});
        expect(page.data.todo.length).toBe(2);
    })
})

test('get store instance', () => {
    expect(getStore()).not.toBeFalsy();
})

afterAll(()=>{
    global.getApp = og;
})