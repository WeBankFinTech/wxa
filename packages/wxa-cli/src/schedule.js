/**
 * todo:
 *  1. full control compile task
 */

class Schedule {
    constructor() {
        this.queue = [];
    }

    push(task) {
        this.queue.push(task);
        // console.log(this.queue.length);
    }

    run() {
        return Promise.all(this.queue);
    }
}

export default new Schedule();
