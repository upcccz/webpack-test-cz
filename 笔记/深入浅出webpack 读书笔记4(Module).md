#### Module

`rules` 配置模块的读取和解析规则，通常用来配置 `Loader`。其类型是一个数组，数组里的每一项都描述了如何处理部分文件。配置一项 `rules` 时大致可通过以下方式来完成 。

+ 条件匹配: 通过 `test`、 `include`、 `exclude` 三个配置项来选中 `Loader` 要应用 规则的文件。
+ 应用规则: 对选中的文件通过 `use` 配置项来应用 `Loader`，可以只应用一个 `Loader` 或者按照从后往前的顺序应用一组 `Loader`，同时可以分别向 `Loader`传入参数。
+ 重置顺序: 一组 `Loader` 的执行顺序默认是从右到左执行的，通过 `enforce` 选项可以将其中 一个 `Loader` 的执行顺序放到最前或者最后 

```js
module: { 
  rules: [
    //命中 JavaScript 文件
    test: /\.js$/，
    //用 babel-loader 转换 JavaScript 文件
    // ?cacheDirectory 表示传给 babel-loader 的参数，用于缓存 babel 的编译结果，加快重新编译的速度
    use : ['babel-loader?cacheDirectory'],
    //只命中 src 目录里的 JavaScript 文件，加快 Webpack 的搜索速度
    include: path.resolve( dirname, 'src')
  ]
}
```

在 `Loader` 需要传入很多参数时，我们还可以通过一个 `Object` 来描述，例如在上面的 `babel-loader` 配置中有如下代码:

```js

use: [
  loader :'babel-loader', 
  options :{
    cacheDirectory:true,
    // enforce :'post' 的含义是将该 Loader 的执行顺序放到最后
    // enforce 的值还可以是 pre，代表将 Loader 的执行顺序放到最前面 
    enforce :'post'
  }
]
//省略其他 Loader
```

`test`、 `include`、 `exclude`这三个命中文件的配置项只传入了一个字符串或正则，其实它们也支持数组类型。

```js
{
  test: [
    /\.jsx$/,
    /\.tsx$/
  ],
  include: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'tests'),
  ],
  exclude: [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'test2'),
  ]
}
```

##### noParse

`noParse` 配置项可以让 `Webpack` **忽略对部分没采用模块化的文件的递归解析和处理**，这样做的好处是能提高构建性能。原因是一些库如 `jQuery`、 `ChartJS` 庞大又没有采用模块化标准， 让`Webpack`去解析这些文件既耗时又没有意义。

`noParse` 是可选的配置项，类型需要是 `RegExp`、`[RegExp]` 、`function`中的一种。

```js
{ 
  // 使用正则表达式
  noParse: /jquery|chartjs/ 

  //使用函数，从 Webpack 3.0.0 开始支持 
  noParse : (content)=> {
      // content 代表一个模块的文件路径
      //返回 true 或 false
      return /jquery|chart/.test(content) ;
  }
}
```

注意，被忽略的文件里不应该包含 `import`、`require`、`define` 等模块化 语句，不然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句。

##### parse

因为 `Webpack` 是以模块化的 `JavaScript` 文件为入口的，所以内置了对模块化 `JavaScript` 的解析功能，支持 `AMD,` `CommonJS`、 `SystemJS`、 `ES6`。 `parser` 属性可以更细粒度地配置 哪些模块语法被解析、哪些不被解析。同 `noParse `配置项的区别在于， `parser`可以精确到语法层面，而`noParse`只能控制哪些文件不被解析。 `parser`的使用方法如下:

```js
rules : [
  test: /\.js$/，
  use: ['babel-loader'],
  parser: {
    amd: false, // 禁用 AMD
    commonjs: false, // 禁用 CommonJS
    system: false, // 禁用 SystemJS
    harmony: false, // 禁用 ES2015 Harmony import/export
    requireInclude: false, // 禁用 require.include
    requireEnsure: false, // 禁用 require.ensure
    requireContext: false, // 禁用 require.context
    browserify: false, // 禁用特殊处理的 browserify bundle
    requireJs: false, // 禁用 requirejs.*
    node: false, // 禁用 __dirname, __filename, module, require.extensions, require.main 等。
    node: {...} // 在模块级别(module level)上重新配置 node 层(layer)
  }
]
```