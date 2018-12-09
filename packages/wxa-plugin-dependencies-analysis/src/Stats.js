export class Stats {
    constructor(compilation) {
        
    }

    toStatsJson(indexOfModule = []) {
        if (!indexOfModule || indexOfModule.length === 0) return;

        const statsJson = [];
        
        const statsJsonItem = {
            value: '',
            name: '',
            path: '',
        }

        indexOfModule.forEach((item = {}) => {
            if (item.isAbstract || !item.meta.accOutputPath) return;

            const { 
                meta: { 
                    accOutputPath = '' 
                } = {},
                code = ''
            } = item;

            const statsJsonItem = {
                value: code.length,
                name: accOutputPath.split('/').pop(),
                path: accOutputPath,
            }
            
            if (item.childNodes && item.childNodes.size > 0) {
                statsJsonItem.children = this.toStatsJson(item.childNodes);
            }
            
            statsJson.push(statsJsonItem);
        })

        return statsJson;
    }
}

