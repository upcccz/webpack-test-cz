#### 工作原理概括

##### 基本概念

+ Entry：入口，Webpack执行构建的第一步将从Entry开始，可抽象成输入。
+ Module：模块，在Webpack里一切皆模块，一个模块对应一个文件。Webpack会从配置的Entry开始，递归找出所有依赖的模块。
+ Chunk：代码块，一个Chunk由多个模块组合而成，用于代码合并与分割。
+ Loader：模块转换器，用于将模块的原内容按照需求转换成新内容。
+ Plugin：扩展插件，在Webpack构建流程中的特定时机会广播对应的事件，插件可以监听这些事件的发生，在特定的时机做对应的事情。

##### 流程概括

1.初始化参数：从配置文件和Shell语句中读取与合并参数，得出最终的参数。
2.开始编译：用上一步得到的参数初始化Compiler对象，加载所有配置的插件，通过执行对象的run方法开始执行编译。
3.确定入口：根据配置中的entry找出所有入口文件。
4.编译模块：从入口文件触发，调用所有配置的Loader对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理。
5.完成模块编译：在经过第4步使用Loader翻译完所有模块后，得到了每个模块被翻译后的最终内容及它们之间的依赖关系。
6.输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的chunk，再将每个chunk转换成一个单独的文件加入输出列表中，这是可以修改输出的最后机会。
7.输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，将文件内容写入文件系统中。

在以上的过程中，webpack会在特定的时间点广播特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用webpack提供的API改变的webpack的运行结果。

##### 流程细节

webpack的构建流程可以分为以下三大阶段

###### 初始化

启动构建，读取与合并配置参数，加载Plugin，实例化Complier。

该阶段会发生的事件及解释如下

+ 初始化参数 -> 从配置文件和Shell 语句中读取与合并参数，得出最终的参数．在这个过程中还会执行配置文件中的插件实例化语句new Plugin()
+ 实例化Compiler -> 用上一步得到的参数初始化Compiler 实例， Compiler 负责文件监听和启动编译。在Compiler实例中包含了完整的Webpack 配置，全局只有一个Compiler 实例
+ 加载插件 -> 依次调用插件的apply 方法，让插件可以监听后续的所有事件节点．同时向插件传入compiler实例的引用，以方便插件通过compiler 调用Webpack 提供的API
+ environment -> 开始应用Node.js 风格的文件系统到compiler 对象，以方便后续的文件寻找和读取
+ entry-option -> 读取配置的Entry ，为每个Entry 实例化一个对应的EntryPlugin ，为后面该Entry 的递归解析工作做准备
+ after-plugins -> 调用完所有内置的和配置的插件的apply 方法
+ after-resolvers -> 根据配置初始化resolver, resolver 负责在文件系统中寻找指定路径的文件

###### 编译阶段

从Entry 发出，针对每个Module 串行调用对应的Loader 去翻译文件的内容，再找到该Module 依赖的Module ，递归地进行编译处理。

该阶段会发生的事件及解释如下

+ run -> 启动一次新的编译
+ watch-run -> 和run 类似，区别在于它是在监听模式下启动编译，在这个事件中可以获取是哪些文件发生了变化从而导致重新启动一次新的编译
+ compile -> 该事件是为了告诉插件一次新的编译将要启动，同时会给插件带上compiler 对象
+ compilation -> 当Webpack 以开发模式运行时，每当检测到文件的变化，便有一次新的Compilation 被创建。一个Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。Compilation对象也提供了很多事件回调给插件进行扩展
+ make -> 一个新的Compilation 创建完毕，即将从Entry 开始读取文件，根据文件的类型和配置的Loader对文件进行编译，编译完后再找出该文件依赖的文件，递归地编译和解析
+ after-compile -> 一次Compilation 执行完成
+ invalid -> 当遇到文件不存在、文件编译错误等异常时会触发该事件，该事件不会导致Webpack 退出

在编译阶段中，最重要的事件是compilation ，因为在compilation 阶段调用了Loader,完成了每个模块的转换操作。在compilation 阶段又会发生很多小事件，如下。

+ build-module -> 使用对应的Loader 去转换一个模块
+ normal-module-loader -> 在用Loader 转换完一个模块后，使用acorn 解析转换后的内容，输出对应的抽象语法树(AST ），以方便Webpack 在后面对代码进行分析
+ program -> 从配置的入口模块开始，分析其AST ，当遇到require等导入其他模块的语句时，便将其加入依赖的模块列表中，同时对新找出的依赖模块递归分析，最终弄清楚所有模块的依赖关系。
+ seal -> 所有模块及其依赖的模块都通过Loader 转换完成，根据依赖关系开始生成Chunk

###### 输出阶段

输出：将编译后的Module 组合成Chunk ，将Chunk 转换成文件，输出到文件系统中。

该阶段会发生的事件及解释如下

+ should-emit -> 所有需要输出的文件己经生成，询问插件有哪些文件需要输出， 有哪些不需要输出。
+ emit -> 确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出的内容。
+ after-emit -> 文件输出完毕
+ done -> 成功完成一次完整的编译和输出流程
+ failed -> 如果在编译和输出的流程中遇到异常，导致Webpack 退出， 就会直接跳转到本步骤，插件可以在本事件中获取具体的错误原因

在输出阶段己经得到了各个模块经过转换后的结果和其依赖关系，并且将相关模块组合在一起形成一个个Chunk 。在输出阶段会根据Chunk 的类型，使用对应的模板生成最终要要输出的文件内容。

#### 输出分析

最简单的项目构建出的bundle.js

```js
// main.js

// 通过 CommonJS 规范导入 show 函数
const show = require('./show.js');
// 执行 show 函数
show('Webpack');

// =====================================

// show.js
// 操作 DOM 元素，把 content 显示到网页上
function show(content) {
  window.document.getElementById('app').innerText = 'Hello,' + content;
}

// 通过 CommonJS 规范导出 show 函数
module.exports = show;

// =====================================

// webpack.config.js
const path = require('path');

module.exports = {
  // JS 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

```js
// bundle.js

// webpackBootstrap 启动函数
// modules 即存放所有模块的数组，数组中的每个元素都是一个函数
(function(modules) { 
    // 安装过的模块都存放在这里面
    // 作用是将己经加载过的模块缓存在内存中，提升性能
 	var installedModules = {};

    // 定义一个函数去加载模块
 	// moduleId 为要加载模块在数组中的index
    // 作用和Node. j s 中的require 语句相似
    // 因为在浏览器环境下不支持require语句

 	function __webpack_require__(moduleId) {

 		// 如果需要加载的模块己经被加载过，就直接从缓存中返回
        // exports 模块的到处的值
        // 当第一次加载的时候会定义
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// 如果缓存中不存在需要加载的模块，就新建一个模块，并将它存在缓存中
 		var module = installedModules[moduleId] = {
            // 模块在数组中的index
 			i: moduleId,
            //  该模块是否己经加载完毕 标识。第一次加载的模块，默认未完成。
 			l: false,
            //  该模块的导出值
 			exports: {}
 		};

 		// 从modules 中获取index 为moduleId 的模块对应的函数
        //  再调用这个函数，同时将函数需要的参数传入
        // @module 本次加载的模块
        // @module.exports 本次模块的到处值
        // @__webpack_require__ 加载函数即现在定义的这个函数本身（可能该模块中还需要加载别的模块）
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// 将这个模块标记为己加载
 		module.l = true;

 		// 返回这个模块的导出值
 		return module.exports;
 	}


 	// 暴露所有的模块，即传进来的模块数组
 	__webpack_require__.m = modules;

 	// 暴露模块缓存输出
 	__webpack_require__.c = installedModules;

 	// 定义函数，用于为导出的对象的属性设置getter函数
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};

    // 如果模块存在且是es6模式的导出形式 即对应的导出export default = {} / export a = {}时
    // 读取的时候 getter 返回 模块的defalut属性（默认导出值） 因为es6 允许 export defalut 与 export ** 共存
    // 否则，即对应的导出形式是CommonJS的 为 module.exports对象 其中exports对象相当于是module.exports的浅拷贝
    // 读取的时候 getter 返回 整个模块 只有一个导出值

 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};

 	// 定义函数用于检查属性是否是本身的 而不是继承的
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

 	// Webpack 配置中的publicPath ，用于加载被分割出去的异步代码
 	__webpack_require__.p = "";

 	// 使用webpack require 去加载index 为0 的模块，并且返回该模块导出的内容
    // index 为0 的模块就是main.js对应的文件，也就是执行入口模块
    // __webpack_require__.s 的含义是启动模块对应的index
 	return __webpack_require__(__webpack_require__.s = 0);
 })
//  modules 参数列表 实参
([
    /* 0 */
    (function(module, exports, __webpack_require__) {

        // 通过 CommonJS 规范导入 show 函数
        const show = __webpack_require__(1);
        // 执行 show 函数
        show('Webpack');

    /***/ }),
    /* 1 */
    (function(module, exports) {

        // 操作 DOM 元素，把 content 显示到网页上
        function show(content) {
            window.document.getElementById('app').innerText = 'Hello,' + content;
        }

        // 通过 CommonJS 规范导出 show 函数
        module.exports = show;

    /***/ })
]);

```

简单的来说，整个代码为

```js
// 立即执行函数
(
    function(modules){
        // 模拟require语句
        function __webpack_require__() {}

        // 执行存放所有模块数组中的第0 个模块 即入口模块
        __webpack_require__(0);
    }([/*存放所有模块的数组*/])
)
```

bundle.js 能直接运行在浏览器中的原因是，在输出的文件中通过__webpack_require__函数，定义了一个可以在浏览器中执行的加载函数，来模拟 Node.js 中的require语句。

#### 当使用代码分割时的输出分析

```js
// main.js

// 异步加载show.js
// 使用import异步加载返回一个promise 其中resolve的参数就是导出值
import('./show.js').then((show) => {
    // 执行show函数
    show('webpack');
})

// =====================================

// show.js
// 操作 DOM 元素，把 content 显示到网页上
function show(content) {
  window.document.getElementById('app').innerText = 'Hello,' + content;
}

// 通过 CommonJS 规范导出 show 函数
module.exports = show;

// =====================================

// webpack.config.js
const path = require('path');

module.exports = {
  // JS 执行入口文件
  entry: './main.js',
  output: {
    // 把所有依赖的模块合并输出到一个 bundle.js 文件
    filename: 'bundle.js',
    // 输出文件都放到 dist 目录下
    path: path.resolve(__dirname, './dist'),
  }
};
```

打包之后，会输出两个文件，bundle.js 和 异步加载的文件 0.bundle.js，其中0.bundle.js的内容如下：

```js
// 加载本文件(0.bundle.js)中包含的模块

// 第一个参数：Array 在其他文件中存放的模块的ID，即别的文件通过什么方式引入0.bundle.js
// 第二个参数：Array 本文件所包含的模块

webpackJsonp([0],[
    // show.js对应的模块
    (function(module, exports){
        function show(content) {
            window.document.getElementById('app').innerText = 'Hello,' + content;
        }
        module.exports = show;
    })
])

```
其中bundle.js内容如下

```js
(function(modules) {
 	var parentJsonpFunction = window["webpackJsonp"];
      /***
        * webpackJsonp 用于从异步加载的文件中安装模块。
        * 将webpackJsonp 挂载到全局是为了方便在其他文件中调用。
        * ＠ param chunkids 异步加载的文件中存放的需要安装的模块对应的Chunk ID
        * ＠ param moreModules 异步加载的文件中存放的需要安装的模块列表
        * ＠ param executeModules 在异步加载的文件中存放的需要安装的模块都安装成功后，需要执行的模块对应的index
        */
 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
 		// 将moreModules 添加到modules 对象中 -> 本文件所需的模块
 		// 将所有chunkIds 对应的模块都标记成己经加载成功
 		var moduleId;
        var chunkId;
        var i = 0;
        var resolves = []; // 所有已加载的模块的resolve方法
        var result;

        // 缓存已安装的模块
        var installedModules = {};

        // 存储每个Chunk 的加载状态：键为Chunk 的ID ，值为0 代表己经加载成功
        var installedChunks = {
            1: 0
        };

        // 循坏所有本文件所需要安装的模块ID
        // 如果模块未加载 不为0 就直接将该模块的resolve回调统一放到一个数组中，等到加载成功后直接执行。
        // 如果已加载，将模块标记为加载成功。
 		for(;i < chunkIds.length; i++) {
 			chunkId = chunkIds[i];
 			if(installedChunks[chunkId]) {
 				resolves.push(installedChunks[chunkId][0]);
 			}
 			installedChunks[chunkId] = 0;
 		}

        //  for in 本文件所有需要安装的模块 并将其添加到 modules中，供之后使用
 		for(moduleId in moreModules) {
 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
 				modules[moduleId] = moreModules[moduleId];
 			}
 		}

        // 如果window.webpackJsonp存在，则直接调用
 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);

        // 调用所有resolve回调
 		while(resolves.length) {
 			resolves.shift()();
 		}

 	};

    // 同上 模拟require方法

 	function __webpack_require__(moduleId) {

 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}

 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};

 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		module.l = true;

 		return module.exports;
 	}

 	// 用于加载被分割出去的需要异步加载的Chunk 对应的文件
 	// @param chunkId 需要异步加载的Chunk 对应的ID
    // @return {Promise}

 	__webpack_require__.e = function requireEnsure(chunkId) {
        // 获取该需要异步加载是否存在于已加载数组中
 		var installedChunkData = installedChunks[chunkId];

        // === 0 说明 已加载 直接返回 Promise对象 并直接执行resolve 如果外部定义有then成功回调，则直接被触发
 		if(installedChunkData === 0) {
 			return new Promise(function(resolve) { resolve(); });
 		}

        // installedChunkData 不为空且不为0 时，表示该Chunk 正在网络加裁中
 		if(installedChunkData) {
            // 返回存放在installedChunkData 数组中的Promise 对象
            // 下方有定义installedChunkData[0] -> resolve
            // installedChunkData[1] -> reject
            // installedChunkData[2] -> [resolve, reject]
            // 并且定义了installedChunks
            // 上方resolves.push的是installedChunks[chunkId][0] 即resolve
 			return installedChunkData[2];
 		}

 		// installedChunkData 为空，表示该Chunk 还没有加载过，去加载该Chunk 对应的文件

        // 先为该文件以Promise存储在状态数组中
 		var promise = new Promise(function(resolve, reject) {
 			installedChunkData = installedChunks[chunkId] = [resolve, reject]; 
 		});

 		installedChunkData[2] = promise;

 		// 通过DOM操作网HEAD中插入script标签，去异步加载chunk 对应的文件
 		var head = document.getElementsByTagName('head')[0];
 		var script = document.createElement('script');
 		script.type = "text/javascript";
 		script.charset = 'utf-8';
 		script.async = true;
 		script.timeout = 120000;

 		if (__webpack_require__.nc) {
 			script.setAttribute("nonce", __webpack_require__.nc);
 		}
        // 文件的路径由配置的publicPath 、chunkid 拼接而成
        // 在这里即'./0.bundle.js'
 		script.src = __webpack_require__.p + "" + chunkId + ".bundle.js";
        
        // 设置异步加载的最长超时时间
 		var timeout = setTimeout(onScriptComplete, 120000);
 		script.onerror = script.onload = onScriptComplete;

        // 在script 加载和执行完成时回调 
 		function onScriptComplete() {
             
            // 防止内存泄漏
 			script.onerror = script.onload = null;
 			clearTimeout(timeout);

            // 去检查chunkid 对应的Chunk 是否安装成功，安装成功时才会存在于 installedChunks 中
 			var chunk = installedChunks[chunkId];
            // 未安装成功，即抛出错误
 			if(chunk !== 0) {
                //  不为0且不为空 时，表示该Chunk 正在网络加裁中，但是加载失败了
 				if(chunk) {
 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
 				}
                //  为空时，代表未加载，置为undefined
 				installedChunks[chunkId] = undefined;
 			}
 		};
 		head.appendChild(script);

 		return promise;
 	};

 	// 暴露所有的模块对象 从moreModules复制的modules
 	__webpack_require__.m = modules;

 	// 暴露已缓存的模块数组
 	__webpack_require__.c = installedModules;

 	// 定义getter函数 为exports 
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};

 	// 根据不同情况 返回不同的导出值取值
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};

 	// 定义检查属性是否属于自身函数
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

 	// 配置的publicPath 
 	__webpack_require__.p = "";

 	// 定义抛出错误函数
 	__webpack_require__.oe = function(err) { console.error(err); throw err; };

 	// ／加载并执行入口模块，和上面介绍的一致
 	return __webpack_require__(__webpack_require__.s = 0);
})
([
    /* 0 */  // main.js 对应的模块
    (function(module, exports, __webpack_require__) {
        // 异步加载 show.js对应的chunk 
        __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 1)).then((show) => {
            // 执行 show 函数
            show('Webpack');
        });
    })
]);
```

多了一个webpack.require.e ，用于加载被分割出去的需要异步加载的Chunk对应的文件。
多了一个webpackJsonp 函数，用于从异步加载的文件中安装模块。

使用CommonsChunkPJugin 提取公共代码时输出的文件和使用异步加载时输出的文件是一样的，都会有webpack.require.e 和webpackJsonp 。原因在于提取公共代码和异步加载在本质上都是代码分割。

