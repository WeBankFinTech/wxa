import {wxaRedux, combineReducers} from '../src/index'

let todo = function(state=[], action) {
    switch(action.type) {
        case 'add' : {
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

let setData = function(data) {
    this.data = {
        ...this.data,
        ...data
    }
}

test('mount redux store and middlewares', ()=>{
    let reduxFn = wxaRedux({
        reducers: combineReducers({todo})
    }, 'App');

    let mw = jest.fn();
    let reduxFnMW = wxaRedux({
        reducers: combineReducers({todo}),
        middlewares: [function(store){
            return function(){
                mw();
            }
        }]
    }, 'App');

    let vm = {}, vm2 = {};

    reduxFn(vm);

    reduxFnMW(vm2);

    expect(vm.$store).not.toBeNull();
    expect(mw.mock.calls.length).toBe(1);
});

test('throw error while type undefined', ()=>{
    let reduxFn = wxaRedux({}, 'Hello');

    let page = {};

    expect(()=>{
        reduxFn(page)
    }).toThrowErrorMatchingSnapshot();
});

describe('Page', ()=>{
    let reduxFnApp = wxaRedux({
        reducers: combineReducers({
            todo,
            todoDel
        })
    }, 'App');
    let app = {}; reduxFnApp(app);
    
    let reduxFnPage = wxaRedux({}, 'Page');

    test('subscribe redux', ()=>{
        let page = {
            app,
            setData
        }; 
    
        reduxFnPage(page);
    
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
            app,
            setData,
            onLoad, onShow, onHide, onUnload
        };

        reduxFnPage(page);

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
             app,
             mapState: {
                 todoList: (state)=>state.todo
             },
             setData
         };

         reduxFnPage(page);

         page.onLoad();

         page.store.dispatch({type: 'add', payload: 'test+1'});
         expect(page.data).toBeFalsy();
         expect(app.$store.getState().todo.length).toBe(1);
         
         page.onShow();
         page.store.dispatch({type: 'add', payload: 'test+2'});
         page.store.dispatch({type: 'add', payload: 'test+3'});
         expect(page.data.todoList.length).toBe(3);


         page.store.dispatch({type: 'del', payload: 'test+3'});
         expect(page.data.todoList.length).toBe(3);
         expect(app.$store.getState().todo.length).toBe(3);
         
         page.onHide();
         page.store.dispatch({type: 'add', payload: 'test+2'});
         expect(page.data.todoList.length).toBe(3);
         expect(app.$store.getState().todo.length).toBe(4);
         
         page.onShow();
         page.onShow();
         expect(page.data.todoList.length).toBe(4);

         page.onUnload();
         page.onUnload();
    })

    test('page without map', ()=>{
        let page = {
            app,
            setData
        };

        reduxFnPage(page);
        page.onLoad();
        page.onShow();
        page.$store.dispatch({type: 'add', payload: 'test+1'});
        expect(page.data).toBeFalsy();
    })

});

describe('Component', ()=>{
    let reduxFnApp = wxaRedux({
        reducers: combineReducers({todo})
    }, 'App');
    let app = {}; reduxFnApp(app);
    
    let reduxFnComponent = wxaRedux({}, 'Component');

    test('mount redux', ()=>{
        const created = jest.fn();
        let com = {
            app,
            created
        };
        let comWithoutApp = {};
        let q = {scene: 110};

        reduxFnComponent(com);
        expect(com.$store).not.toBeNull();
        com.created(q);
        expect(created.mock.calls.length).toBe(1);
        expect(created).toHaveBeenCalledWith(q);

        reduxFnComponent(comWithoutApp);
        comWithoutApp.attached();
        expect(comWithoutApp.$unsubscribe).toBeFalsy();
    });

    test('dispatch data to component', ()=>{
        const attached = jest.fn();
        const detached = jest.fn();

        let com = {
            app,
            attached,
            detached,
            mapState: {
                todoList: (state)=>state.todo,
                first: (state)=>state.todo && state.todo[0]
            },
            setData
        }
        
        reduxFnComponent(com);
        com.created();
        
        com.attached();
        expect(attached.mock.calls.length).toBe(1);
        expect(com.data).toBeFalsy();
        expect(com.$unsubscribe).not.toBeFalsy();

        com.$store.dispatch({type: 'add', payload: 'testcom'});
        expect(com.data.todoList.length).toBe(1);
        com.$store.dispatch({type: 'add', payload: 'testcom'});
        com.$store.dispatch({type: 'add', payload: 'testcom'});
        expect(com.data.todoList.length).toBe(3);
        expect(com.data.first).not.toBeFalsy();

        com.detached();
        expect(com.$unsubscribe).toBeNull();
    })
})