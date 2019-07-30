#### 构建离线应用

离线应用的优点：

+ 在没有网络的情况下也能打开网页
+ 由于部分被缓存的资源直接从本地加载，所以对用户来说可以加快网页的加载速度，对网站运营者来说可以减少服务器的压力及传输流量费用。

##### Service Workers

Service Workers 是一个在浏览器后台运行的脚本，它的生命周期完全独立于网页。它无法直接访问DOM ，但可以通过postMessage 接口（web workers类似）发送消息来和UI 进程通信。拦截网络请求是Service Workers 的重要功能，通过Service Workers 能完成离线缓存、编辑响应、过滤响应等功能。


##### sw.js

是否支持 -> 注册

编写sw.js

+ Service Workers 在注册成功后会在其生命周期中派发一些事件，通过监听对应的事在特点的时间节点上做一些事情。关键字self，代表当前的Service Workers 实例。

#### 接入webpack

**serviceworker-webpack-plugin插件**

在全局注册一个变量`global.serviceWorkerOption.assets`

存储正确的带有当前hash值的资源列表

然后打包的时候会在sw.js的头部就会插入这样一段代码

```js
var serviceWorkerOption = {
    "assets":
        [
            "./app_e26c96a9.js",
            "./app_028dcf98.css",
            "./index.html"
        ]
};
```

**HTTPS**

由于Service Workers 必须在HTTPS 环境下才能拦截网络请求来实现离缓存

所以需要配置devServer.https = true

最新版的chrome禁止了localhost的https证书


+ 设置浏览器不弹出警告

使用浏览器打开chrome://flags/#allow-insecure-localhost

启用第一个 然后重启浏览器

+ 生成本地https证书，并且信任自签CA的方案

[参考](https://blog.shifudao.com/posts/2019-04/%E6%9C%AC%E5%9C%B0https%E5%BF%AB%E9%80%9F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88mkcert.html)



