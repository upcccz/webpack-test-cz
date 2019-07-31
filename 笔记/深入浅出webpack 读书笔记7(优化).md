#####  .babelrc  文件

```js
{
    "plugins": [
        [
            "transform-runtime",
            {
                "polyfill": false
            }
        ]
    ],
    "presets": [
        [
            "es2015",
            {
                "modules": false
            }
        ],
        "stage-2",
        "react"
    ]
}
```

以上配置文件里的transform-runtime 对应的插件全名叫作babel-plugin-transform-runtime ，即在前面加上了babel-plugin－ 。要让Babel 正常运行，我们必须先安装这个插件，是Babel 官方提供的一个插件，作用是减少冗余的代码。Babel 在将ES6 代码转换成ES5 代码时，通常需要一些由ES5 编写的辅助函数来完成新语法的实现，例如在转换class extent 语法时会在转换后的ES5 代码里注入extent 辅助函数用于实现继承。

这会导致每个使用class extent 语法的文件都被注入重复的extent辅助函数代码，babel-plugin-transform-runtime 的作用在于将原本注入JavaScript 文件里的辅助函数替换成一条导入语句，这样能减小Babel 编译出来的代码的文件大小。

```js
var extent= require ('babel-runtime/helpers/extent');
```

由于babel-plugin-transform-runtime 注入了`require ('babel-runtime/helpers/extent')`语句到编译后的代码里，需要安装babel-runtime
依赖到我们的项目后，代码才能正常运行。也就是说babel-plugin-transform-runtime和babel-runtime 需要配套使用，在使用babel-plugin-transform- runtime后一定需要使用babel-runtime


presets 属性告诉Babel 要转换的源码使用了哪些新的语法特性，一个Presets对一组新语法的特性提供了支持，多个Presets 可以叠加

##### 缩小文件的搜索范围

在导入模块时

+ 根据导入语句去寻找对应的要导入的文件。例如`require('react'）`导入语句对应的文件是`.／node_modules/react/react.js`, `require（'.／util'）`对应的文件是`.／util.js`。

+ 根据找到的要导入的文件的后缀，使用配置中的Loader 去处理文件。

**优化Loader 配置**

由于Loader 对文件的转换操作很耗时，所以需要让尽可能少的文件被Loader 处理。可以通过test 、include 、exclude 三个配置项来命中Loader 要应用规则的文件。为了尽可能少地让文件被Loader 处理，可以通过include 去命中只有哪些文件需要被处理。

**优化resolve.modules 配置**

resolve.modules 的默认值是［'node_modules'］，含义是先去当前目录的.／node_modules目录下去找我们想找的模块，如果没找到， 就去上一级目录../node_modules中找，再没有就去../../node_modules 中找，以此类推， 这和Node.js 的模块寻找机制很相似。

可以配置resolve.modules指明存放第三方模块的绝对路径，以减少寻找

`modules: [path.resolve(__dirname ,'node_modules')]`

**优化resolve.alias 配置**

该配置项通过别名来将原导入路径映射成一个新的导入路径。

在默认情况下， Webpack 会从入口文件.／node_modules/react/react.js 开始递归解析和处理依赖的几十个文件，这会是一个很耗时的操作。通过配置resolve.alias,可以让Webpack 在处理React 库时，直接使用单独、完整的react.min.js 文件，从而跳过耗时的递归解析操作。

```js
alias: {
    'react': path.resolve(__dirname, './node_modules/react/dist/react.min.js')
}

// 大多数库被发布到Npm 仓库中时都会包含打包好的完整文件，对于这些库，也可以对它们配置alias
```

但是，对某些库使用本优化方法后，会影响到后面要讲的使用Tree-Sharking 去除无效代码的优化，因为这样引入进来的是打包好的完整文件，其中有部分代码在我们的项目中可能永远用不上。**一般对整体性比较强的库采用本方法优化**，因为完整文件中的代码是一个整体，每一行都是不可或缺的。但是对于一些工具类的库如`lodash(https://github.com/lodash/lodash）` ，我们的项目中可能只用到了其中几个工具函数，就不能使用本方法去优化了，因为这会导致在我们的输出代码中包含很多永远不会被执行的代码

**优化resolve.extensions 配置**

在导入语句没带文件后缀时， Webpack 会在自动带上后缀后去尝试询问文件是否存在。如果这个列表越长，或者正确的后缀越往后，就会造成尝试的次数越多，所以resolve .extensions 的配置也会影响到构建的性能。在配置resolve.extensions时需要遵守以下几点，以做到尽可能地优化构建性能。

+ 后缀尝试列表要尽可能小，不要将项目中不可能存在的情况写到后缀尝试列表中。 频率出现最高的文件后缀要优先放在最前面，以做到尽快退出寻找过程。

+ 在源码中写导入语句时，要尽可能带上后缀， 从而可以避免寻找过程


**优化module. noParse 配置**

module.noParse 配置项可以让Webpack 忽略对部分没采用模块化的文件的递归解析处理，这样做的好处是能提高构建性能。

如jQuery、ChartJS庞大又没有采用模块化标准，让Webpack 解析这些文件既耗时又没有意义。

还有就是优化resolve.alias 配置时，单独、完整的react.min.js 文件没有采用模块化，也通过配置module.noParse 忽略对react.min.js 文件的递归解析处理

```js
module.exports = {
    module: {
        noParse: [/react\.min\.js$/, /jquery|chartjs/ ]
    }
}

```

注意，被忽略的文件里不应该包含 `import`、`require`、`define` 等模块化 语句，不然会导致在构建出的代码中包含无法在浏览器环境下执行的模块化语句。