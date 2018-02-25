class Coder {
    constructor(pmap=['<', '&', '"'], amap=['&lt;', '&amp;', '&quot;']) {
        this.amap = amap;
        this.pmap = pmap;
    }

    decode(content) {
        let reg = new RegExp(`(${this.amap[0]}|${this.amap[1]}|${this.amap[2]})`, 'ig');
        return content.replace(reg, (match, m) => {
            return this.pmap[this.amap.indexOf(m)];
        });
    }

    encode(content, start, end) {
        start = start || 0;
        end = end || content.length;

        let buffer = [];

        for (let i=0, len=content.length; i < len; i++) {
            if (i < start || i > end) {
                buffer.push(content[i]);
            } else {
                let idx = this.pmap.indexOf(content[i]);
                buffer.push(idx === -1 ? content[i] : this.amap[idx]);
            }
        }

        return buffer.join('');
    }
}

export default Coder;
