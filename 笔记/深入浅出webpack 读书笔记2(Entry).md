#### Entry:配置模块的入口

`entry` 配置是必填的，若不填则将导致 `Webpack` 报错、退出 。

##### context

`Webpack` 在**寻找相对路径的文件**时会以 `context` 为根目录， `context` **默认为执行启动 `Webpack` 时所在的当前工作目录。**如果想改变 `context` 的默认配置，则可以在配置文件里这样设置它 :

```js
module.exports = {
  context: path.resolve (__dirname ，'app'),
  entry: './app/main'
}
```

`context` 必须是一个绝对路径的字符串 。 除此之外，还可以通过在启动 `Webpack`时带上参数 `webpack --context` 来设置 `context`。

`Entry` 的路径及其依赖的模块的路径可能采用相对于 `context` 的路径来描述， `context `会影响到这些相对路径所指向的真实文件。

##### Entry类型

```js
module.exports = {
  // 字符串
  entry: './app/main'
  // 数组
  entry: ['./app/main','./app/profile']
  // 对象
  entry: {a: './app/entry-a', b: ['./app/entry-b1', './app/entry-b2']}
  // 配置多个入口，每个入口生成一个 Chunk
}
```
`Webpack`会为每个生成的 `Chunk`取一个名称，`Chunk`的名称和 `Entry`的配置有关。如果 `entry` 是一个 `String` 或 `Array`，就只会生成**一个** `Chunk`，这时 `Chunk` 的名称是 `main`。如果 `entry` 是一个 `Object`，就可能会出现多个 `Chunk`，这时 `Chunk` 的名称是 `Object` 键值对中键的名称。

##### 配置动态 Entry

假如项目里有多个页面需要为每个页面的入口配置一个 `Entry`，但这些页面的数量可能会不断增长，则这时 Entry 的配置会受到其他因素的影响，导致不能写成静态的值 。其解决方法 是将 `Entry`设置成一个函数动态地返回上面所说的配置。 

```js
// 同步函数 
entry: () => {
  // 逻辑操作
  return {
    a : './page/a', 
    b :'./page/b',
  }
}
//异步函数
entry: () => {
  // 逻辑操作
  return new Promise ((resolve)=>{
    resolve({
      a : './page/a', 
      b :'./page/b',
    })
  })
}
```