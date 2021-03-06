class myPromise {
  static PENDING = 'pending'
  static FIFILLED = 'fufilled'
  static REJECTED = 'rejected'
  //传入的executor即new Promise时传入的(resolve,reject)=>{}
  constructor(executor) {
    //初始时默认状态为pending
    this.status = myPromise.PENDING
    this.value = null;
    this.callbacks = []

    //如果执行过程中出现问题,则把错误交给reject处理
    try {
      //类中的方法局部默认开启了严格模式
      //如果单独调用方法,其中的this为undefined,所以要通过bind绑定this
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error)
    }

  }

  resolve (value) {
    if (this.status == myPromise.PENDING) {
      this.status = myPromise.FIFILLED
      this.value = value
      //当promise中通过异步操作改变status状态则在这里执行回调函数
      //需要异步执行
      setTimeout(() => {
        this.callbacks.forEach(callback => {
          callback.onResolved(value)
        })
      });
    }
  }

  reject (reason) {
    if (this.status == myPromise.PENDING) {
      this.status = myPromise.REJECTED
      this.value = reason
      //当promise中通过异步操作改变status状态则在这里执行回调函数
      //需要异步执行
      setTimeout(() => {
        this.callbacks.forEach(callback => {
          callback.onRejected(reason)
        })
      });
    }
  }

  then (onResolved, onRejected) {
    //当没传onResolved或onRejected时也能执行,不报错
    if (typeof onResolved != "function") {
      onResolved = () => { this.value }
    }
    if (typeof onRejected != "function") {
      onRejected = () => { this.value }
    }

    //返回一个新的promise以实现链式调用
    return new myPromise((resolve, reject) => {
      //如果status状态是pending的话,则把onResolved和onRejected函数压入callbacks
      if (this.status == myPromise.PENDING) {
        this.callbacks.push({
          onResolved: value => {
            try {
              let result = onResolved(value)
              if (result instanceof myPromise) {
                //判断是否返回的是一个新的promise
                result.then(value => {
                  resolve(value)
                }, reason => {
                  reject(reason)
                })
              } else {
                //如果是普通值 则直接交给下一个then处理
                //链式调用的then默认是成功的
                resolve(result)
              }
            } catch (error) {
              reject(error)
            }

          }
          , onRejected: value => {
            try {
              let result = onRejected(value)
              resolve(result)
            } catch (error) {
              reject(error)
            }

          }
        })
      }
      //根据promise的状态不同执行不同的回调
      if (this.status == myPromise.FIFILLED) {
        //放到异步队列里异步执行
        setTimeout(() => {
          //如果执行onResolved回调时出错要交给下一个then的reject
          try {
            //获取本次then回调的结果
            let result = onResolved(this.value)
            if (result instanceof myPromise) {
              //判断是否返回的是一个新的promise
              result.then(value => {
                resolve(value)
              }, reason => {
                reject(reason)
              })
            } else {
              //如果是普通值 则直接交给下一个then处理
              //链式调用的then默认是成功的
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
        });
      }
      if (this.status == myPromise.REJECTED) {
        //放到异步队列里异步执行
        setTimeout(() => {
          //如果执行onRejected回调时出错要交给下一个then的reject
          try {
            //获取本次then回调的结果
            let result = onRejected(this.value)
            if (result instanceof myPromise) {
              //判断是否返回的是一个新的promise
              result.then(value => {
                resolve(value)
              }, reason => {
                reject(reason)
              })
            } else {
              //如果是普通值 则直接交给下一个then处理
              //链式调用的then默认是成功的
              resolve(result)
            }
          } catch (error) {
            reject(error)
          }
        });

      }

    })

  }

  static resolve (value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        //传入的value为一个promise
        value.then(resolve, reject)
      } else {
        resolve(value)
      }
    })
  }

  static reject (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  static all (promiseList) {
    //用来存放每个promise的value
    let values = []
    return new Promise((resolve, reject) => {
      promiseList.forEach(promise => {
        promise.then(value => {
          //成功的话把value压入values中
          values.push(value)
          //如果values的长度和promiseList长度相等则全部处理完毕
          if (values.length == promiseList.length) {
            resolve(values)
          }
        }, reason => {
          //如果任何一个promise调用失败的函数,则让返回的新的promise调用reject变成失败状态
          reject(reason)
        })
      })
    })
  }

  static race (promiseList) {
    return new Promise((resolve, reject) => {
      promiseList.forEach(promise => {
        promise.then(value => {
          resolve(value)
        }, reason => {
          reject(reason)
        })
      })
    })
  }
}
let p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(2412)
  }, 5000);

})
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(312)

  }, 1000);
})
let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(3123)
  }, 500);
})
let newp = myPromise.race([p, p1, p2]).then(value => {
  console.log("成功" + value);
}, reason => {
  console.log("失败" + reason)
})