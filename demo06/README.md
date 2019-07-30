#### devServer

DevServer 是一个方便开发的小型HTTP 服务器， DevServer 其实是基于webpack-dev-middleware实现的，而webpack-dev-middleware 其实是Expressjs 的一个中间件。


##### server.js

Webpack API 导出的webpack 函数会返回一个Compiler 实例。

从webpack-dev-middleware 中导出的webpackMiddleware是一个函数，该函数需要接收一个Compiler 实例，并返回一个Expressjs 的中间件

**webpackMiddleware的作用**

+ 接收来自Webpack Compiler 实例输出的文件，但不会将文件输出到硬盘中，而会保存在内存中。

+ 在ExpressJs app 上注册路由，拦截HTTP 收到的请求，根据请求路径响应对应的文件内容。

**webpackMiddleware的配置项**

```js
// webpackMiddleware 函数的第2 个参数为配置项
app .use(webpackMiddleware(compiler , {
    // 在webpack-dev-middleware 支持的所有配置项中
    // publicPath 属性为必填项，其他都是选填项

    // Webpack 输出资源绑定HTTP 服务器上的根目录，
    //和Webpack 配置中的publicPath 含义一致
    publicPath :'/assets/',

    //不输出info 类型的日志到控制台，只输出warn 和error 类型的日志
    noinfo: false,

    //不输出任何类型的日志到控制台
    quiet: false ,

    //切换到懒惰模式，这意味着不监听文件的变化，只会在有请求时再编译对应的文件，
    //这适合页面非常多的项目。
    lazy: true,

    // watchOptions
    //  只在非懒惰模式下才有效
    watchOptions: {
        aggregateTimeout : 300 ,
        poll : true
    }

    // 默认的URL 路径，默认是'index.html'
    index: 'index.html',

    // 自定义HTTP 头
    headers: {'X-Custom-Header': 'yes'},

    //为特定后缀的文件添加HTTP mimeTypes ，作为文件类型映射表
    mimeTypes: {'text/html ':['phtml']},
    
    //统计信息输出样式
    stats: {
        colors: true
    }
    
    //自定义输出日志的展示方法
    reporter: null,
    
    //开启或关闭服务端渲染
    serverSideRender: false,
}))
```

#### 热模块替换

DevServer自带有热模块替换的功能，也需要借助另外一个中间件来实现热模块替换，

##### webpack-hot-middleware

在webpack中加入插件 HotModuleReplacementPlugin

在server.js中引入中间件

在main.js加入替换逻辑





