Usually, dynamic path like `path/to/dir/{{boo}}.png`, @wxa/cli wouldn't resolve all files for it. So we need to copy this kind of static assets from project to build dist directory. That what CopyPlugin for.

# Usage
```js
{
    context: path.resolve(__dirname, 'src'),
    plugins: [
        new CopyPlugin({
            from: './static', // relative to process.cwd
            to: 'static',  // dist dir name
            ignore: ['a.png']
        })
    ]
}
```