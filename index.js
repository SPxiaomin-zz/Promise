// 自己实现

// 「over」new Promise & then收集

// 「over」执行
// - 普通执行
// - 接在promise暂停后执行

// 边界情况
// - 「over」resolver must be Function
// - 「over」值的链式传递
// - 「over」死循环
// - 「over」防止多次启动
// - 「over」当 promise 的状态已经是改变的时候，.then时候的执行方式
// - 「over」值的透传
// - 「over」promise.then 中的执行顺序
// - 「over」目前作者的实现并没有保证有error的时候，但是没有catch会将错误报出来「异步报错&可取消」

// 扩展
// - 「over」Promise.resolve() & Promise.reject()
// - 「over」Promise.all()
// - 「over」Promise.race()
// - 「over」Promise.catch()
// - 「over」Promise.always()

function executeCallback(type, value) {
  const getThen = (value) => {
    const then = value && value.then
    if (typeof then == 'function') {
      return function applyThen() {
        then.apply(value, arguments)
      }
    }
  }

  let thenable

  if (
    type == 'resolve'
    && typeof x == 'object'
  ) {
    thenable = getThen(value)
  }

  if (thenable) {
    executeResolver.bind(this)(thenable)
  } else {
    this.status = type
    this.data = value
    this.callbackQueue.forEach((callbackItem) => {
      callbackItem[type](value)
    })

    if (
      this.callbackQueue.length == 0
      && this.status == 'reject'
    ) {
      this.timer = setTimeout(() => {
        throw value
      })
    }
  }

  return this
}

function executeResolver(resolver) {
  let isCalled = false

  const onSuccess = (value) => {
    // 防止多次启动
    if (isCalled) return
    isCalled = true

    executeCallback.bind(this)('resolve', value)
  }

  const onError = (error) => {
    if (isCalled) return
    isCalled = true

    executeCallback.bind(this)('reject', value)
  }

  try {
    resolver(onSuccess, onError)
  } catch (error) {
    onError(error)
  }
}

function executeCallbackAsync(callback, value) {
  setTimeout(() => {
    let res
  
    try {
      res = callback(value)
    } catch (error) {
      executeCallback.bind(this)('reject', error)
    }
  
    if (res != this) {
      executeCallback.bind(this)('resolve', res)
    } else {
      executeCallback.bind(this)('reject', new Error('cycle'))
    }
  })
}

function CallbackItem(promise, onResolve, onReject) {
  this.promise = promise

  // 值的链式传递
  this.onResolve = onResolve ? onResolve : value => value
  this.onReject = onReject ? onReject : error => { throw error }
}

CallbackItem.prototype.resolve = function(value) {
  executeCallbackAsync.bind(this.promise)(this.onResolve, value)
}

CallbackItem.prototype.reject = function(error) {
  executeCallbackAsync.bind(this.promise)(this.onReject, value)
}

Promise.prototype.then = function(onResolve, onReject) {
  // 错误异步可取消
  clearTimeout(this.timer)

  // 透传
  if (
    this.status == 'resolve' && typeof onResolve != 'function'
    || this.status == 'reject' && typeof onReject != 'function'
  ) {
    return executeCallback.bind(new this.constructor())(this.status, this.data)
  }


  let promise = new this.constructor()

  if (this.status != 'pending') {
    // 状态已变的时候的执行方式
    const callback = this.status == 'resolve' ? onResolve : onReject
    executeCallbackAsync.bind(promise)(callback, this.data)
  } else {
    this.callbackQueue.push(
      new CallbackItem(promise, onResolve, onReject)
    )
  }

  return promise
}

function Promise(resolver) {
  if (resolver && typeof resolver != 'function') {
    throw new Error('resolver must be function')
  }

  this.status = 'pending'
  this.data = undefined
  this.callbackQueue = []

  if (resolver) {
    executeResolver.call(this, resolver)
  }
}

Promise.resolve = function(value) {
  if (value instanceof this) {
    return value
  }

  return executeCallback.bind(new this())('resolve', value)
}

Promise.reject = function(value) {
  if (value instanceof this) {
    return value
  }

  return executeCallback.bind(new this())('reject', value)
}

Promise.all = function(iterable) {
  return new this((resolve, reject) => {
    if (!iterable || !Array.isArray(iterable)) {
      return reject('iterable must be Array')
    }

    if (!iterable.length) {
      return resolve([])
    }

    let res = []
    let counter = 0
    iterable.forEach((iterableItem, index) => {
      this.resolve(iterableItem).then((value) => {
        res[index] = value

        if (++counter == iterable.length) {
          resolve(res)
        }
      }, (error) => {
        reject(error)
      })
    })
  })
}

Promise.race = function(iterable) {
  return new this((resolve, reject) => {
    if (!iterable || !Array.isArray(iterable)) {
      return reject('iterable must be Array')
    }

    if (!iterable.length) {
      return resolve([])
    }

    iterable.forEach((iterableItem) => {
      this.resolve(iterableItem).then((value) => {
        resolve(value)
      }, (error) => {
        reject(error)
      })
    })
  })
}

Promise.prototype.catch = function(fn) {
  return this.then(null, fn)
}

Promise.prototype.always = function(fn) {
  return this.then(fn, fn)
}
