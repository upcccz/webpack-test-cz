#### 使用DllPlugin

dll: 动态链接库，在一个动态链接库中可以包含为其他模块调用的函数和数据。

作用: 提高构建速度。

包含大量复用模块的动态链接库只需被编译一次，在之后的构建过程中被动态链接库包含的模块将不会重新编译，而是直接使用动态链接库中的代码。由于动态链接库中大多数包含的是常用的第三方模块，例如react 、react-dom ，所以只要不升级这些模块的版本，动态链接库就不用重新编译。

DllPlugin 插件： 用于打包出一个个单独的动态链接库文件。这个插件会生成一个名为 manifest.json 的文件，这个文件是用来让 DLLReferencePlugin插件映射到相关的依赖上去的。

**动态链接库文件**

一个动态链接库文件中包含了大量模块的代码，这些模块被存放在一个数组里，用数组的索引号作为ID 。并且通过_dll_react 变量将自己暴露在全局中，即可以通过window._dll_react 访问到其中包含的模块。


**xx.manifest.json**

xx.manifest.json 文件也是由DllPlugin生成的，用于描述在动态链接库文件中包含哪些模块，DLLReferencePlugin插件通过该文件正确映射，以react.manifest.json 文件为例，其文件的内容大致如下

```js
{
    //描述该动态链接库文件暴露在全局中的变量名称
    "name": "_dll_react",
    "content": {
        "./node_modules/process/browser.js":{
            "id": 0,
            "meta":{}
        },
        // ．．．此处省略部分模块

        "./node_modules/react-dom/lib/ReactBrowserEventEmitter.js": {
            "id": 52,
            "meta":{}
        }
    }
}
```

打包时从入口进入，在遇到其依赖的模块在dll.js 文件中时，会直接通过dll.js 文件暴露的全局变量（window._dll_react）获取打包在dll.js 文件中的模块，所以在index.html 文件中需要将依赖的两个dll.js文件加载进去。


#### 配置处理动态库文件的webpack_dll.config


#### 配置webpack.config

