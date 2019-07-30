#### tsconfig.json


#### App.vue

script 标签中的lang ＝ "ts"用于指明代码的语法是TypeScript 。

```js
// 写法的不同
export default {
    data() {
      return {
        msg: 'Hello,Webpack',
      }
    },
}

// 通过 Vue.extend 启用 TypeScript 类型推断
export default Vue.extend({
    data() {
        return {
        msg: 'Hello,Webpack',
        }
    },
});
```


从 vue2.5 之后，vue 对 ts 有更好的支持。根据官方文档，vue 结合 typescript ，有两种书写方式：

```js
  import Vue from 'vue'
  import Component from 'vue-class-component'

    // const MyComponent =  {
    //     template: '<button @click="onClick">Click!</button>',
    //     data() {
    //         return {
    //             msg: '123'
    //         }
    //     }
        
    // }
  @Component({    // All component options are allowed in here
    template: '<button @click="onClick">Click!</button>'
  })
  export default class MyComponent extends Vue { 
    message: string = 'Hello!'
    onClick (): void {
        window.alert(this.message)
    }
  }

```

#### main.ts

#### vue-shims.d.ts


由于Type Script 不认识以. vue 结尾的文件，所以为了让其支持

`import App from './App.vue'`导入语句，

还需要以下文件vue-shims.d.ts 定义.vue 文件的类型：

告诉 Type Script 编译器.vue文件其实是一个Vue

#### 接入webpack

extensions 
appendTsSuffixTo配置

