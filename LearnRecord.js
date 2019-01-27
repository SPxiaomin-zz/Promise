// 「over」下面的全部简单review一遍
// 「over」最下面的学习目标搞定
// 「over」自己重新全部实现一遍&提交代码，然后over


关键结果

1. 「over」所有的 then 收集的方法「always, catch」；顺带联想下fetch等支持promise的东西吧；

// over


2. 「over」两种执行方式「resolve, 接在promise暂停后执行」； 顺带联想下fetch等支持promise的东西吧；

// 感觉思考得差不多了，动手中，然后就思考下面的边界情况。

// 先动手 resolve；「over」

// 后动手接在 promise 后；「over」

// 思考下接在fetch后的情况；「over」

{

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.then((res) => {
  return res + 1
})
.then(() => {

})

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.then((res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(res + 1)
    }, 1000)
  })
})
.then((res) => {
  console.log(res) // 2
})

fetch('xxxxx')
.then((res) => {
  console.log(res)
})

}

3. 「over」边界情况的考虑；

- [over] resolver must be Function

- [over] 值的链式传递

- 「over」死循环

- 「over」防止多次启动；
- 「over」当 promise 的状态已经是改变的时候，.then时候的执行方式
- 「over」值的透传；

- 「over」promise.then 中的执行顺序；

- 「over」目前作者的实现并没有保证有error的时候，但是没有catch会将错误报出来「异步报错&可取消」；

// 值的链式传递

{
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(1)
    })
  })
  .then(() => {

  })

  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    })
  })
  .catch(() => {

  })
}

// 死循环

{

// 收集 over
// 不处理，实际执行 over
// 不处理，假想执行 over
// 处理方式 over

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 5000)
})

let a = promise.then(() => {
  return a
})

a.catch(console.log)


}

// 防止多次启动

{

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)

  reject()
})

promise.then(() => {
  console.log('then')
})

promise.catch(() => {
  console.log('err')
})

}


//  当 promise 的状态已经是改变的时候，.then时候的执行方式

{
}


// 值的透传

{
}

// promise.then 中的执行顺序；

{
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('haha')
    }, 5000)
  })

  promise.then(() => {
    promise.then(() => {
      console.log('2')
    })

    console.log('1')
  })

  // 1 2
}


// 目前作者的实现并没有保证有error的时候，但是没有catch会将错误报出来「异步报错&可取消」；
// 「over」所有再详细review一遍
// 「ing」粗略review一遍，然后over

// 思考下————

    // 1. 「over」为什么要一直将错误往后传，直到有catch or 没有catch直接报错？

    //    是这么设计的。

    // 2. 「over」是如何往后传的？

    // 3. 「over」如何判断已经到了最后面了？

// 将下面的「异步&可取消」思考明白就行了。

{
  // 「over」当是 rejected & callbackQueue.length == 0 的时候，异步报错「因为下面的错误是捕获不到的」
  // 1. 收集
  // 2. 执行
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 5000)
  })
  .then(() => {
    new Promise((resolve, reject) => {
      reject(2)
    })
  })
  .catch(() => {
    console.log('err')
  })

  // 异步报错也不完全正确，应该是可取消
  // - 「over」因为下面的 2 err 会被捕获「应该是被清除了异步报错」
  // - 「over」下下面的 reject(1) 错误被捕获了

  // 1. 收集
  // 2. 执行
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
  .then(() => {
    return new Promise((resolve, reject) => {
      reject(2)
    })
  })
  .catch(() => {
    console.log('err')
  })

  let p = new Promise((resolve, reject) => {
    reject(1)
  })

  p.catch(() => {
    console.log('err')
  })
}

4. 「over」扩展；

- 「over」promise.resolve() or reject

- 「over」all
- 「over」race

- 「over」catch
- 「over」always


// Promise.resolve

Promise.resolve = function(value) {
  if (value instanceof this) {
    return value
  }

  return executeCallback.bind(new this())('resolve', value)
}

// Promise.reject

Promise.reject = function(value) {
  if (value instanceof this) {
    return value
  }

  return executeCallback.bind(new this())('reject', value)
}

// Promise.all

// 「over」下面的流程跑一通看看
// - 异常处理「两种」
// - 正常情况「两种」
//    正常情况如下；
//    还需要考虑错误处理情况。

// 「over」最后review一波思路，然后over

{

  // 正常
  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 5000)
  })
  Promise
    .all([1, p])
    .then((res) => {
      console.log(res)
    })
    .catch(() => {
      console.log('err')
    })

  let p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(1)
    }, 2000)
  })
  let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 3000)
  })
  Promise
    .all([p1, p2])
    .then((res) => {
      console.log(res)
    })
    .catch(() => {
      console.log('err')
    })


  // 异常1
  promise = Promise.all()


  // 异常2
  Promise
    .all([])

}


// Promise.race

// 「over」下面的流程跑一通
// 「over」review一波思路，然后over

{
  let p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 2000)
  })

  let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 3000)
  })

  Promise
    .race([p1, p2])
    .then((res) => {
      console.log(res)
    })
}


// Promise.prototype.catch & Promise.prototype.always

// 搞清收集的逻辑
// resolve执行一轮&reject执行一轮
// - catch
//    「over」收集
//    「over」执行
// - always
//    「over」收集
//    「over」执行

{
  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, 5000)
  })

  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(1)
    }, 5000)
  })

  p
    .then(() => {
      console.log('then')
    })
    .catch(() => {
      console.log('err')
    })
    .then(() => {
      console.log('then')
    })

  p
    .then(() => {
      console.log('then')
    })
    .always(() => {
      console.log('always')
    })
    .then(() => {
      console.log('then')
    })
}


学习目标的话，就是把下面的想明白

{

new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
.always(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2)
    }, 1000)
  })
})
.then(() => {

})
.catch(() => {

})

}