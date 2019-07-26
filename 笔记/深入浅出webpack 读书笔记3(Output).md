#### Output

`output` 配置如何输出最终想要的代码。

##### filename

配置输出文件的名称，为 `string` 类型。如果只有一个输出文件，则 可以将它写成静态不变的:

```js
module.exports = {
  output: {
    filename:'bundle.js'
  }
}
```

但是在有多个`Chunk`要输出时，就需要借助模板和变量了。前面讲到， `Webpack`会为每个`Chunk`取一个名称，所以我们可以根据 `Chunk` 的名称来区分输出的文件名。

```js
module.exports = {
  output: {
    filename:'[name].js'
  }
}
```

**变量**

+ `id`: Chunk 的唯一标识，从 0开始
+ `name`: Chunk 的名称
+ `hash`: Chunk的唯一标识的 Hash值
+ `chunkhash`: Chunk 内容的 Hash 值

`hash` 和 `chunkhash`的长度是可指定的，`[hash:8]`代表8位`hash`值，默认是20位。

`ExtractTextWebpackPlugin`插件使用 `contenthash`而不是 `chunkhash` 来代表哈希值，原因在于 `ExtractTextWebpackPlugin`提取出来的内容是代码内容本身，而不是由一组模块组成的`Chunk`

##### chunkFilename

`chunkFilename` **配置无入口的 `Chunk` 在输出时的文件名称。**（被抽取的公共`chunk`等） 。`chunkFilename` 和上面的 `filename` 非常类似，但 `chunkFilename` 只用于指定在运行过程中生成的 `Chunk` 在输出时的文件名称。

会在运行时生成 `Chunk` 的常见场景包括:使用 `CommonChunkPlugin`、使用`import ('path/to/module')`动态加载等。 `chunkFilename`支持和 `filename`一致的内置变量。

##### path

`path` 配置**输出文件存放在本地的目录**，必须是 `string` 类型的**绝对路径**。通常通 过 `Node.js` 的 `path` 模块去获取绝对路径 :

```js
path: path.resolve(__dirname, './dist')
```

##### publicPath

`publicPath` 配置发布到线上资源的 `URL`前缀，为 `string` 类型。默认值 是空字符串`' '`，即使用相对路径。

举个例子，需要将构建出的资源文件上传到 CDN服务上，以利于 加快页面的打开速度。

```js
filename:'[name][chunkhash:8] .js',
publicPath:'https://cdn.example.com/assets/'
```
之后的页面引入就会是

```html
<script src='https://cdn.example.com/assets/a_12345678.js' ></script>
```

##### url-loader 的publicPath

目录结构
+ style
  + main.css
+ src 
  + static
    + images
      + a.png
  + page
    + main.html

你在`'main.css' `中使用了 `"background:url('../src/static/images/a.png')"`，设置了`css的filename` 为 `'static/css/[name].[hash:4].css'`，设置`url-loader`转换之后图片的`name`格式是  `'[path][name].[hash:4].[ext]'`

打包之后

+ dist
  + static
    + css
      + main.12bc.css
    + images
      + a.c3b4.png

如果不设`url-loader`配置的`publicPath`，哪么 `main.css` 引入的路径将会是`'static/css/static/images/a.c3b4.png'` 。会从当前路径下去找被`url-loader`转化过的路径`'static/images/a.c3b4.png'`，所以需要设置`url-loader`的`publicPath`为`'../../' `这样才会去找`'static/images/a.c3b4.png'`

##### crossOriginloading

`Webpack` 输出的部分代码块可能需要异步加载，而异步加载是通过 `JSONP`。`crossOriginLoading` 则是用于 配置这个异步插入的标签的 `crossorigin`值。

`script`标签的 `crossorigin` 属性可以取以下值:

`anonymous`：	对此元素的CORS（跨域）请求将不设置凭据标志cookies。
`use-credentials`： 对此元素的CORS（跨域）请求将设置凭证标志; 这意味着请求将提供凭据cookies。