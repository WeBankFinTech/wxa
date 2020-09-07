import path from 'path';
import logger from '../helpers/logger';

const COLOR = {
    SKIP: 1,
    INIT: 0,
};

export default class SplitDeps {
    constructor({appConfigs, wxaConfigs, cwd, cmdOptions}) {
        this.cmdOptions = cmdOptions;
        this.wxaConfigs = wxaConfigs;
        this.maxSplitDeps = wxaConfigs.optimization.splitDeps.maxDeps;
        this.NMReg = new RegExp(path.join(cwd, 'node_modules'));

        let pkg = appConfigs.subpackages || appConfigs.subPackages;
        if (pkg) {
            // flattern pages array and remember the subpackage's root.
            this.subPages = pkg.reduce((prev, pkg)=>{
                if (Array.isArray(pkg.pages)) {
                    prev.push({
                        reg: new RegExp('^'+path.join(wxaConfigs.context, pkg.root)),
                        path: pkg.root,
                    });
                }

                return prev;
            }, []);
        } else {
            this.isNoSubPackage = true;
        }
    }

    run(indexedMap) {
        if (this.isNoSubPackage) return;

        let [src, root] = Array.from(indexedMap).find(([src, mdl])=>mdl.isROOT) || [];

        if (root == null) return;
        // 从入口开始溯源
        root.childNodes.forEach((entryPoint, src)=>{
            let pkg = this.subPages.find((sub)=>sub.reg.test(src));

            if (pkg) {
                this.start(entryPoint, pkg);
            }
        });
    }

    clean(dep) {
        dep.$depSplitColor = COLOR.INIT;
        dep.childNodes.forEach((child)=> {
            if (dep.$depSplitColor !== COLOR.INIT) {
                this.clean(child);
            }
        });
    }

    start(dep, pkg) {
        dep.$depSplitColor = COLOR.SKIP;

        dep.childNodes.forEach((child, src)=>{
            // circular dependency
            if (child.$depSplitColor === COLOR.SKIP) return;

            if (
                // an abstract file will never be output, but we still need to track it's childNodes.
                child.isAbstract ||
                // if the child nodes isn't from node_module, it's sub-child nodes might be.
                !this.NMReg.test(child.src)
            ) {
                return this.start(child, pkg);
            }

            if (!this.ifMatchRule(child)) return;

            if (this.cmdOptions.verbose) logger.info('Find NPM need track to subpackages', child.src);
            // fulfill all condition just track all the sub-nodes without any hesitate.
            this.trackChildNodes(child, {output: dep.meta.outputPath, originOutput: dep.meta.outputPath, instance: dep, isSplitEntry: true}, pkg);
        });
    }

    ifMatchRule(child) {
        // not match condition meanning all it's sub-child needn't handle.
        // or the main packages depend on it.
        // just stop the spliting loop.
        if (
            child.reference.size >= this.maxSplitDeps &&
            this.getReferenceSize(child) > this.maxSplitDeps
        ) return false;

        if (child.pret.isWXALib) return false;

        if (this.isInMainPackage(child)) return false;

        return true;
    }

    isInMainPackage(child) {
        if (!child.reference || !child.reference.size) {
            // entry point.
            return (
                !this.subPages.some((sub)=>sub.reg.test(child.src)) ||
                // if a node_module pkg is push in entry. then we always compiler its' to main-package.
                this.NMReg.test(child.src)
            );
        }
        let refs = Array.from(child.reference);
        let inMain = [];
        refs.forEach(([src, mdl])=>{
            // if a child module has neigth subpage nor node_modules reference, then it's in main package
            if (
                !this.subPages.some((sub)=>sub.reg.test(src)) &&
                !this.NMReg.test(src)
            ) {
                inMain.push(true);
            } else {
                inMain.push(false);
            }
        });
        let isInMainPkg = inMain.some((item)=>item);

        if (!isInMainPkg && this.NMReg.test(child.src)) {
            // deep check third party module.
            for (let i = 0; i < refs.length; i ++) {
                let parentNode = refs[i][1];
                if (parentNode.isROOT) continue;

                isInMainPkg = this.isInMainPackage(parentNode);
                // if one of parent is in main, then just stop the loop.
                if (isInMainPkg) break;
            }
        }

        return isInMainPkg;
    }

    trackChildNodes(dep, parent, subpage) {
        // if (/select\-revenue/g.test(dep.src)) debugger;
        // depth-first
        dep.$$isSplit = true;
        let {path: pkg} = subpage;
        // dep is node modules so that nested track sub child-nodes to add all deps to sub-packages
        // four steps to finish deps delivery:
        // 1. generate new outputpath
        // 2. generate new relative path
        // 3. replace parent's code.
        // 4. repeat 1-3 on childnodes.
        let {outputPath} = dep.meta;
        let originResolvedPath = './'+this.getResolved(parent.originOutput, outputPath);
        // let mainNpm = path.join(this.wxaConfigs.context)
        let subNpm = path.join(pkg, 'npm');

        let newOutputPath = outputPath.replace(new RegExp('^'+this.wxaConfigs.output.path+'/npm'), path.join(this.wxaConfigs.output.path, subNpm));

        let newResolvedPath = './'+this.getResolved(parent.output, newOutputPath);
        // component dependency
        if (parent.instance.kind === 'json') {
            originResolvedPath = this.getPathWithoutExtension(originResolvedPath);
            newResolvedPath = this.getPathWithoutExtension(newResolvedPath);
        }

        parent.instance.code = parent.instance.code.replace(new RegExp(originResolvedPath, 'gm'), newResolvedPath);

        // clean multi output
        // if a split module is not an entry module, then we need to check it's reference carefully cause there maybe some other page import it directly. so that we cannot delete it's origin output.
        if (
            dep.output.has(outputPath) &&
            !this.isInMainPackage(dep) &&
            (parent.isSplitEntry || !this.hasNoSplitReference(dep))
        ) dep.output.delete(outputPath);

        // update output path
        dep.output.add(newOutputPath);

        if (dep.childNodes) {
            dep.childNodes.forEach((child)=>{
                // check node_modules's dependencies.
                if (!this.ifMatchRule(child)) {
                    // if (/wxa_wrap/.test(child.src)) {
                    //     debugger;
                    // }
                    let originResolvedPath = './' + this.getResolved(outputPath, child.meta.outputPath);
                    let newChildResolvedPath = './' + this.getResolved(newOutputPath, child.meta.outputPath);
                    if (dep.kind === 'json') {
                        originResolvedPath = this.getPathWithoutExtension(originResolvedPath);
                        newChildResolvedPath = this.getPathWithoutExtension(newChildResolvedPath);
                    }
                    dep.code = dep.code.replace(new RegExp('["\']'+originResolvedPath+'["\']', 'gm'), '"'+newChildResolvedPath+'"');
                    // debugger;
                    return;
                };

                this.trackChildNodes(child, {output: newOutputPath, originOutput: outputPath, instance: dep}, subpage);
            });
        }
    }

    hasNoSplitReference(dep) {
        return Array.from(dep.reference).some(([src, instance])=>!instance.$$isSplit);
    }

    getPathWithoutExtension(pathString) {
        let opath = path.parse(pathString);
        pathString = opath.dir + '/' + opath.name;
        pathString = pathString.replace(/\\/g, '/');

        return pathString;
    }

    getResolved(from, to) {
        return path.relative(path.dirname(from), to).replace(/\\/g, '/');
    }

    getReferenceSize(dep) {
        let from = new Set();

        dep.reference.forEach((mdl)=>{
            let m = this.subPages.find((sub)=>sub.reg.test(mdl.src));
            if (m) from.add(m.path);
        });

        return from.size;
    }
}
