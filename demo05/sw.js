// 当前缓存版本的唯一标识符，用当前时间代替
var cacheKey = new Date().toISOString();

// 当前缓存白名单，在新脚本的 install 事件里将使用白名单里的 key
var cacheWhitelist = [cacheKey];

// 需要被缓存的文件的 URL 列表
//（使用插件完成，因为每一次的hash都可能不一样，所以不能写死借助插件完成）
var cacheFileList = global.serviceWorkerOption.assets;

// 监听 install 事件
self.addEventListener('install', function (event) {
  // 注册成功后会触发install事件 在这个事件进行资源缓存
  // 等待所有资源缓存完成时，才可以进行下一步
  event.waitUntil(
    caches.open(cacheKey).then(function (cache) {
      // 要缓存的文件 URL 列表
      return cache.addAll(cacheFileList);
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', function (event) {
  event.respondWith(
    // 去缓存中查询对应的请求
    caches.match(event.request).then(function (response) {
        // 如果命中本地缓存，就直接返回本地的资源
        if (response) {
          return response;
        }
        // 否则就去用 fetch 下载资源
        return fetch(event.request);
      }
    )
  );
});


// 每次打开接入了Service Workers 的网页时，浏览器都会重新下载Service Workers脚本文件
// 如果发现和当前已经注册过的文件存在字节差异，就将其视为“新服务工作线程”

// 新的Service Workers 线程将会启动，且将会触发其install 事件
// 当网站上当前打开的页面关闭时，旧的Service Workers 线程将会被终止，新的Service Workers 线程将会取得控制权。

// 新 Service Workers 线程取得控制权后，将会触发其 activate 事件
// 在触发activate事件后，删除旧的缓存
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          // 不在白名单的缓存全部清理掉
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 删除缓存
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});