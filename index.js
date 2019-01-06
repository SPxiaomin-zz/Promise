

function executeCallbackAsync(callback, value) {
  let res

  try {
    res = callback(value)
  } catch (error) {
    executeCallback.bind(this)('reject', res)
  }

  if (res !== this) {
    executeCallback.bind(this)('resolve', res)
  } else {
    executeCallback.bind(this)('reject',  new TypeError('Cannot resolve promise with itself'))
  }
}

function executeCallback(resolveType, value) {
  this.state = resolveType
  this.data = value
  this.callbackQueue.forEach((callbackItem) => {
    callbackItem[resolveType](value)
  })
}

function executeResolver(resolver) {
  let isCalled = false

  function onSuccess(value) {
    if (isCalled) return
    isCalled = true

    executeCallback.bind(this)('resolve', value)
  }

  function onError(value) {
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

function CallbackItem(promise, onResolve, onReject) {
  this.promise = promise
  this.onResolve = onResolve ? onResolve : value => value
  this.onReject = onReject ? onReject : err => { throw err }
}

CallbackItem.prototype.resolve = function(value) {
  executeCallbackAsync.bind(this.promise)(this.onResolve, value)
}

CallbackItem.prototype.reject = function(value) {
  executeCallbackAsync.bind(this.promise)(this.onReject, value)
}

function Promise(resolver) {
  if (resolver && typeof resolver !== 'function') {
    console.log('resolver must be function')
  }

  this.status = 'pending'
  this.data = undefined
  this.callbackQueue = []

  if (resolver) executeResolver.bind(this)(resolver)
}

Promise.prototype.then = function(onResolve, onReject) {
  const promise = new this.constructor()

  this.callbackQueue.push(new CallbackItem(promise, onResolve, onReject))

  return promise
}
