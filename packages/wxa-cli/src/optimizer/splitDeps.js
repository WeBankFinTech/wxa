import path from 'path';

export default class SplitDeps {
    constructor(appConfigs, wxaConfigs) {
        this.wxaConfigs = wxaConfigs;
        this.maxSplitDeps = wxaConfigs.optimization.splitDeps.maxDeps;
        this.NMReg = new RegExp('node_modules');

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

        let [src, root] = Array.from(indexedMap).find(([src, mdl])=>mdl.isROOT);

        // 从入口开始溯源
        root.childNodes.forEach((entryPoint, src)=>{
            let pkg = this.subPages.find((sub)=>sub.reg.test(src));

            if (pkg) {
                this.start(entryPoint, pkg);
            }
        });
    }

    start(dep, pkg) {
        dep.childNodes.forEach((child, src)=>{
            if (
                // an abstract file will never be output, but we still need to track it's childNodes.
                child.isAbstract ||
                // if the child nodes isn't from node_module, it's sub-child nodes might be.
                !this.NMReg.test(child.src)
            ) {
                return this.start(child, pkg);
            }

            // not match condition meanning all it's sub-child needn't handle.
            // or the main packages depend on it.
            // just stop the spliting loop.
            if (
                child.reference.size >= this.maxSplitDeps &&
                this.getReferenceSize(child) > this.maxSplitDeps
            ) return;

            let isInMainPackage = Array.from(child.reference).some(([src, mdl])=>!this.subPages.some((sub)=>sub.reg.test(mdl.src)));
            if (isInMainPackage) return;

            // fulfill all condition just track all the sub-nodes without any hesitate.
            this.trackChildNodes(child, {output: dep.meta.outputPath, originOutput: dep.meta.outputPath, instance: dep}, pkg);
        });
    }

    trackChildNodes(dep, parent, subpage) {
        // depth-first
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
        parent.instance.code = parent.instance.code.replace(
            /(?:\/\*[\s\S]*?\*\/|(?:[^\\:]|^)\/\/.*)|(\.)?require\(['"]?([\w\d_\-\.\/@]+)['"]?\)|import\s+['"]?([\w\d_\-\.\/@]+)['"]?/igm,
            (match, point, dep, importDep)=>{
                if (point) return match;
                // ignore comment
                if (point == null && dep == null && importDep == null) return match;

                dep = dep || importDep;

                return match.replace(new RegExp(originResolvedPath, 'gm'), newResolvedPath);
            });

        // clean multi output
        if (dep.output.has(outputPath)) dep.output.delete(outputPath);

        // update output path
        dep.output.add(newOutputPath);

        if (dep.childNodes) dep.childNodes.forEach((child)=>this.trackChildNodes(child, {output: newOutputPath, originOutput: outputPath, instance: dep}, subpage));
    }

    getResolved(from, to) {
        return path.relative(path.dirname(from), to).replace(/\\/g, '/');
    }

    getReferenceSize(dep) {
        let from = new Set();

        dep.reference.forEach((mdl)=>{
            let m = this.subPages.find((sub)=>sub.reg.test(mdl.src));
            if (m) from.add(mdl.src);
        });

        return from.size;
    }
}
