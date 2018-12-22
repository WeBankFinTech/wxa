import path from 'path'

export class Stats {
  constructor(compilation) {

  }

  get(indexOfModule = []) {
    if (!indexOfModule || indexOfModule.length === 0 || !indexOfModule[0].isROOT) return;

    return indexOfModule[0].childNodes.map((entry)=>this.toStatsJson(entry));
  }

  toStatsJson(mdl) {
    const {
      src,
      category,
      kind,
    } = mdl;

    const statsJsonItem = {
      value: mdl.size,
      name: path.relative(process.cwd(), src),
      path: src,
      category,
      kind
    }

    if (mdl.childNodes && mdl.childNodes.size > 0) {
      statsJsonItem.children = [];

      mdl.childNodes.forEach((child)=>{
        statsJsonItem.children.push(this.toStatsJson(child));
      });
    }

    return statsJsonItem;
  }
}