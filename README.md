# Promise
可用的promise实现，已实现Promise各API。

## 使用方法
支持UMD引入，返回Promise实现。
```javascript
    let promise = new Promise(function (resolve, reject) {
        resolve(100)
    }).then(function (data) {
        console.log(data)
    });
```

### API

#### Promise.prototype.then
同原生

#### Promise.resolve
同原生

#### Promise.reject
同原生

#### Promise.all
同原生

#### Promise.race
同原生