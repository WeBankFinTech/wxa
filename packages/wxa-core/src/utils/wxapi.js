import promisify from './promisify';
/**
 * promise化微信的api
 */
let wxapi = {};
Object.keys(wx).forEach((key)=>{
    wxapi[key] = promisify(wx[key], key);
});

export default wxapi;
