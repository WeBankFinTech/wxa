import promisify from '../../ts/utils/promisify';

test('wrap function with promise', ()=>{
    let f = (opt)=>setTimeout(()=>opt&&opt.success());
    let pf = promisify(f);
    expect(pf().then).not.toBeFalsy();
});
