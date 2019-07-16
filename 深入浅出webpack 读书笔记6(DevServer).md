#### Plugin

`Plugin` 用于扩展 `Webpack` 的功能 ， 各种各样的 `Plugin` 几乎可以让 `Webpack` 做任何与构建相关的事情。使用 `Plugin` 的难点在于掌握 `Plugin`本身提供的配置项 ，而不是如何在 `Webpack` 中接入 `Plugin`。

 `Plugin`的配置很简单， `plugins`配置项接收一个数组，数组里的每一项都是一个要使用 的 `Plugin` 的实例， `Plugin` 需要的参数通过构造函数传入 。

```js
const CommonsChunkPlugin =require('webpack/lib/optimize/CommonsChunkPlugin');

module.exports = {
  plugins: [
    new CommonsChunkPlugin({
      name: 'common',
      // 可以是存在的chunk （entry chunk） 否则会创建name为common的chunk进行合并公共代码
      chunks: ['a', 'b']
      // 指定从哪些chunk当中去找公共模块，省略该选项的时候，默认就是entry chunks
    })
  ]
}

```

#### DevServer

要配置 `DevServer`，除了可以在配置文件里通过 `devServer` 传入参数，还可以通过命令行参数传入。注意，只有在通过 `DevServer`启动 `Webpack`时，配置文件里的 `devServer` 才会生效，因为这些参数所对应的功能都是 `DevServer`提供的 ，`Webpack` 本身并不认识 `devServer` 配置项。


##### hot

`devServer.hot` 配置是否启用模块热替换功能。 `DevServer` 的默认行为是在发现源代码被更新后通过**自动刷新整个页面**来做到实时预览，开启模块热替换功能后，将在**不刷新整个页面的情况下通过用新模块替换老模块来做到实时预览** 。

##### historyApiFallback

当使用 `HTML5 History API` 时，任意的 404 响应都可能需要被替代为 `index.html`。`devServer.historyApiFallback` 默认禁用。通过传入以下启用：

```js
module.exports = {
  //...
  devServer: {
    historyApiFallback: true
  }
};
```

如果我们的应用由多个单页应用组成且使用`HTML5 History API` 时 ，则需通过传入一个对象，比如使用 `rewrites` 这个选项，此行为可进一步地控制：

```js
module.exports = {
  //...
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/views/landing.html' },
        { from: /^\/subpage/, to: '/views/subpage.html' },
        { from: /./, to: '/views/404.html' } 
        // 除上面两个都返回外都返回404页面
      ]
    }
  }
};
```

##### contentBase

`devServer.contentBase`配置 `DevServerHTTP`服务器的文件根目录。在默认情况下为当前的执行目录，通常是项目根目录，所以在一般情况下不必设置它，除非有额外的文件需要被 `DevServer`服务。 例如，若想将项目根目录下的 `public` 目录设置成 `DevServer`服务器 的文件根目录，则可以这样配置。

```js
devServer:{
  contentBase : path.join(__dirname, 'public')
}
```

`DevServer`服务器通过 `HTTP` 服务暴露文件 的方式可分为两类 :第一类，暴露 `Webpack` 构建出的结果，由于构建出的结果交给了 `DevServer`，所以我们在使用 `DevServer` 时，会在本地找不到构建出的文件。第二类就是暴露本地文件，`contentBase` 就是用配置暴露本地文件规则的，也可以设置`false`来关闭。

##### headers

`devServer.headers` 配置项可以在 `HTTP` 响应中注入 一些 `HTTP` **响应头**。

```js
devServer: { 
  headers: {
    'X-foo':'bar'
  }
}
```

##### host port allowedHosts

`devServer.host` 配置项用于配置 `DevServer`服务监听的地址，`devServer.host` 配置项用于配置 `DevServer` 服务监听的端口。

`devServer.allowedHosts` 配置一个白名单列表，只有 **`HTTP`请求** 的 `HOST` 在列表里才正常返回，使用如下:

```js
allowedHosts: [ 
  // 匹配单个域名
  'host. com',
  'sub.host.com',
  // host2.com 和所有的子域名 *.host2.com 都将匹配
  '.host2.com'
]
```

##### https


`DevServer`默认使用`HTTP`服务， 它也能使用`HTTPS`服务。在某些情况下我们必须使用 `HTTPS`，例如`HTTP2`和`ServiceWorker`就必须运行在`HTTPS`上。要切换成 `HTTPS`服务，最简单的方式是:

```js
devServer: {
  // 会自动为我们生成一份 HTTPS 证书。
  https : true
  // 如果我们想用自己的证书， 则可 以这样配置 :
  https: {
    key: fs.readFileSync('path/to/server.key'), 
    cert: fs.readFileSync ('path/to/server.crt') , 
    ca: fs.readFileSync ('path/to/ca.pem')
  }
}
```

##### open

`devServer.open` 用于在 `DevServer` 启动且第一次构建完时，自动用我们的系统的默认浏览器去打开要开发的网页 。还提供了 `devServer.openPage` 配置项来打开指定`URL`的网页 。

##### before

在服务内部的所有其他中间件之前， 提供执行自定义中间件的功能。 这可以用来配置自定义处理程序，例如: 在后端接口没写好前本地开发调试拦截请求返回mock数据

```js
module.exports = {
  //...
  devServer: {
    before: function(app, server) {
      app.get('/some/path', function(req, res) {
        res.json({ custom: 'response' });
      });
    }
  }
};
```

#### 其他配置项

##### target

`JavaScript` 的应用场景越来越多，从浏览器到 `Node.js`，这些运行在不同环境中的 `JavaScript` 代码存在一些差异。 `target`配置项可以让 `Webpack`构建出针对不同运行环境的代码。
默认值为`'web'`，还有`'node'` `'async-node'` `'webworker'`` 'electron-main'` `'electron-renderer'`

##### Devtool

`devtool` 配置 `Webpack `如何生成 `Source Map`， 默认值是 `false`，即不生成 `Source Map`，若想为构建出的代码生成 `SourceMap` 以方便调试，则可以这样配置: `devtool: 'source-map'`。

##### Watch 和 WatchOptions

`Webpack`支持监听文件更新，在文件发生变化时重新编译。 在使用 `Webpack` 时 ，监听模式默认是关闭的 （在使用`devServer`时默认是开启的），`watchOptions` 配置项用来更灵活地控制监听模式。

```js
module.exports = {
  //只有在开启监听模式时， watchOptions 才有意义
  watch: true,
  watchOptions: {
    //不监听的文件或文件夹，支持正则匹配
    //默认为空
    ignored: /node_modules/,
    //监听到变化后会等 300ms 再去执行动作，防止文件更新太快导致重新编译频率太高 
    //默认为 300ms
    aggregateTimeout: 300,
    //默认每秒询问1000次系统（轮询），用来确定指定文件有没有变化 
    poll: 1000
  }
}
```

##### Externals

`Externals` 用来告诉在 `Webpack` 要构建的代码中使用了哪些不用被打包的模块，也就是说这些模板是外部环境提供的， `Webpack`在打包时可以忽略它们。

例如在我们的 `HTML HEAD` 标签里通过以下代码引入 `jQuery`:
```html
<script src="path/to/jquery.js"></script>
```

如果想在使用模块化的源代码里导入和使用 `jQuery`，则可能 需要这样:

```js
import $ from 'jquery');
$('.my-element');
```

构建后我们会发现输出的 `Chunk` 里包含的 `jQuery` 库的内容，这导致 `jQuery` 库出现了两次，通过 `externals` 可以告诉 `Webpack` 在 `JavaScript` 运行环境中**已经内置了哪些全局变量，不用将这些全局变量打包到代码中而是直接使用它们。**

```js

module.exports = { 
  externals : {
    //将导入语句里的 jquery 替换成运行环境里的全局变量 jQuery !!!
    jquery : 'jQuery'
  }
}
```

##### Resolveloader

`ResolveLoader` 用来告诉 `Webpack` 如何去寻找 `Loader`，因为在使用 `Loader`时是通过其包名称去引用的，`Webpack` 需要根据配置的 `Loader` 包名去找到 `Loader` 的实际代码，以调用`Loader`去处理源文件。

```js
module.exports = { 
  resolveLoader:{
    // 去哪个目录下寻找 Loader 
    modules: ['node_modules'] ,
    // 入口文件的后缀
    extensions : ['.js', '.json'] , 
    // 指明入口文件位置的字段 
    mainFields: ['loader', 'main']
  }
}
// 该配置项常用于加载本地的 Loader
```