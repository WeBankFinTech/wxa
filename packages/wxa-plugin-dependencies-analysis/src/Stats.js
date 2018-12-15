export class Stats {
  constructor(compilation) {

  }

  toStatsJson(indexOfModule = []) {
    if (!indexOfModule || indexOfModule.length === 0) return;

    const statsJson = [];

    indexOfModule.forEach((item = {}) => {
      if (item.isAbstract || 
        !item.meta.accOutputPath || 
        item.kind !== 'js'
      ) {
        return;
      }

      const {
        meta: {
          accOutputPath = ''
        } = {},
      } = item;

      const statsJsonItem = {
        value: item.size,
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