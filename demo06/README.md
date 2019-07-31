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


#### 文件监听

在Webpack中监昕一个文件发生变化的原理，是定时获取这个文件的最后编辑时间，每次都存下最新的最后编辑时间，如果发现当前获取的和最后一次保存的最后编辑时间不一致，就认为该文件发生了变化。配置项中的watchOptions.poll 用于控制定时检查的周
期，具体含义是每秒检查多少次。


当发现某个文件发生了变化时，并不会立刻告诉监昕者，而是先缓存起来，收集一段时间的变化后，再一次性告诉监听者。配置项中的watchOptions.aggregateTimeout 用于配置这个等待时间。这样做的目的是，我们在编辑代码的过程中可能会高频地输入文字，导致文件变化的事件高频地发生， 如果每次都重新执行构建，就会让构建卡死。

对于多个文件来说，其原理相似，只不过会对列表中的每个文件都定时执行检查。但是怎么确定这个需要监听的文件列表呢？在默认情况下， Webpack 会从配置的Entry 文件出发，递归解析出Entry 文件所依赖的文件，将这些依赖的文件都加入监听列表中。所以修改index.html文件是不会被监听到的


不监听的node modules 目录下的文件
`ignored : /node_modules/,`

watchOptions.aggregateTimeout 的值越大性能越好，因为这能降低重新构建的频率。

watchOptions.poll 的值越小越好，因为这能降低检查的频率。

#### 自动刷新浏览器

devServer支持两种刷新浏览器的方式， 默认采用第一种

+ 向要开发的网页中注入代理客户端代码，通过代理客户端去刷新整个页面
+ 将要开发的网页装进一个iframe 中，通过刷新iframe 去看到最新效果。

代理客户端会和DevServer建立WebSocket 连接，双向通信。

**inline配置**

devServer.inline 配置项，它用来控制是否向Chunk 中注入代理客户端，默认会注入。事实上，在开启inline 时， DevServer 会向每个输出的Chunk 中注入代理客户端的代码。

当我们的项目需要输出很多Chunk 时，就会导致构建缓慢。其实要完成自动刷新， 一个页面只需要一个代理客户端， DevServer 之所以粗暴地为每个Chunk 都注入，是因为它不知道某个网页依赖哪几个Chunk ，索性全部都注入一个代理客户端。网页只要依赖了其中任何一个Chunk，代理客户端就被注入网页中。

可以设置为false，当时此时入口网址就会变成`http://localhost:8080/webpack-dev-server /`，

bundle.js 中不再包含代理客户端的代码

这种方式就是支持的第二种方式，使用iframe

如果不想以iframe 的方式去访问，但同时想让网页保持自动刷新的功能， 则需要手动向网页中注入代理客户端的脚本向index.html 中插入以下标签：

```html
<script src= "http://localhost:8080/webpack-dev-server.js"></ script>
```

向网页注入以上脚本后，独立打开的网页就能自动刷新了。但是要注意在发布到线上时删掉这段用于开发环境的代码。