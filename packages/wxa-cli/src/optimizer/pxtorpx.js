import postcss from 'postcss';
import pxtorpx from 'postcss-pxtorpx-pro';
import {isEmpty} from '../utils';

export default async function transformPixelsToRpx(mdl, wxaConfigs) {
    let options = wxaConfigs.optimization.transformPxToRpx;
    options = (typeof options === 'boolean' || isEmpty(options)) ? {} : options;

    let result = await postcss([pxtorpx(options)]).process(mdl.code, {from: mdl.src});

    mdl.code = result.css;

    return mdl;
}
