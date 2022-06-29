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
}

// let p = new myPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(2)
//   }, 1000);
// }).then(value => {
//   console.log(dasdas);
//   return "结果"
// }, reason => {
//   console.log(reason);
//   return "结果"
// }).then(value => {
//   console.log("success!" + value);
// }, reason => {
//   console.log("error!" + reason);
// })

let p2 = new myPromise((resolve, reject) => {
  reject(2)
})
  .then(value => {
    return new myPromise((resolve, reject) => {
      reject('成功')
    })
  }, reason => {
    return new myPromise((resolve, reject) => {
      resolve('失败啦')
    })
  }).then(value => {
    console.log(value);
  }, reason => {
    console.log('失败');
  })