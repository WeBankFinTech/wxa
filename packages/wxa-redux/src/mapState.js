import shallowequal from 'shallowequal'

export default function mapState(map, state) {
    if(map == null) return null;

    let newState = Object.keys(map).reduce((ret, key)=>{
        ret[key] = map[key](state);
        return ret;
    }, {});

    if(shallowequal(newState, state)) return null;

    return newState;
}