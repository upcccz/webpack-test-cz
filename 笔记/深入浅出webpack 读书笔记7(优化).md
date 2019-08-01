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

##### Tree-Shaking

TreeShaking可以用来剔除JavaScript中用不上的死代码。它依赖静态的ES6模块化语法，例如通过import和export导入、导出。

因为ES6模块化语法是静态的(在导入、导出语句中的路径必须是静态的字符串，而且不能放入其他代码块中)，这让Webpack可以简单地分析出哪些export的被import了。如果采用了ES5中的模块化，例如`module.export={...}、require(x+y)、if(x){require('./util')}，`则Webpack无法分析出可以剔除哪些代码

为了将采用'ES6'模块化的代码提交给'Webpack，需要配置'Babel'以让其保留'ES6'模块化语句。修改'.babelrc'文件如下:

```js
{
  "presets": [
    [
      "env",
      {
        "modules": false
        // "modules": false 的含义是关闭Babel的模块转换功能，保留原本的ES6模块化语法。
      }
    ]
  ]
}
```

此时重新运行webpack（携带参数 --display-used-exports），会发现webpack能够正确分析出哪些代码被使用了，但是输出的bundle.js文件中，哪些没被使用的代码依然存在。

要剔除用不上的代码， 则还得经过 UglifyJS 处理一遍。可使用UglifyJSPlugin插件，也可以在启动webpack的时候带上参数 `--optimize-minimize`。

综上，启动webpack时候使用命令： `webpack --display-used-exports --optimize-minimize `，就可以发现Tree-Shaking生效了，用不上的代码被剔除了。

**注意点**

在项目中使用大量的第三方库时，我们会发现TreeShaking似乎不生效了，原因是大部分Npm中的代码都采用了CommonJS语法，这导致TreeShaking无法正常工作而降级处理。但幸运的是，有些库考虑到了这一点，这些库在发布到Npm上时会同时提供两份代码，一份采用CommonJS模块化语法，一份采用ES6模块化语法。并且在package.json文件中分别指出这两份代码的入口。

```json
{
  "main":"lib/index.j5",//指明采用 CommonJS模块化的代码入口
  "jsnext:main": "es/index.js" //指明采用 ES6模块化的代码入口
}
```

配置webpack中的 resolve.mainFields，用于配置采用哪个字段作为模块的入口描述。

```js
module.exports = {
  ...,
  resolve: {
    mainFields: ['jsnext:main','browser','main']
    // 优先使用'jsnext:main'作为入口
  }
}
```
虽然并不是每个Npm中的第三方模块都会提供ES6模块化语法的代码，但对于己提供了的代码要尽量优化，目前越来越多的 Npm 中的第三方模块都考虑到了 Tree Shaking， 并对其提供了支持。

##### 抽取公共代码

大型网站通常由多个页面组成，每个页面都是一个独立的单页应用。但由于所有页面都采用同样的技术枝及同一套样式代码，就导致这些页面之间有很多相同的代码。如果每个页面的代码都将这些公共的部分包含进去，则会造成以下问题：

+ 相同的资源被重复加载，浪费用户的流量和服务器的成本。
+ 每个页面需要加载的资源太大，导致网页首屏加载缓慢， 影响用户体验。

提取公共代码就可以解决这些问题。


**如何提取公共代码**

+ 根据网站所使用的技术栈，找出网站的所有页面都需要用到的基础库，以采用React技术枝的网站为例，所有页面都会依赖react、react-dom等库，将它们提取到一个单独的文件base.js中，该文件包含了所有网页的基础运行环境。

+ 在剔除了各个页面中被base.js包含的部分代码后，再找出所有页面都依赖的公共部分的代码，将它们提取出来并放到common.js中。

+ 再为每个网页都生成一个单独的文件，在这个文件中不再包含base.js和common.js中包含的部分，而只包含各个页面单独需要的部分代码。


##### 配置webpack

```js

const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
  entry: {
    base: './base.js',
    a: './a.js',
    b: './b.js',
  },
  plugin: [
    new CommonsChunkPlugin({
      // 从 哪些chunk中抽取
      chunks: ['a', 'b'],
      // 抽取的公共部分形成一个新的chunk
      name: 'common'
    }),

    // 为了从 common 中提取出 base 也包含的部分
    new CommonsChunkPlugin({
      // 从 common 和 base 两个现成的 Chunk 中提取公共的部分
      // 因为common中必定会包含基础库的代码，这两个chunk抽取之后，common就会变小，其中就会没有基础库的代码了
      chunks: ['common', 'base'],
      // 把公共的部分放到 base 中
      name: 'base'
    }),
  ]
}

// base.js
// 在base.js中引入基础库，然后作为入口生成单独的chunk
// 所有页面都依赖的基础库
import 'react';
import 'react-dom';
// 所有页面都使用的样式
import './base.css';
```

打包后生成a.js 、b.js 、common.js 、base.js 四个文件，同时a，b页面不仅要引入自己单独的js文件，也有引入common.js和base.js。

```html
<!-- 基础库代码 需要按顺序引入-->
<script src="base.js"></script>
<!-- a,b公共的代码 -->
<script src="common.js"></script>
<!-- a单独的代码 -->
<script src="a.js"></script>

<!-- 这样先访问a 在访问b的时候，就只需请求b.js了 -->
<!-- common 和 base 已经被缓存 -->
```

**minChunks**

CommonsChunkPlugin提供了一个选项minChunks，表示文件要被提取出来时需要在指定的Chunks中出现的最小次数。假如minChunks=2、chunks=['a','b','c','d']，则任何一个文件只要在['a','b','c','d']中两个以上的Chunk中都出现过，这个文件就会被提取出来。我们可以根据自己的需求去调整minChunks的值，minChunks越小，被提取到common.js中的文件就会越多，但这也会导致部分页面加载的不相关的资源越多:minChunks越大，被提取到common.js中的文件就会越少，但这会导致common.js变小、效果变弱。

根据各个页面之间的相关性选取其中的部分页面时，可用CommonsChunkPlugin提取这部分被选出的页面的公共部分，而不是提取所有页面的公共部分，而且这样的操作可以叠加多次。这样做的效果会很好，但缺点是配置复杂，需要根据页面之间的关系去思考如何配置，该方法并不通用。

##### 分割代码以按需加载

Webpack 内置了强大的分割代码的功能去实现按需加载，实现起来非常简单。举个例子，现在需要做这样一个进行了按需加载优化的网页。

+ 网页首次加载时只加载main.js文件，网页会展示一个按钮，在main.js文件中只包含监听按钮事件和加载按需加载的代码。

+ 在按钮被单击时才去加载被分割出去的show.js文件，在加载成功后再执行show.js里的函数。

```js
// main.js

window.document.getElementById('btn').addEventListener('click', function () {
  // 当按钮被点击后才去加载 show.js 文件，文件加载成功后执行文件导出的函数
  import(/* webpackChunkName: "show" */ './show').then((show) => {
    show('Webpack');
  })
});
```

其中最关键的一句是： ` import(/* webpackChunkName: "show" */ './show') `

Webpack内置了对import（＊）语句的支持，当Webpack遇到了类似的语句时会这样，

+ 以.／show.js为入口重新生成一个Chunk;

+ **当代码执行到import 所在的语句时**才去加载由Chunk 对应生成的文件：

+ import 返回一个Promise ，当文件加载成功时可以在Promise 的then 方法中获取 show.js 导出的内容。


/* webpackChunkName ：'show' *／的含义是为动态生成的Chunk 赋予一个名称，以方便我们追踪和调试代码。如果不指定动态生成的Chunk 的名称，则其默认的名称将会［id].js ，是在Webpack 3 中引入的新特性，在Webpack 3 之前是无法为动态生成的Chunk 赋予名称的。

对应的即是output.chunkFilename配置项，专门指定动态生成的chunk在输出时的文件名称。

```js
module.exports = {
    entry: './main.js'
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js'
        // 如果没有这一行， 则分割出的代码的文件名称将会是［id].js 
        // 这个对应的name 对应的是 /* webpackChunkName ：'show' *／ 中的show
    }
}

```

##### Scope Hoisting

Scope Hoisting 作用域提升， webpack3中提出来的

Scope Hoisting 的实现原理其实很简单：分析模块之间的依赖关系，尽可能将被打散的模块合并到一个函数中，但前提是不能造成代码元余。因此只有那些被引用了一次的模块才能被合井。

假如现在有两个文件

```js
// util.js

export default 'hello, webpack'

// main.js

import str from './util.js'
console.log(str) ;

```

webpack打包之后的部分代码

```js
[
    (function(module, __webpack_exports__, __webpack_require__){
        var __WEBPACK_IMPORTED_MODULE_0_util_js__ = __webpack_require__(1);
        console.log(__WEBPACK_IMPORTED_MODULE_0_util_js__["a"]);
    }),

    (function(module, __webpack_exports__, __webpack_require__){
        __webpack_exports__["a"] = ('hello, webpack')
    }),
]
```

在开启 Scope Hoisting 之后，同样的源码输出部分代码如下。

```js
[
    (function(module, __webpack_exports__, __webpack_require__){
        var util = ('hello, webpack');
        console.log(util);
    }),
]
```

好处：函数申明由两个变成了一个， util. js 中定义的内容被直接注入main.js 对应的模块中。这样使代码体积更小，代码在运行时创建的函数作用域也会变少，所以内存开销也会表小。

由于Scope Hoisting 需要分析模块之间的依赖关系，因此源码必须采用ES6 模块化语句（所以跟上面讲到的Tree-Shaking要有类似的配置），不然它将无法生效。

```js
const ModuleConcatenationPlugin = require ('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
  ...,
  resolve: {
    mainFields: ['jsnext:main','browser','main']
    // 优先使用'jsnext:main'作为入口
  },
  plugins: [
    //  开启 Scope Hoisting
    new ModuleConcatenationPlugin();
  ]
}
```

##### 输出分析工具

在使用webpack时带上两个参数

webpack --profile --json > stats.json

profile 记录构建中的耗时信息
json 会输出一个json文件，这个文件包含所有构建相关的信息

webpack --profile --json会输出字符串形式的json，webpack --profile --json > stats.json ，最后添加的部分是
UNIX/Linux 系统中的管道命令，将输出的内容通过管道输出到stats.json文件中。

http://webpack.github.io/analyse

官网提供的在线web应用，将生产的json文件上传上去就能看到可视化的打包分析。需要注意的是，json文件要删除前面部分无效的内容。

**webpack-bundle-analyzer**

可视化分析工具，一个插件


```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
 
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
// 构建完成自动打开一个分析页面
```
