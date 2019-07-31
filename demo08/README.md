#### HappyPack

随着项目越来越大，文件数量越来越多的时候，webpack的构建就会越来越慢。

因为运行在node上的webpack依然是单线程模式，需要一个一个的处理任务。

HappyPack就是用来解决这个问题的一个插件，将任务分解成多个子进程，子进程处理完后再将结果交给主线程（与web worker模式一样）

#### 配置


threads ：代表开启几个子进程去处理这一类型的文件，默认是3 个，必须是整数。

verbose ：是否允许Happy Pack 输出日志，默认是true 。

threadPool ：代表共享进程池，即多个Happy Pack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多

```js
const happyThreadPool = HappyPack.ThreadPool({ size : 5 )) ;


new HappyPack({
    id:'css' ,
    //如何处理. css 文件，用法和Loader 配置中的一样
    loaders: ['css-loader'],
    //使用共享进程池中的子进程去处理任务
    threadPool : happyThreadPool,
} ),

```

ParallelUglifyPlugin插件 也是使用多进程的方式去压缩文件