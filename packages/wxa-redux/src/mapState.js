import shallowequal from 'shallowequal'

export default function mapState(map, state, source={}, context) {
    if(map == null) return null;

    let {newState, oldState} = Object.keys(map).reduce((ret, key)=>{
        if(typeof map[key] !== 'function') {
            console.log(`mapState中的${key}必须为函数`);
            return ret;
        }

        try {
            let fn = map[key];
            if (context) fn = fn.bind(context);
            
            ret.newState[key] = fn(state);
            ret.oldState[key] = fn(source);
        } catch(e) {
            throw e;
        }
        
        return ret;
    }, {newState: {}, oldState: {}});
    
    if(shallowequal(newState, oldState)){
        return null;
    } else {
        return newState;
    }
}