; (function (scope) {
  var PENDING = 'pending';
  var RESOLVED = 'resolved';
  var REJECTED = 'rejected';
  var UNDEFINED = void 0;

  function CallbackItem(promise, onResolved, onRejected) {
    this.promise = promise

    this.onResolved = typeof onResolved === 'function'
      ? onResolved
      : function (v) { return v }
    this.onRejected = typeof onRejected === 'function'
      ? onRejected
      : function (v) { throw v }
  }
  CallbackItem.prototype.resolve = function(value) {
    executeCallbackAsync.bind(this.promise)(this.onResolved, value)
  }
  CallbackItem.prototype.reject = function(value) {
    executeCallbackAsync.bind(this.promise)(this.onRejected, value)
  }

  function getThen(obj) {
    var then = obj && obj.then;
    if (obj && typeof obj === 'object' && typeof then === 'function') {
      return function appyThen() {
        then.apply(obj, arguments);
      };
    }
  }

  function executeCallback(type, x) {
    var isResolve = type === 'resolve',
      thenable;

    if (isResolve && (typeof x === 'object' || typeof x === 'function')) {
      try {
        thenable = getThen(x);
      } catch (e) {
        return executeCallback.bind(this)('reject', e);
      }
    }

    if (isResolve && thenable) {
      executeResolver.bind(this)(thenable);
    } else {
      this.state = isResolve ? RESOLVED : REJECTED;
      this.data = x;
      this.callbackQueue.forEach(v => v[type](x));
    }
    return this;
  }

  function executeResolver(resolver) {
    var called = false,
      _this = this;

    function onError(y) {
      if (called) {
        return;
      }
      called = true;
      executeCallback.bind(_this)('reject', y);
    }

    function onSuccess(r) {
      if (called) {
        return;
      }
      called = true;
      executeCallback.bind(_this)('resolve', r);
    }

    try {
      resolver(onSuccess, onError);
    } catch (e) {
      onError(e);
    }
  }

  function executeCallbackAsync(callback, value) {
    var _this = this;
    setTimeout(function () {
      var res;
      try {
        res = callback(value);
      } catch (e) {
        // 如果 _this 不存在方法了的话，那么就应该报错
        if (_this.callbackQueue.length == 0) {
          throw e
        }

        return executeCallback.bind(_this)('reject', e);
      }

      if (res !== _this) {
        return executeCallback.bind(_this)('resolve', res);
      } else {
        return executeCallback.bind(_this)('reject', new TypeError('Cannot resolve promise with itself'));
      }
    }, 4)
  }

  function Promise(resolver) {
    if (resolver && typeof resolver !== 'function') {
      throw new Error('Promise resolver is not a function')
    }
    this.state = PENDING;
    this.data = UNDEFINED;
    this.callbackQueue = [];

    if (resolver) executeResolver.call(this, resolver);
  }
  Promise.prototype.then = function (onResolved, onRejected) {
    // 解决值穿透的问题
    if (typeof onResolved !== 'function' && this.state === RESOLVED ||
      typeof onRejected !== 'function' && this.state === REJECTED) {
      return this
    }

    var promise = new this.constructor()

    if (this.state !== PENDING) {
      var callback = this.state === RESOLVED ? onResolved : onRejected
      executeCallbackAsync.bind(promise)(callback, this.data)
    } else {
      this.callbackQueue.push(new CallbackItem(promise, onResolved, onRejected))
    }

    return promise
  }
  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  }

  try {
    module.exports = Promise;
  } catch (e) {
    if (scope.Promise && !scope.MPromise) scope.MPromise = Promise;
  }
  return Promise;
})(this)


/**
 * 需要解决的疑惑
 */

1. （X）思考清楚如何进行启动的？

2. （X）思考看then是如何收集的？新的promise是如何产生的？

  在状态还是pending的情况下；

  在状态已经改变的情况下；

3. （X）思考看具体是如何执行的？

4. （X）思考看返回new Promise的时候是如何执行的？

5. Promise 是用来解决回调地狱的，它的解决思路是什么？如何实现的？


// 如下的两种链式都是如何执行的？



// - - -



let promise = new Promise(function(resolve, reject) {
  console.log('haha')
  resolve('test')
  console.log('hahaha')
})

promise.then(function() {
  // 1
})

promise.then(function() {
  // 2
})

// 为什么上面的 1/2 都是获取到 test?

// 上面的两个 then callback 是如何进行收集的？


let promise = new Promise(function(resolve, reject) {
  setTimeout(() => {
    resolve('test')
  }, 5000)
})

promise.then(function() {
  // 1
})

promise.then(function() {
  // 2
})





// - - -



new Promise(function(resolve, reject) {
  resolve('test')
})
.then(function() {
  // 1

  // return new promise 1
})
.then(function() {
  // 2

  // return new promise 2
})

// 上面的 test 只能够在 1 获取到，在二是获取不到的






new Promise(function(resolve, reject) {
  reject('test')
})
.catch(function() {
  // 1
})
.catch(function() {
  // 2
})

// 为什么上面的第一个catch可以执行，第二个catch不能够执行
// 是如何终止的？







Promise.prototype.always = function(fn) {
  return this.then(fn, fn)
}

// 为什么上面的 always 是可以实现 always 效果的？







// resolve 返回其他的 新promise 是怎么支持的？


new Promise((resolve, reject) => {
  reject(1)
})
.then(() => {
  return new Promise((resolve, reject) => {

  })
})
.then(() => {

})
.catch(() => {
  // 这里的 catch 是如何同时服务于上面两个 promise 的？
})


let b = new MPromise((resolve, reject) => {
  resolve(2)
})

let promise = new MPromise((resolve, reject) => {
  resolve(1)
})

let a = promise.then(() => {
  return b
})
.then((val) => {
  console.log(val)
  // 2
})

a != b







/**
 * 自我实现
 */













new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.always(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
})
.then(() => {

})
.catch(() => {

})

promise.then()

promise.then().then()

new Promise()
.then()

new Promise()
.then()
.then()

new Promise()
.always()

new Promise()
.then()
.always()

关键结果

1. 所有的 then 收集的方法「always, catch」；顺带联想下fetch等支持promise的东西吧；

// 感觉思考得差不多了，思考下2，然后返回。


2. 两种执行方式「resolve, 接在promise暂停后执行」； 顺带联想下fetch等支持promise的东西吧；

// 感觉思考得差不多了，动手中，然后就思考下面的边界情况。

// 先动手 resolve；「over」

// 后动手接在 promise 后；stop here

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.then(() => {
  console.log('haha')
})
.catch(() => {
  console.log('error')
})


new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.then(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
})
.then(() => {
  console.log('haha')
})
.catch(() => {
  console.log('error')
})

3. 边界情况的考虑；

// stop thinking here & 可以和扩展一起思考

- 死循环
- 防止多次启动；
- 当 promise 的状态已经是改变的时候，.then时候的执行方式
- 值的透传；
- promise.then 中的执行顺序；


4. 扩展；

- promise.resolve().then()
- all
- race
- catch
- always


学习目标的话，就是把下面的两个想明白

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.always(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
})
.then(() => {

})
.catch(() => {

})


new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.then(() => {

})
.always(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
})
.then(() => {

})
.catch(() => {

})