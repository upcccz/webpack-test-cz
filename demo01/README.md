#### show.ts

区别是使用了类型检查

##### 配置

Typescript 官方提供了能将Typescript 转换成JavaScript 的编译器。我们需要在当前项目的根目录下新建一个用于配置编译选项的tsconfig.json 文件，编译器默认会读取和使用这个文件，配置文件的内容大致如下：

通过 `npm install -g typescript` 安装编译器到全局后，可以通过tsc main.ts命令编译出main.js 和show.js，因为main.js 依赖 show.js


##### 接入webpack

需要注意的两个问题

+ 通过Loader 将TypeScript 转换成JavaScri pt 。
+ Webpack 在寻找模块对应的文件时需要尝试ts 后缀。