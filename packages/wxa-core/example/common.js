export default {
    data: {
        email: 'genuifx@gmail.com',
    },
    onLoad(q) {
        console.log('common mixin onLoad');
        console.log(q);
        console.log(this.data);
    },
    methods: {
        bindViewTap() {
            this.router.push('../logs/logs');
        },
    },
};
