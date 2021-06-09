class Scope {
    constructor(options) {
        options = options || {};

        this.parent = options.parent;
        this.depth = this.parent ? this.parent.depth + 1 : 0;
        this.names = options.params || [];
        this.nodes = {};
        this.isBlockScope = !!options.block;
        this.children = [];
        
        if (this.parent) {
            this.parent.children.push(this);
        }
    }
    // 添加变量名
    // isBlockDeclaration 是否是块级声明：let const class import
    add(node, name, isBlockDeclaration) {
        if (!isBlockDeclaration && this.isBlockScope) {
            // it's a `var` or function declaration, and this
            // is a block scope, so we need to go up
            this.parent.add(node, name, isBlockDeclaration);
        } else {
            this.names.push(name);
            // 变量名可能重复，两个var声明同一变量
            if (this.nodes[name]) {
                this.nodes[name].push(node);
            } else {
                this.nodes[name] = [node];
            }
        }
    }

    contains(name) {
        return !!this.findDefiningScope(name);
    }

    findDefiningScope(name) {
        if (this.names.includes(name)) {
            return this;
        }

        if (this.parent) {
            return this.parent.findDefiningScope(name);
        }

        return null;
    }
}

module.exports = {
    Scope,
};
