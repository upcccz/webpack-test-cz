####Loader

一个Loader的职责是单一的，只需要完成一种转换。如果一个源文件需要经历多步转换才能正常使用，就通过多个Loader去转换。在调用多个Loader去转换一个文件时，每个Loader都会链式地顺序执行。第1个Loader将会拿到需处理的内容，上一个Loader处理后的结果会被传给下一个Loader接着处理，最后的Loader将处理后的最终结果返回给Webpack。所以，在开发一个Loader时，请保持其职责的单一性，我们只需关心输入和输出。

Webpack是运行在Node.js上的，一个Loader其实就是一个Node.js模块，这个模块需要导出一个函数。这个导出的函数的工作就是获得处理前的原内容，对原内容执行处理后，返回处理后的内容。

```js
// 最基本的结构
// Loader运行在Node.js中，所以可以调用任何Node.js的API
const sass = require('sass');

module.exports = function (source) {
	// source 为compiler 传递给Loader 的一个文件的原内容
	return sass(source)
}
```

##### 关于获取Loader的options

```js
// 借助loader-utils

const loaderUtils = require('loader-utils');

module.exports = function (source) {
	// 获取用户为当前Loader 传入的options
	const options = loaderUtils.getOptions(this);
	return source
}
```

上面的Loader 都只是返回了原内容转换后的内容，但在某些场景下还需要返回除了内容之外的东西。

以用babel-loader 转换ES6 代码为例，它还需要输出转换后的ES5 代码对应的SourceMap ，以方便调试源码。为了将Source Map 也一起随着ES5 代码返回给Webpack ，还可以这样写：

```js
module.exports = function (source) {
	// 通过this.callback告诉webpack 返回的结果
	this.callback(null, source, sourceMaps);

	// 当使用this.callback返回内容时，该Loader必须返回undefined
	// 以让Webpack知道该Loader返回的结果在this.callback中，而不是return中
	return;

	// 其中this.callback 是 webpack 向Loader中注入的API，以方便Loader和webpack之间的通信。
}
```

this.callback的详细使用方法，即可以接受那些内容从Loader中传到webpack

```js
this.callback(
	// 当无法转换原内容时，为Webpack 返回一个Error
	err: Error | null,
	// 原内容转换后的内容
	content: string | Buffer,
	// 可选，用于通过转换后的内容得出原内容的Source Map ，以方便调试
	// webpack 会通过 this.sourceMap API 告诉Loader用户是否配置需要sourceMap
	sourceMap?: SourceMap,
	// 如果本次转换为原内容生成了AST 语法树，则可以将这个AST 返回，
	// 以方便之后需要AST 的Loader 复用该AST ，避免重复生成AST ，提升性能
	abstractSyntaxTree?: AST 
)
```


##### 同步与异步

Loader 有同步和异步之分，上面介绍的L oader 都是同步的Loader ，因为它们的转换流程都是同步的，转换完成后再返回结果。但在某些场景下转换的步骤只能是异步完成的，例如我们需要通过网络请求才能得出结果，如果采用同步的方式，则网络请求会阻塞整个构建，导致构建非常缓慢。

如果是异步转换，则我们可以这样做：

```js
module.exports = function(source) {
	// 告诉Webpack 本次转换是异步的， Loader 会在callback 中回调结果
	var callback = this.async();

	// 异步操作函数
	function someAsyncOperation(source, cb) {
		var err, result, sourceMaps, ast;

		// 模拟异步
		new Promise((res, rej) => {
			resolve();
		}).then(res => {
			// ...异步操作成功后 将正确处理过需要返回的值返回
			cb(err, result, sourceMaps, ast)
		})
	}

	someAsyncOperation(source, function(err, result, sourceMaps, ast){
		// 通过callback 返回异步执行后的结果
		callback(err, result, sourceMaps, ast)
	})
}
```

##### 处理二进制数据

在默认情况下， Webpack 传给Loader 的原内容都是UTF-8 格式编码的字符串。但在某些场景下Loader 不会处理文本文件，而会处理二进制文件如fil e-loader ，这时就需要Webpack为Loader 传入二进制格式的数据。为此，我们需要这样编写Loader:

```js
module.exports = function(source) {
	console.log(source instanceof Buffer);
	// true , webpack 传进来的source会是二进制数据

	// 但是不管module.exports.raw 是不是 true ，Loader都可以返回二进制数据
	return source
}

// 通过exports.raw 属性告诉Webpack 该Loader 是否需要二进制数据
// 如果没有这一行 则Loader只能拿到字符串
module.exports.raw = true;
```

##### 缓存加速

在某些情况下，有些转换操作需要大量的计算，非常耗时，如果每次构建都重新执行重复的转换操作，则构建将会变得非常缓慢。为此，Webpack会默认缓存所有Loader的处理结果，也就是说在需要被处理的文件或者其依赖的文件没有发生变化时，是不会重新调用对应的Loader去执行转换操作的。

```js
// 如果我们不想让Webpack 不缓存该Loader 的处理结果，则可以这样：

module.exports = function(source) {
	// 关闭该Loader 的缓存功能
	this.cacheable(false);
	return source
}
```

##### 其他Loader API

在Loader中还可以使用以下API

+ this.context：当前处理的文件所在的目录，假如当前Loader处理的文件是/src/main.js，则this.context等于/src。

+ this.resource：当前处理的文件的完整请求路径，包括querystring，例如／src/main.js?name=l。

+ this.resourcePath：当前处理的文件的路径，例如／src/main.js。

+ this.resourceQuery ：当前处理的文件的querystring

+ this.target：等于Webpack 配置中的Target

+ this.loadModule: 当Loader在处理一个文件时，如果依赖其他文件的处理结果才能得出当前文件的结果，就可以通过this.loadModule(request:string,callback:function(err,source,sourceMap,module））去获取request对应的文件的处理结果。

+ this.resolve：像require语句一样获得指定文件的完整路径，使用方法为resolve(context:string, request:string, callback:function(err,result:string））。

+ this.addDependency(file:string) : 为当前处理的文件添加其依赖的文件，以便其依赖的文件发生发生变化时，重新调用Loader 处理该文件

+ this.addContextDependency(file: string) : 同上，是将整个目录加入当前正在处理的文件的依赖中，以便其依赖的文件发生发生变化时，重新调用Loader 处理该目录下的文件。

+ this.clearDependencies ：清除当前正在处理的文件的所有依赖

+ this.emitFile ：输出一个文件，使用方法为emitFile(name : string ,content: Buffer | string , sourceMap: { ... ｝）。


##### 加载本地Loader 

如果向采用第三方loader的方式去使用本地开发的Loader，将会很麻烦，因为我们需要确保编写的Loader 的源码在node_modules 目录下。为此需要先将编写的Loader 发布到Npm仓库， 再安装到本地项目中使用。

有两种方法，可以解决上述问题，不需要加本地loader发布到Npm中

**Npm link**

Npm link 专门用于开发和调试本地的Npm 模块，能做到在不发布模块的情况下， 将本地的一个正在开发的模块的源码链接到项目的node_modules 目录下，让项目可以直接使用本地的Npm 模块。由于是通过软链接的方式实现的，编辑了本地的Npm 模块的代码，所以在项目中也能使用到编辑后的代码。

1.确保正在开发的本地Npm 模块（也就是正在开发的Loader ） 的package.json 已经正确配置好。
2.在**本地的Npm 模块根目录下**执行npm link ，将本地模块注册到全局。
3.在**项目根目录下执行**npm link loader-name ，将第2步注册到全局的本地Npm模块链接到项目的node_moduels 下，其中的loader-name 是指在第1步的package.json文件中配置的模块名称。

**Resolveloader**

配置resolveLoader，配置如何寻找Loader，默认回去node_modules中寻找。

```js
module.exports = {
	resolveLoader: {
		// 去哪些目录下寻找Loader 有先后之分，先去node_modules中找，找不到再去./loader/目录中寻找。
		modules: ['node_modules', './loaders/']
	}
}
```

#### Plugin

在Webpack 运行的生命周期中会广播许多事件， Plugin 可以监昕这些事件，在合适的时机通过Webpack 提供的API改变输出结果。

一个最基础的Plugin代码如下：

```js
class BasicPlugin {
	// 在构造函数中获取用户为该插件传入的配置
	constructor(options) {
		this.options = options
	},
	// Webpack会调用BasicPlugin实例的apply方法为插件实例传入compiler对象
	apply(compiler) {
		compiler.plugin('compilation', function(compilation){
			// ... 监听到compilation事件后的一系列操作
		})
	}
}

// 导出
module.exports = BasicPlugin;
```

在webpack的配置中这样使用

```js
const BasicPlugin = require('./BasicPlugin.js');
module.exports = {
	Plugins: [
		new BasicPlugin(options),
	]
}
```

Webpack启动后，在读取配置的过程中会先执行new BasicPlugin(options），初始化一个BasicPlugin并获得其实例。在初始化compiler对象后，再调用basicPlugin.apply(compiler）为插件实例传入compiler对象。插件实例在获取到compiler对象后，就可以通过compiler.plugin（事件名称，回调函数）监听到Webpack广播的事件，并且可以通过compiler对象去操作Webpack。

##### Compiler 和 Compilation

Compiler 对象包含了Webpack 环境的所有配置信息，包含options 、loaders 、plugins等信息。这个对象在Webpack 启动时被实例化，它是全局唯一的，可以简单地将它理解为Webpack 实例。

Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。当Webpack以开发模式运行时，每当检测到一个文件发生变化，便有一次新的Compilation 被创建。Compilation 对象也提供了很多事件回调供插件进行扩展。通过Compilation也能读取到Compiler 对象。

Compiler 和Compilation 的区别在于： Compiler 代表了整个Webpack 从启动到关闭的生命周期，而Compilation 只代表一次新的编译。

##### 事件流

使用了观察者模式，插件中进行订阅，webpack进行发布（开发的插件中也能发布其他事件）。

```js
// 发布
compiler.apply('event-name', params);

// 插件中订阅的事件回调就会被调用
compiler.plugin('event-name', function(params){
	// 监听到了事件的发布 该回调就会调用。
})
```

只要能拿到Compiler 或Compilation 对象，就能广播新的事件，所以在新开发的插件中也能广播事件，为其他插件监听使用。传给每个插件的Compiler 和Compilation 对象都是同一个引用。也就是说，若在一个插件中修改了Compiler或Compilation 对象上的属性，就会影响到后面的插件。有些事件是异步的，这些异步的事件会附带两个参数，第2个参数为回调函数，在插件处理完任务时需要调用回调函数通知Webpack，才会进入下一个处理流程。

```js
compiler.plugin('emit', function(compilation, callback){
	// 处理完毕后执行callback 以通知Webpack
	// 如果不执行callback ，运行流程将会一直卡在这里而不往后执行
	callback();
})
```

#### 常用API

##### 读取输出资源、代码块、模块及其依赖

emit 事件发生时，代表源文件的转换和组装己经完成，在这里可以读取到最终将输出的资源、代码块、模块及其依赖，并且可以修改输出资源的内容。插件的代码如下：

```js
class Plugin {
	constructor() {

	},
	apply(complier) {
		complier.plugin('emit', function(compilation, callback){
			// compilation.chunks : Array 存放所有代码块
			compilation.chunks.forEach(function(chunk) {
				// chunk就是chunks数组中每一个单独代码块
				// 而chunk本身又是由很多个Modules组成的，所以也是一个Array
				// 可以使用forEachModule来遍历
				chunk.forEachModule(function (module) {
					// module就是chunk中每一个单独的模块
					// module.fileDependencies 存放当前模块的所有依赖的文件路径，是一个数组
					module.fileDependencies.forEach(function(filePath){
						// filePath 就是 module中每一个依赖文件的路径
					})
				})

				// Webpack 会根据Chunk 生成输出的文件资源，每个Chunk 都对应一个及以上的输出文件
				// 例如在chunk 中包含css 模块并且使用了ExtractTextPlugin 时
				// 该chunk 就会生成.js 和 .css 两个文件
				// chunk.files 就是该chunk将要输出的文件名称组成的数组
				chunk.files.forEach(function(filename){
					// compilation.assets 存放着当前即将输出的所有资源
					// 通过该文件名在compilation.assets中获取当前输出资源，调用一个输出资源的source()方法能获取输出资源的内容
					let source = compilation.assets[filename].source();
				})
			})
			// 这是一个异步事件，要记得调用callback 来通知Webpack 本次事件监听处理结束
			callback();
		})
	}
}
```

##### 监听文件的变化

Webpack 会从配置的入口模块出发，依次找出所有依赖模块， 当入口模块或者其依赖的模块发生变化时， 就会触发一次新的Compilation 。

在开发插件时经常需要知道是哪个文件发生的变化导致了新的Compilation，可以监听watch-run事件，当依赖的文件发生变化时会被触发。

```js
compiler.plugin('watch-run', function(watching, callback){
	// 获取发生变化的文件列表
	const changedFiles = watching.compiler.watchFileSystem.watcher.mtimes;
	// changedFiles 格式为键值对，键为发生变化的文件路径
	if (changedFiles['./show.js'] !== undefined) {
		// show.js 发生了变化
	}
	// 异步事件
	callback();
})
```

Webpack 只会监视入口和其依赖的模块是否发生了变化，所以Webpack 不会监听HTML 文件的变化，编辑HTML 文件时就不会重新触发新的Compilation。某些情况下会需要监听HTML的变化，这时候可以将HTML 文件加入依赖列表中，为此可以使用如下代码：

```js
// after-compile 会在一次Compilation 执行完成
comper.plugin('after-compile', (compilation, callback) => {
	// 将HTML 文件添加到文件依赖列表中，因此在HTML 模板文件发生变化时重新启动一次编译
	compilation.fileDependencies.push('./test.html');
	callback();
})
```
##### 修改输出资源

在某些场景下插件需要修改、增加、删除输出的资源，要做到这一点， 则需要监听emit事件，因为发生emit 事件时所有模块的转换和代码块对应的文件已经生成好，需要输出的资源即将输出，因此emit 事件是修改Webpack 输出资源的最后时机。

上面已提到过 compilation.assets存放着当前即将输出的所有资源，是一个键值对，键为需要输出的文件名称，值为文件对应的内容。

```js
// 修改输出文件
compiler.plugin('emit', (compilation, callback) => {
	// 设置名称为fileName 的输出资源
	compilation.assets[fileName] = {
		// source()用来输出文件内容，在source方法中对文件进行修改并输出
		source: () => {
			// 文件内容 既可以是代表文本文件的字符串，也可以是代表二进制文件的Buffer
			return fileContent;
		},
		// 返回文件的大小
		size: () => {
			return Buffer.byteLength(fileContent, 'utf8');
		}
	}
	callback();
})

// 读取输出文件
compiler.plugin('emit', (compilation, callback) => {
	// 读取名称为fileName 的输出资源
	const asset = compiler.assets[fileName];
	// 获取输出的内容
	asset.source();
	// 获取输出资源的大小
	asset.size();
	callback();
})
```

##### 判断Webpack 使用了哪些插件

在开发一个插件时，我们可能需要根据当前配置是否使用了其他插件来做下一步决定，因此需要读取Webpack 当前的插件配置情况。比如，若想判断当前是否使用了ExtractTextPlugin

```js
function hasExtractTextPlugin(compiler) {
	// 当前配置使用的所有插件列表
	const plugins = compiler.options.plugins;

	return plugins.find(plugin => {
		// 去plugins 中寻找有没有ExtractTextPlugin 的实例
		plugin.__proto__.constructor === ExtractTextPlugin
	}) != null;
}
```

##### 写一个简单至极的插件

该插件的名称为EndWebpackPlugin ，作用是在Webpack 即将退出时 针对构建成功还是构建失败 附加一些额外的操作。

```js
// 如何使用 
module.exports = {
	Plugins: [
		// 在初始化的时候，传入两个参数，分别会成功回调和失败回调
		new EndWebpackPlugin(() => {
			// Webpack 构建成功，并且在文件输出后会执行到这里，在这里可以做发布文件操作
		}, (err) => {
			// Webpack 构建失败， err 是导致错误的原因
			console.log(err);
		})
	]
}
```

```js
// 插件代码

class EndWebpackPlugin {
	constructor(doneCb, failCb) {
		this.doneCb = doneCb;
		this.failCb = failCb;
	},
	apply(compiler) {
		compiler.plugin('done', function(stats){
			// 监听webpack 的 done 事件，回调doneCb
			this.doneCb(stats)
		})

		compiler.plugin('failed', function(err){
			// 监听webpack 的 done 事件，回调doneCb
			this.failCb(err)
		})
	}
}

module.exports = EndWebpackPlugin;
```