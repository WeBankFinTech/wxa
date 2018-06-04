import shallowequal from 'shallowequal'

export default function mapState(map, state, source={}) {
    if(map == null) return null;

    let {newState, oldState} = Object.keys(map).reduce((ret, key)=>{
        ret.newState[key] = map[key](state);
        ret.oldState[key] = map[key](source);
        return ret;
    }, {newState: {}, oldState: {}});

    if(shallowequal(newState, oldState)){
        return null;
    } else {
        return newState;
    }
}