import path from 'path';

export default class DefaultWxaConfigs {
    constructor(cwd) {
        this.cwd = cwd;
    }

    get() {
        let context = path.resolve(this.cwd, 'src');
        return {
            target: 'wxa',
            context,
            resolve: {
                wxaExt: '.wxa',
                extensions: ['.js', '.json'],
                appConfigPath: path.join(context, 'app.json'),
                alias: {
                    '@': path.join(this.cwd, 'src'),
                },
            },
            entry: [path.resolve(this.cwd, 'src/app*'), path.resolve(this.cwd, 'src/project.config.json'), path.resolve(this.cwd, 'src/ext.json')],
            output: {
                path: path.resolve(this.cwd, 'dist'),
            },
            use: [
                {
                    test: /\.js$|\.wxs$/,
                    name: 'babel',
                },
                {
                    test: /\.sass|\.scss/,
                    name: 'sass',
                },
            ],
        };
    }
}
