#### 模块化

模块化是指把一个复杂的系统分解到多个模块以方便编码。

**缺点**

+ 命名空间冲突，两个库可能会使用同一个名称，例如 `Zepto` 和 `jQuery`都被放在 `window.$` 下；
+ 无法合理地管理项目的依赖和版本；
+ 无法方便地控制依赖的加载顺序。

##### CommonJS

`CommonJS` 是一种使用广泛的 `JavaScript` 模块化规范，核心思想是通过 `require` 方法来同步地加载依赖的其他模块，通过 `module.exports` 导出需要暴露的接口。

优点：代码可复用于 `Node.js` 环境下并运行，例如做同构应用；通过 `NPM` 发布的很多第三方模块都采用了 `CommonJS` 规范。
缺点：代码无法直接运行在浏览器环境下，必须通过工具转换成标准的 `ES5`。

```js
// 导入
const moduleA = require('./moduleA');

// 导出
module.exports = moduleA.someFunc;
```

##### ES6 模块化

它在语言的层面上实现了模块化。浏览器厂商和 `Node.js` 都宣布要原生支持该规范。它将逐渐取代 `CommonJS` 和 `AMD` 规范，成为浏览器和服务器通用的模块解决方案。

```js
// 导入
import { readFile } from 'fs';
import React from 'react';
// 导出
export function hello() {};
export default {
  // ...
};
```

##### 样式文件中的模块化

```scss
// util.scss 文件

// 定义样式片段
@mixin center {
  // 水平竖直居中
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

// main.scss 文件

// 导入和使用 util.scss 中定义的样式片段
@import "util";
#box{
  @include center;
}
```

#### 常见的构建工具及对比

各种可以提高开发效率的新思想和框架被发明。但是这些东西都有一个共同点：源代码无法直接运行，必须通过转换后才可以正常运行。

构建就是做这件事情，把源代码转换成发布到线上的可执行 `JavaScrip`、`CSS`、`HTML` 代码，包括如下内容。

+ 代码转换：`TypeScript` 编译成 `JavaScript`、`SCSS` 编译成 `CSS` 等。
+ 文件优化：压缩 `JavaScript`、`CSS`、`HTML`代码，压缩合并图片等。
+ 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
+ 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
+ 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
+ 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
+ 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。

构建其实是工程化、自动化思想在前端开发中的体现，把一系列流程用代码去实现，让代码自动化地执行这一系列复杂的流程。 构建给前端开发注入了更大的活力，解放了我们的生产力

##### Npm Script

`Npm Script` 是一个任务执行者。`Npm` 是在安装 `Node.js` 时附带的包管理器，`Npm Script `则是 `Npm` 内置的一个功能，允许在 `package.json `文件里面使用 `scripts` 字段定义任务：

```js
{
  "scripts": {
    "dev": "node dev.js",
    "pub": "node build.js"
  }
}
// 每个属性对应一段 Shell 脚本其底层实现原理是通过调用 Shell 去运行脚本命令 
// 例如执行 npm run pub 命令等同于执行命令 node build.js。
```

##### Grunt

`Grunt` 和 `Npm Script` 类似，也是一个任务执行者。`Grunt` 有大量现成的插件封装了常见的任务，也能管理任务之间的依赖关系，自动化执行依赖的任务，每个任务的具体执行代码和依赖关系写在配置文件 `Gruntfile.js` 里。

```js
module.exports = function(grunt) {
  // 所有插件的配置信息
  grunt.initConfig({
    // uglify 插件的配置信息
    uglify: {
      app_task: {
        files: {
          'build/app.min.js': ['lib/index.js', 'lib/test.js']
        }
      }
    },
    // watch 插件的配置信息
    watch: {
      another: {
          files: ['lib/*.js'],
      }
    }
  });

  // 告诉 grunt 我们将使用这些插件
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 告诉grunt当我们在终端中启动 grunt 时需要执行哪些任务
  grunt.registerTask('dev', ['uglify','watch']);
};
// 在项目根目录下执行命令 grunt dev 就会启动 JavaScript 文件压缩和自动刷新功能。
```

优点：灵活，它只负责执行你定义的任务；大量的可复用插件封装好了常见的构建任务。
缺点：集成度不高，要写很多配置后才可以用，无法做到开箱即用。

##### Gulp

`Gulp` 是一个基于流的自动化构建工具。 除了可以管理和执行任务，还支持监听文件、读写文件。`Gulp`被设计得非常简单，只通过下面5个方法就可以胜任几乎所有构建场景：

+ 通过 `gulp.task` 注册一个任务；
+ 通过 `gulp.run` 执行任务；
+ 通过 `gulp.watch` 监听文件变化；
+ 通过 `gulp.src` 读取文件；
+ 通过 `gulp.dest` 写文件。

```js
// 引入 Gulp
var gulp = require('gulp'); 
// 引入插件
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

// 编译 SCSS 任务
gulp.task('sass', function() {
  // 读取文件通过管道喂给插件
  gulp.src('./scss/*.scss')
    // SCSS 插件把 scss 文件编译成 CSS 文件
    .pipe(sass())
    // 输出文件
    .pipe(gulp.dest('./css'));
});

// 合并压缩 JS
gulp.task('scripts', function() {
  gulp.src('./js/*.js')
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

// 监听文件变化
gulp.task('watch', function(){
  // 当 scss 文件被编辑时执行 SCSS 任务
  gulp.watch('./scss/*.scss', ['sass']);
  gulp.watch('./js/*.js', ['scripts']);    
});
```
优点：好用又不失灵活，既可以单独完成构建也可以和其它工具搭配使用。相对于` Grunt`，`Gulp`增加了监听文件、读写文件、流式处理的功能。
缺点：集成度不高，要写很多配置后才可以用，无法做到开箱即用。

##### webpack

`Webpack `是一个打包模块化 `JavaScript `的工具，在 `Webpack` 里一切文件皆模块，通过 `Loader` 转换文件，通过 `Plugin` 注入钩子，最后输出由多个模块组合成的文件。`Webpack` 专注于构建模块化项目。

优点：专注于处理模块化的项目，能做到开箱即用一步到位；通过 `Plugin` 扩展，完整好用又不失灵活；使用场景不仅限于`Web` 开发；社区庞大活跃，经常引入紧跟时代发展的新特性，能为大多数场景找到已有的开源扩展；良好的开发体验。
缺点：只能用于采用模块化开发的项目

##### Rollup

`Rollup` 是一个和 `Webpack` 很类似但专注于 `ES6 `的模块打包工具。 `Rollup` 的亮点在于能针对 `ES6` 源码进行 `Tree Shaking` 以去除那些已被定义但没被使用的代码，以及 `Scope Hoisting` 以减小输出文件大小提升运行性能。 然而 `Rollup` 的这些亮点随后就被 `Webpack` 模仿和实现。` Rollup` 在用于打包 `JavaScript` 库时比 `Webpack` 更加有优势，因为其打包出来的代码更小更快。 但功能不够完善，很多场景都找不到现成的解决方案。

+ `Rollup` 是在 `Webpack` 流行后出现的替代品；
+ `Rollup` 生态链还不完善，体验不如 `Webpack`；
+ `Rollup` 功能不如 `Webpack `完善，但其配置和使用更加简单；
+ `Rollup` 不支持 `Code Spliting`，但好处是打包出来的代码中没有 `Webpack` 那段模块的加载、执行和缓存的代码

#### 安装与使用

```js
# 安装最新稳定版 -D 安装到开发依赖
npm i -D webpack
```

安装完后你可以通过这些途径运行安装到本项目的 `Webpack`：

+ 在项目根目录下对应的命令行里通过输入 `node_modules/.bin/webpack`运行
+ 在 `Npm Script` 里定义的任务会优先使用本项目下的 `Webpack`，代码如下：

```js
"scripts": {
    "start": "webpack --config webpack.config.js"
}
```

`Webpack` 在执行构建时默认会从项目根目录下的` webpack.config.js` 文件读取配置。

```js
const path = require('path');

// 通过 CommonJS 规范导出一个描述如何构建的 Object 对象。 

module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

执行 `webpack` 命令运行 `Webpack` 构建，你会发现目录下多出一个 `dist` 目录，里面有个 `bundle.js` 文件， `bundle.js `文件是一个可执行的 `JavaScript `文件，它包含页面所依赖的模块及内置的 `webpackBootstrap` 启动函数。 这时你用浏览器打开 `index.html `网页将会看到正常的展示。

`Webpack` 是一个打包模块化 `JavaScript` 的工具，它会从 `main.js` 出发，识别出源码中的模块化导入语句， 递归的寻找出入口文件的所有依赖，把入口和其所有依赖打包到一个单独的文件中。

#### 使用Loader

 `Webpack` 不原生支持解析 如`CSS` 等文件。要支持非 `JavaScript `类型的文件，需要使用 `Webpack `的 `Loader` 机制。

 ```js
const path = require('path');

module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        use: ['style-loader', 'css-loader?minimize'],
      },
      // 或者
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader:'css-loader',
            options: {
              minimize: true,
            }
          }
        ],
      }
    ]
  }
};
 ```

 `Loader` 可以看作具有文件转换功能的翻译员，配置里的 `module.rules` 数组配置了一组规则，告诉 Webpack 在遇到哪些文件时使用哪些 Loader 去加载和转换。 如上配置告诉 `Webpack` 在遇到以 `.css `结尾的文件时先使用 `css-loader` 读取 `CSS` 文件，**再交给 style-loader 把 `CSS` 内容注入到 JavaScript 里。** 在配置 `Loader` 时需要注意的是：

+ `use` 属性的值需要是一个由` Loader` 名称组成的数组，`Loader` 的执行顺序是由后到前的；
+ 每一个 `Loader` 都可以通过 `URL querystring` 的方式传入参数，例如 `css-loader?minimize` 中的 `minimize` 告诉 `css-loader` 要开启 CSS 压缩。

在重新执行 `Webpack` 构建前要先安装新引入的 `Loader`：

```js
npm i -D style-loader css-loader
```

安装成功后重新执行构建时，你会发现 `bundle.js` 文件被更新了，里面注入了在 `main.css` 中写的 `CSS`，而不是会额外生成一个 `CSS` 文件。 但是重新刷新 `index.html` 网页时将会发现样式生效了！这其实都是 `style-loader` 的功劳，它的工作原理大概是把 `CSS` 内容用 `JavaScript` 里的字符串存储起来， 在网页执行 `JavaScript` 时通过 `DOM` 操作动态地往 `HTML head `标签里插入 `HTML style `标签。 也许你认为这样做会导致 `JavaScript` 文件变大并导致加载网页时间变长，想让 `Webpack` 单独输出 `CSS` 文件。可使用 `Webpack Plugin` 机制来实现。


还可以在源码中指定用什么 `Loader` 去处理文件。 以加载 `CSS` 文件为例，在 `main.js` 加上以下代码即可。

```js
require('style-loader!css-loader?minimize!./main.css');
// 指定对 ./main.css 这个文件先采用 css-loader 再采用 style-loader 转换。
```


#### 使用Plugin

`Plugin` 是用来扩展 `Webpack` 功能的，通过在构建流程里注入钩子实现，它给 `Webpack` 带来了很大的灵活性。

下例展示通过 `Plugin` 把注入到 `bundle.js` 文件里的 `CSS` 提取到单独的文件中。

安装插件：`npm i -D extract-text-webpack-plugin`

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  // JavaScript 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 把输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [
      {
        // 用正则去匹配要用该 loader 转换的 CSS 文件
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          // 转换 .css 文件需要使用的 Loader
          use: ['css-loader'],
        }),
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      // 从 .js 文件中提取出来的 .css 文件的名称
      filename: `[name]_[contenthash:8].css`,
    }),
  ]
};
```

重新构建，你会发现 `dist` 目录下多出一个 `main_1a87a56a.css` 文件，`bundle.js` 里也没有 `CSS` 代码了，再把该 `CSS` 文件引入到 `index.html` 里就完成了。

从以上代码可以看出， `Webpack` 是通过 `plugins` 属性来配置需要使用的插件列表的。 `plugins` 属性是一个数组，里面的每一项都是插件的一个实例，在实例化一个组件时可以通过构造函数传入这个组件支持的配置属性。

例如 `ExtractTextPlugin` 插件的作用是提取出 `JavaScript` 代码里的 `CSS` 到一个单独的文件。 对此你可以通过插件的 `filename`属性，告诉插件输出的 `CSS` 文件名称是通过 `[name]_[contenthash:8].css`字符串模版生成的，里面的 `[name]` 代表文件名称， `[contenthash:8]` 代表根据文件内容算出的8位 `hash` 值。


#### 使用 DevServer

前面只是让 `Webpack` 正常运行起来了，但在实际开发中你可能会需要：

+ 提供 `HTTP` 服务而不是使用本地文件预览；
+ 监听文件的变化并自动刷新网页，做到实时预览；
+ 支持 `Source Map`，以方便调试。

`Webpack` 原生支持上述第2、3点内容，再结合官方提供的开发工具 `DevServer` 也可以很方便地做到第1点。` DevServer `会启动一个 `HTTP` 服务器用于服务网页请求，同时会帮助启动` Webpack` ，并接收 `Webpack` 发出的文件更变信号，通过 `WebSocket` 协议自动刷新网页做到实时预览。

安装：`npm i -D webpack-dev-server`

安装成功后执行 `webpack-dev-server` 命令， `DevServer` 就启动了。

`DevServer` 启动的 `HTTP` 服务器监听在 `http://localhost:8080/ `（端口可以设置），`DevServer` 启动后会一直驻留在后台保持运行，访问这个网址你就能获取项目根目录下的 `index.html`。 用浏览器打开这个地址你会发现页面空白错误原因是 `./dist/bundle.js` 加载404了。 同时你会发现并没有文件输出到 `dist` 目录，**原因是 `DevServer` 会把 `Webpack` 构建出的文件保存在内存中**，在要访问输出的文件时，必须通过` HTTP `服务访问。 由于 `DevServer` 不会理会 `webpack.config.js` 里配置的 `output.path` 属性，所以要获取 `bundle.js` 的正确 `URL` 是 `http://localhost:8080/bundle.js`

所以在 `index.html` 中这样引入 `<script src="bundle.js"></script>` 而不是引入预料中打包后的`dist`文件下的`bundle.js`
##### 实时预览

`Webpack` 在启动时可以开启监听模式，开启监听模式后 `Webpack` 会监听本地文件系统的变化，发生变化时重新构建出新的结果。`Webpack` 默认是关闭监听模式的，你可以在启动 `Webpack` 时通过 `webpack --watch` 来开启监听模式。

通过 `DevServer` 启动的 `Webpack` 会开启监听模式，当发生变化时重新执行完构建后通知 `DevServer`。 `DevServer `会**让 `Webpack `在构建出的 `JavaScript` 代码里注入一个代理客户端用于控制网页**，网页和 `DevServer` 之间通过 `WebSocket` 协议通信， 以方便 `DevServer`主动向客户端发送命令。 `DevServer` 在收到来自 `Webpack` 的**文件变化通知时通过注入的客户端控制网页刷新。**

如果尝试修改 `index.html` 文件并保存，你会发现这并不会触发以上机制，导致这个问题的原因是 `Webpack` 在启动时会以配置里的 `entry` 为入口去递归解析出 `entry` 所依赖的文件，只有 `entry` 本身和依赖的文件才会被 `Webpack` 添加到监听列表里。 而 `index.html` 文件是脱离了` JavaScript` 模块化系统的，所以 `Webpack` 不知道它的存在。

##### 模块热替换

除了通过重新刷新整个网页来实现实时预览，`DevServer` 还有一种被称作模块热替换的刷新技术。 **模块热替换能做到在不重新加载整个网页的情况下，通过将被更新过的模块替换老的模块，再重新执行一次来实现实时预览。** 模块热替换相对于默认的刷新机制能提供更快的响应和更好的开发体验。 模块热替换默认是关闭的，要开启模块热替换，你只需在启动 `DevServer` 时带上 `--hot `参数。

##### 支持 Source Map

在浏览器中运行的 `JavaScript` 代码都是编译器输出的代码，你可能需要通过断点调试去找出问题。 在编译器输出的代码上进行断点调试是一件辛苦和不优雅的事情， 调试工具可以通过 `Source Map` 映射代码，让你在源代码上断点调试。 `Webpack` 支持生成 `Source Map`，只需在启动时带上 `--devtool source-map` 参数。

#### 核心概念

+ `Entry`：入口，`Webpack` 执行构建的第一步将从 `Entry` 开始，可抽象成输入。
+ `Module`：模块，在 `Webpack` 里一切皆模块，一个模块对应着一个文件。`Webpack` 会从配置的 `Entry`开始递归找出所有依赖的模块。
+ `Chunk`：代码块，一个 `Chunk` 由多个模块组合而成，用于代码合并与分割。
+ `Loader`：模块转换器，用于把模块原内容按照需求转换成新内容。
+ `Plugin`：扩展插件，在 `Webpack` 构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。
+ `Output`：输出结果，在 `Webpack` 经过一系列处理并得出最终想要的代码后输出结果。

`Webpack` 启动后会从 `Entry` 里配置的 `Module` 开始递归解析 `Entry` 依赖的所有 `Module`。 每找到一个 `Module`， 就会根据配置的 `Loader` 去找出对应的转换规则，对 `Module` 进行转换后，再解析出当前 `Module` 依赖的 `Module`。 这些模块会以 `Entry` 为单位进行分组，一个 `Entry` 和其所有依赖的 `Module` 被分到一个组也就是一个 `Chunk`。最后 `Webpack` 会把所有 `Chunk` 转换成文件输出。 在整个流程中 `Webpack` 会在恰当的时机执行 `Plugin` 里定义的逻辑。