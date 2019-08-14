import E2ETester from './e2eTester';

export default class TesterController {
    constructor(cmdOptions, wxaConfigs) {
        this.cmdOptions = cmdOptions;
        this.wxaConfigs = wxaConfigs;
    }

    build() {
        if (this.cmdOptions.e2e) {
            return new E2ETester(this.cmdOptions, this.wxaConfigs).build();
        }
    }
}
