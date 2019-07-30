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