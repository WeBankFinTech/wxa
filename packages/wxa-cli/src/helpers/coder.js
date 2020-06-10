class Coder {
    constructor(pmap=['<', '&', '"', '>'], amap=['&lt;', '&amp;', '&quot;', '&gt;']) {
        this.amap = amap;
        this.pmap = pmap;
    }

    decode(content, pmap, amap) {
        pmap = pmap || this.pmap;
        amap = amap || this.amap;

        let ret = amap.reduce((ret, item)=>(ret+'|'+item), '').replace(/^\|/, '');
        let reg = new RegExp(`(${ret})`, 'ig');
        return content.replace(reg, (match, m) => {
            return pmap[amap.indexOf(m)];
        });
    }

    encode(content, start, end, pmap, amap) {
        start = start || 0;
        end = end || content.length;
        pmap = pmap || this.pmap;
        amap = amap || this.amap;


        let buffer = [];

        for (let i=0, len=content.length; i < len; i++) {
            if (i < start || i > end) {
                buffer.push(content[i]);
            } else {
                let idx = pmap.indexOf(content[i]);
                buffer.push(idx === -1 ? content[i] : amap[idx]);
            }
        }

        return buffer.join('');
    }

    encodeTemplate(content, start, end) {
        let before = content.slice(0, start);
        let template = content.slice(start, end);
        let after = content.slice(end, content.length);
        let that = this;
        // 表达式需要单独encode
        template = template.replace(/{{([^{}]*)}}/g, function(match, express) {
            return `{{${that.encode(express)}}}`;
        });

        return before+this.encode(template, void(0), void(0), ['&'], ['&amp;'])+after;
    }

    decodeTemplate(content) {
        let template = this.decode(content, ['&'], ['&amp;']);

        // 表达式单独转义
        let that = this;
        template = template.replace(/{{([^{}]*)}}/g, function(match, express) {
            return `{{${that.decode(express)}}}`;
        });

        return template;
    }
}

export default Coder;
