#### Resolve

`Webpack` 在启动后会从配置的入口模块出发找出所有依赖的模块。`Resolve` 配置 `Webpack` 如何寻找模块所对应的文件， `Webpack` 内置 `JavaScript`模块化语法解析功能，默认会采用模块化标准里约定的规则去寻找，但我们也可以根据自己的需要修改默认的规则。

`resolve.alias` 配置项通过别名来将原导入路径映射成一个新的导入路径。例如使用以下配置 :

```js
resolve: {
  alias: {
    components : './src/components'
  }
}
```

当通过 `import Button from 'components/button'`导入时，实际上被 `alias` 等 价替换成了 `import Button from './src/components/button' `

```js
resolve: {
  alias: {
    'react$' : '/path/to/react.min .j s 
  }
}
```

react$只会命中以 react 结尾的导入语句，即只会将 `import 'react'` 关键字替换 成 `import '/path/to/react .min.js'`。

##### mainFields

有一些第三方模块会针对不同的环境提供几份代码。例如分别提供采用了 ES5 和 ES6 的 两份代码，这两份代码的位置写在第三库依赖包的 `package.json` 文件里，代码如下:

```js

// 第三库的package.json

{
  "jsnext:main": "es/index.js",//采用 ES6语法的代码入口文件
  "main":"lib/index.js" //采用 ES5语法的代码入口文件
}
```

`webpakc`根据`mainFields`的配置决定优先采用哪份代码，`mainFields`默认配置为：`['browser', 'main']` 按顺序寻找，使用找到的第一个，所以如果第三方库如上一样配置，就会采用`'lib/index.js'`

如果想采用`'es/index.js'` 可以这么配置。

```js
resolve: {
  mainFields: ['jsnext:main','browser', 'main']
}
```

##### extensions

在导入语句没带文件后缀时，`Webpack` 会自动带上后缀后去尝试访问文件是否存在。 `resolve.extensions` 用于配置在尝试过程中用到的后缀列表

```js
resolve : {
  extensions: ['.js','.json'],
  enforceExtension: false,  // 配置为true 则必须带文件后缀
  enforceModuleExtension: false 
  // enforceModuleExtension 针对于配置第三方模块的后缀配置
  // 因为大多数第三方模块的引入语句大都没有带后缀 当enforceExtension设置为true的时候
  // 就务必设置enforceModuleExtension 为false
}
```

也就是说，当遇到 `require ('./data')`这样的导入语句时， `Webpack`会先寻找`./data.js`文件，如果该文件不存在，就去寻找. `/data.json`文件，如果还是找不到，就报错 

如果`resolve.enforceExtension`被配置为 `true`，则所有导入语句都必须带文件后缀，例如开启前 `import './foo'` 能正常工作，开启后就必须写成 `import './foo.js'`。



##### modules

`resolve.modules` 配置 `Webpack` 去哪些目录下寻找第三方模块，默认只会去 `node_modules` 目录下寻找 。有时我们的项目里会有一些模块被其他模块大量依赖和导入，由于其他模块的位置不定，针对不同的文件都要计算被导入的模块文件的相对路径 ，这个路径有时会很长，就像`import '../../../components/button'`，这时可以利用`modules` 配置项优化 。假如那些被大量导入的模块都在`./src/components` 目录下，则将 `modules`配置成 `modules : ['./src/components','node_modules']`后，可以简单地通过 `import 'button'` 导入。