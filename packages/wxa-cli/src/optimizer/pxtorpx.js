import postcss from 'postcss';
import pxtorpx from 'postcss-pxtorpx-pro';
import {isEmpty} from '../utils';

export default function transformPixelsToRpx(mdl, wxaConfigs) {
    let options = wxaConfigs.optimization.transformPxToRpx;
    options = (typeof options === 'boolean' || isEmpty(options)) ? {} : options;

    let css = postcss().use(pxtorpx(options)).process(mdl.code, {from: mdl.src}).css;

    mdl.code = css;

    return mdl;
}
