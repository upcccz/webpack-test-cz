#### 构建Npm模块

注册

npm adduser

Username: 输入用户密码
Password: 输入密码
Email: 输入邮箱

登录： 
npm login  (第一次注册完成后自动登录）

发布： 
npm publish

##### 发布到Npm仓库的模块有以下几个特点

+ 在每个模块根目录下都必须有一个描述该模块的package.json 文件。该文件描述了模块的入口文件是哪个，该模块又依赖哪些模块等

+ 模块中的文件以JavaScript 文件为主，且大多采用模块化规范。

##### 写一个简单的模块发布上去

npm init

按要求输入生成package.json文件

创建index.js 即上面按要求定义的入口文件

npm publish (如果你设置npm都镜像地址上taobao都 ，那么要切回来才行)

使用这个发布的包

npm i npm-test-cz

删除包

npm unpublish

npm --force


#### 接入webpack

问题： 

+ 源代码采用ES6 编写，但发布到Npm 仓库时需要转换成ES5 代码，并且遵守CommonJS 模块化规范。如果发布到Npm 上的ES5 代码是经过转换的，则请同时提供Source Map 以方便调试。

+ 组件依赖的其他资源文件如css 文件也需要包含在发布的模块里。

+ 在发布出去的组件的代码中不能含有其依赖的模块的代码，而是让用户可选择性地安装。例如不能内嵌React 库的代码，这样做的目的是，在其他组件也依赖React库时，防止React 库的代码被重复打包。


解决：

+ 使用babel-loader 将ES6 代码转换成ES5 代码。

**插件babel-plugin-transform-runtime**
运行时依赖**插件babel-runtime** 

Babel 会在每个输出文件中内嵌这些依赖的辅助函数的代码，如果多个源代码文件都依赖这些辅助函数，那么这些辅助函数的代码将会重复出现很多次， 造成代码冗余。为了不让这些辅助函数的代码重复出现，可以在依赖它们时通过`require ('babel/runtime/helpers/createClass)`的方式导入，这样就能做到只让它们出现一次。

+ 设置`output.libraryTarget ＝'commonjs2'`，使输出的代码符合CommonJS2模块化规范，以供其他模块导入使用。

+ 配置cssloader

+ 配置externals，来告诉在Webpack 要构建的代码中使用了哪些不用被打包的模块，也就是说这些模板是外部环境提供的， Webpack 在打包时可以忽略它们。


