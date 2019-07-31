// 通过 CommonJS 规范导入 show 函数
const show = require('./show.js');
// 执行 show 函数
show('Webpack44');

// 为了支持模块热替换
if (module.hot) {
  module.hot.accept();
}

// if (module.hot) {
//   module.hot.accept(['./show.js'], ()=> {
//     window.document.getElementById('app').innerText = '监听到了show.js的更新！！！';
//   });
// }

// module.hot 是当开启模块热替换后注入全局的API ，用于控制模块热替换的逻辑。


// 当子模块发生更新时，更新事件会一层层地向上传递，也就是从show.js
// 文件传递到main.js 文件，直到有某层的文件接收了当前变化的模块，即main.js 文
// 件中定义的module.hot.accept（［'./show.js',callback ），这时就会调用
// callback 函数去执行自定义逻辑。如果事件一直往上抛，到最外层都没有文件接收它，则
// 会直接刷新网页。