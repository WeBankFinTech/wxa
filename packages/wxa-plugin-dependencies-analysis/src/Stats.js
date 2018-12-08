export class Stats {
    constructor(compilation) {
        this.compilation = compilation;
    }

    toStatsJson(indexOfModule = []) {
        let statsJsonObj = {
            assets: [],
            chunks: [],
            modules: [],
        };

        indexOfModule.forEach((item, index) => {
            if (!item.isAbstract && item.meta.accOutputPath) {
                const name = item.meta.accOutputPath.split('/').pop();
                const chunks = [index];
                const chunkName = name.split('.')[0];
                const chunkNames = [chunkName];

                statsJsonObj.assets.push({
                    name,
                    // test:
                    size: 1024,
                    emitted: true,
                    chunkNames,
                    // chunks id list
                    chunks
                })
            }
        })

        statsJsonObj.modules = this.toModulesStats(indexOfModule);

        statsJsonObj.chunks = this.toChunksStats(indexOfModule);

        console.log('statsJsonObj', JSON.stringify(statsJsonObj, null, 2))
        return statsJsonObj;
    }

    toModulesStats(modules) {
        return modules.map((item, index) => {
            const moduleItem = {
                name: item.src,
                // test: 
                size: 1024
            };

            // about relative

            return moduleItem;
        })
    }

    toChunksStats(chunks) {
        const result = [];

        chunks.forEach((item, index) => {
            if (!item.isAbstract && item.meta.accOutputPath) {
                const name = item.meta.accOutputPath.split('/').pop();
                const chunkName = name.split('.')[0];
                const chunksItem = {
                    id: index,
                    // test:
                    size: 1024, 
                    hash: item.hash,
                    files: [name],
                    names: [chunkName],
                    modules: [],
                    origins: []
                };

                if (item.childNodes && item.childNodes.length > 0) {
                    chunksItem.modules = this.toModulesStats(item.childNodes);
                }

                result.push(chunksItem);
            }
        })

        return result;
    }
}

