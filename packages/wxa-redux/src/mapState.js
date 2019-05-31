import shallowequal from 'shallowequal'

export default function mapState(map, state, lastState, context) {
    if(map == null) return null;

    let newState = Object.keys(map).reduce((ret, key)=>{
        if(typeof map[key] !== 'function') {
            console.log(`mapState中的${key}必须为函数`);
            return ret;
        }

        try {
            let fn = map[key];
            if (context) fn = fn.bind(context);
            
            ret[key] = fn(state);
        } catch(e) {
            throw e;
        }
        
        return ret;
    }, {});
    
    if (lastState != null && shallowequal(newState, lastState)) {
        return null;
    } else {
        // 初始状态或者更新状态
        return newState;
    }
}