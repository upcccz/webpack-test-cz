#### 构建同构应用

在浏览器和服务器中都能运行

##### 浏览器渲染

由浏览器去解析执行JS DOM树上只有1个div 由JS向文档中append innerHTML


```js
// Vue
import App from './App.vue'

new Vue({
    el: '#app',
    render: h => h(App)
})
```


```js
// React
<div id="app"></div>

import React from 'react'
import ReactDOM from 'react-dom'

const myh1 = React.createElement('h1',{
    title:"hello world",
    id:"test"
})
// 参数：元素类型 元素属性对象 子节点...

const myDiv = React.createElement('div',null,myh1)

ReactDOM.render(myDiv,document.getELementById('app'))

```

优点：服务端不用每次返回html 只返回api数据 服务器压力减小

缺点：

1.首次加载白屏：返回的是一个空白HTML 需要去下载css js 文件，如果文件过大或出现错误 用户会看到白屏
2.页面数据动态生成，不利于SEO （搜索引擎优化）


##### 服务器渲染 SSR

由服务器渲染出带内容的HTML后返回。 优缺点即相反，用户第一次拿到的HTML文档已经进行了初步的内容渲染，虽然请求的数量并没有改变，只是把部分请求转移到了服务端，但是在服务器上进行数据拉取的成本要远远小于浏览器端，而且出传输更加高效。


##### 同构应用

同构：服务端渲染应该表达出页面最主要、最核心、最基本的信息；而浏览器端则需要针对交互完成进一步的页面渲染、事件绑定等增强功能。所谓同构，就是指前后端共用一套代码或逻辑，而在这套代码或逻辑中，理想的状况是在浏览器端进一步渲染的过程中，判断已有的DOM结构和即将渲染出的结构是否相同，若相同，则不重新渲染DOM结构，只需要进行事件绑定即可。

优点：
SEO优化支持。服务端接收到请求后，会返回一个相对完整、包含了初始内容的HTML文档，所以更有利于搜索引擎爬虫获取信息，提高搜索结果展现排名。同时，更快的页面加载时间也有利于搜索结果展现排名的提升。

实现更加灵活。服务端渲染只是直出页面的初始内容，浏览器端仍然需要做后续工作，以完成页面的最终展现。这样服务端渲染和浏览器端渲染仍可以平衡，在很大程度上也能实现代码复用。

对于低端机型、恶劣的网络环境更加友好。因为内容的初步渲染是在服务端完成的，所以对于低端机型更加友好，不至于页面加载时出现白屏幕的状况。

更好的用户体验

缺点：

服务端处理的逻辑增多，增加了复杂性。
服务端无法完全复用浏览器端代码。
增加了服务端的TTFB（Time To First Byte）时间。TTFB时间指的是从浏览器发起最初的网络请求，到从服务器接收到第一个字节的这段时间。它包含了TCP连接时间、发送HTTP请求的时间和获得响应消息的第一个字节的时间。因为对数据的获取和对页面初始内容的渲染，势必会降低服务端返回的速度。

##### 构建同构的目标

从一份项目源码中构建出两份JS代码，一份用于在浏览器端运行， 一份用户在Node环境中运行并渲染中HTML

对于要在Node环境运行的JS代码需要注意：

+ 不能包含浏览器环境提供的API， document的相关操作等
+ 不能包含CSS代码，影响服务端渲染性能
+ 不要能将第三块模块和Node原生模块打包进去，而是需要使用CommonJS规范来移入。
+ 需要通过CommonJS规划导出一个渲染函数，用于在服务器中执行这个渲染函数，渲染除HTML的内容后返回。


[参考](https://www.cnblogs.com/tiedaweishao/p/6644267.html)