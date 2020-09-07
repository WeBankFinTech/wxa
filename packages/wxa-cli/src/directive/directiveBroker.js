import Events from 'events';
import path from 'path';
import color from '../const/color';

let runtimeDirectiveInjectMap = new Map([
    [
        'mock', async function(scheduler) {
            scheduler.$indexOfModule.forEach((mdl)=>{
                if (
                    mdl.category &&
                    mdl.category.toLowerCase() === 'app' &&
                    path.extname(mdl.src) === '.js' &&
                    !/wxa:\/\/wxa\/directive/g.test(mdl.code)
                ) {
                    mdl.color = color.CHANGED;
                    mdl.content = `require('wxa://wxa/directive/index.js'); ${mdl.content}`;

                    scheduler.$depPending.push(mdl);
                }
            });

            await scheduler.$doDPA();
        },
    ],
]);

class DirectiveBroker extends Events {
    constructor(scheduler) {
        super();
        this.$scheduler = scheduler;
        this.$directiveSet = new Set();

        // 监听事件
        this.on('add', (name) => {
            this.$directiveSet.add(name);
        });

        this.on('remove', (name) => {
            this.$directiveSet.delete(name);
        });
    }

    destory() {
        this.$directiveSet.clear();
        this.$scheduler = null;
    }

    async run() {
        let tasks = [];
        this.$directiveSet.forEach((directiveName) => {
            let process = runtimeDirectiveInjectMap.get(directiveName);

            if (process) tasks.push(process.call(null, this.$scheduler));
        });

        await Promise.all(tasks);
    }
}

export {DirectiveBroker};

