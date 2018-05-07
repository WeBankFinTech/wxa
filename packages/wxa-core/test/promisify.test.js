import promisify from '../src/utils/promisify';

test('wrap function with promise', ()=>{
    let f = (opt)=>setTimeout(()=>opt&&opt.success());
    let pf = promisify(f);
    expect(pf().then).not.toBeFalsy();
});
