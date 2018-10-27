require("@babel/register");

export default class DependenciesAnalysisPlugin {
    constructor(options = {}) {
         
    }
    apply(compiler) {
        if(compiler.hooks == null || compiler.hooks.done == null) return;

        compiler.hooks.done.tapAsync('DependenciesAnalysisPlugin', (dependencies)=>{
            
        })
    }
}   

