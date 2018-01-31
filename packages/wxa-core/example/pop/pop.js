'use strict';
import {Eventbus, wxa, GetApp} from '../dist/wxa';

let vm = GetApp(Eventbus(
    class Pop {
    options = {
        multipleSlots: true,
    }
    data = {
        animationData: null,
    }
    methods = {
        close: function close(e) {
            this.store.dispatch({type: 'Add', payload: '+pop'});
            this.triggerEvent('popupClose');
        },
    }
    mapState = {
        x: 1,
        y: 2,
    }
    created() {
        console.log(this);
        this.animate = wx.createAnimation({
            duration: 5000,
            delay: 1000,
            timingFunction: 'ease',
        });
    }
    attached() {
        let _this = this;

        console.log(this);
        setTimeout(function() {
            _this.animate.translateY('0').step();
            _this.setData({
                animationData: _this.animate.export(),
            });
        });
    }
    detached() {
        // console.log('detach')
        this.animate.translateY('100%').step();
        this.setData({
            animationData: this.animate.export(),
        });
    }
}));
console.log(vm);
wxa.launch.component(vm);
