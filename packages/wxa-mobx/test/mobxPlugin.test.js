
import mobxPlugin from '../src/index';
import { action, flow } from 'mobx';

describe('watch plugin', ()=>{
    let mobxFn = mobxPlugin();

    test('not work with App or Component', ()=>{
        let mock = jest.fn();

        let vm = {
            watch: {
                'a': mock
            }
        };

        // test started.
        mobxFn(vm, 'App');
    
        expect(mock).not.toBeCalled();

        mobxFn(vm, 'Component');

        expect(mock).not.toBeCalled();
    })

    // test('test mobx function', ()=>{

    //     let vm = {
    //         store: {
    //             a: 1,
    //             add(){this.a++}
    //         },
    //         add(){
    //             this.$store.add();
    //         }
    //     };

    //     // test started.
    //     mobxFn(vm, 'Page');
    //     vm.onLoad();
    //     vm.$store.add();
    //     expect(vm.$store.a).toBe(2);

    // })

    // test('test mobx comouted property', ()=>{

    //     let vm = {
    //         store: {
    //             a: 1,
    //             b: 2,
    //             get c(){
    //                 return this.a + this.b;
    //             }
    //         }
    //     };

    //     // test started.
    //     mobxFn(vm, 'Page');
    //     vm.onLoad();
    //     expect(vm.$store.c).toBe(3);
    //     vm.$store.a = 2;
    //     expect(vm.$store.c).toBe(4);

    // })

    // test('test mobx async', ()=>{

    //     let vm = {
    //         store: {
    //             a: 1,
    //             fetchA: action(()=>{
    //                 return new Promise(resolve=>{
    //                     setTimeout(()=>{
    //                         action(()=>{
    //                             this.a = 2;
    //                             resolve(this.a);
    //                         });
    //                     });
    //                 })
    //             })
    //         }
    //     };

    //     // test started.
    //     mobxFn(vm, 'Page');
    //     vm.onLoad();
    //     vm.$store.fetchA().then(()=>{
    //         console.log('---');
    //         console.log(vm.$store.a);
    //     });
        
        
    // })

})