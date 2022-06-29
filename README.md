# jsFun-rewritre
一些js中函数的手撕

- [call](#call)

- [bind](#bind)
- [async/await](#async-await)

## call

call主要用于改变函数执行时的this指向,参数依次从第二个参数开始传参即可

### 基本使用

```js
var person = {
  fullName: function(city, country) {
    return this.firstName + " " + this.lastName + "," + city + "," + country;
  }
}
var person1 = {
  firstName:"Bill",
  lastName: "Gates"
}
person.fullName.call(person1, "Seattle", "USA");// 将返回 "Steve Jobs,Seattle,USA"
```

### 实现call手撕

```js
Function.prototype.mycall = function (newThis, ...args) {
  //第一步 对传进来的newThis进行处理,如果没传的话默认为window
  newThis = newThis ? Object(newThis) : window;
  //第二步 对newThis绑定调用call的函数
  newThis.fn = this
  //第三步 将调用函数得到的结果返回
  let res = newThis.fn(...args)
  delete newThis.fn
  return res
}
```

## apply

apply和call的区别就apply传参时在第二个参数传入一个包含所有参数的数组

### 实现

```js
Function.prototype.myapply = function (newThis, args) {
  //第一步 处理newThis
  newThis = newThis ? Object(newThis) : window;
  //第二步 为newThis添加调用apply的方法
  newThis.fn = this
  //第三步 调用方法并返回结果
  let res = newThis.fn(...args)
  delete newThis.fn
  return res
}
```



## bind

### 基本使用

bind函数应该都很熟悉了,调用bind函数会返回一个新的函数,调用时的第一个参数是调用函数新的this,后面的参数是传入的参数.

```js
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(this.value);
    console.log(name);
    console.log(age);

}

var bindFoo = bar.bind(foo, 'daisy');
bindFoo('18');
// 1
// daisy
// 18
```

通过上面的例子可以看到,bar函数需要传 name 和 age 两个参数，竟然还可以在 bind 的时候，只传一个 name，在执行返回的函数的时候，再传另一个参数 age!

### 模拟实现

不急，我们用 arguments 进行处理,首先获取调用bind函数时传入的第二个参数和后面的参数,然后再获取调用bind的返回函数时传入的参数,将两部分参数合并为一个数组就是所有要传入的参数了

```js
Function.prototype.bind2 = function (context) {
    var self = this;
    // 获取bind2函数从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);

    return function () {
       // 这个时候的arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(context, args.concat(bindArgs));
    }

}
```

这个时候已经实现了大部分功能.但是bind函数还有一个特点:

一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。举个例子

```js
var value = 2;
var foo = {
    value: 1
};

function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';
var bindFoo = bar.bind(foo, 'daisy');
var obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin
```

注意：尽管在全局和 foo 中都声明了 value 值，最后依然返回了 undefind，说明绑定的 this 失效了，如果大家了解 new 的模拟实现，就会知道这个时候的 this 已经指向了 obj。

### 实现bind手撕

所以我们可以通过修改返回的函数的原型来实现，让我们写一下：

```js
Function.prototype.bind2 = function(newThis){
	let self = this
	//获取调用bind函数时传入的第二个参数以后的
	let args = Array.prototype.slice.call(arguments, 1);

	
	let bindFun = function(){
		//获取调用bind的返回函数时传入的参数
		let bindArgs = Array.prototype.slice.call(arguments)
		
		// 当作为构造函数时，this 指向实例，此时结果为 true，将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
        // 以上面的是 demo 为例，如果改成 `this instanceof bindFun ? null : newThis`，实例只是一个空对象，将 null 改成 this ，实例会具有 habit 属性
        // 当作为普通函数时，this 指向 window，此时结果为 false，将绑定函数的 this 指向 newThis
        return self.apply(this instanceof bindFun ? this : newThis, args.concat(bindArgs));
	}
	// 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
    bindFun.prototype = this.prototype;
    return bindFun;
}
```



## async-await

### 基本使用

async/await大致作用就像是以同步的编码方式完成异步的操作,他是promise的语法糖,下面演示一下基本的用法

```js
//一个生成新的promise的方法
function promiseFn(num){
	return new Promise((resolve,reject)=>{
		setTimeout(()=>{
			resolve(num*2)
		})
	})
}

async function sayhi(){
	let num1 = await promiseFn(1)
    let num2 = await promiseFn(num1)
    return num2
}
console.log(sayhi())	//Promise
sayhi().then(res=>console.log(res))	//4

```

这样两个promise会以此执行,当第一个promise完成后才会执行第二个promise,所以后面的promise可以用前面promise的结果.sayhi执行后返回的是一个promise

### Generator函数

Generator函数和普通函数写法上的区别就是多了个*,在Generator函数中可以使用yield控制暂停节点,每次执行next函数会往下运行到下一个yield暂停节点,next函数返回一个带有value和done属性的对象,其中value是yield后面的值,done是标记Generator函数是否执行完毕

yield后面接函数的话会立即执行这个函数,得到他的返回值.后面接promise的话会得到这个promise.

yield自身没有返回值,重要的一点是next可以传参,传入的参数会当做上一个yield的返回值

```js
function* gen() {
  const num1 = yield 1
  console.log(num1)
  const num2 = yield 2
  console.log(num2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next(11111))
// 11111
//  { value: 2, done: false }
console.log(g.next(22222)) 
// 22222
// { value: 3, done: true }
```

### 模拟async

下面使用promise+generator函数+next传参模拟一下async的过程

```js
//返回新的promise的函数,模仿异步操作
function promiseFn (num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num * 2)
    }, 1000)
  })
}

//generator函数
function* generatorFn () {
  let num1 = yield promiseFn(1)
  console.log(num1);
  let num2 = yield promiseFn(num1)
  console.log(num2);
  return num3
}

let gen = generatorFn()
gen.next().value.then(res1=>{
    //获取第一个promise并then
    console.log(res1)	//2
    
    gen.next(res1).value.then(res2=>{
        console.log(res2)	//4
        
        console.log(gen.next(res2))	//输出 { value: 4, done: true }
    })
})
```

### 实现async/await手撕

上面的模拟过程其实已经实现了async的功能,但是主要是我们手动的有多少个yield就写了多少个next,他可能有很多个我们不确定,因此需要让其自己去实现自动

```js
//返回新的promise的函数,模仿异步操作
function promiseFn (num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(num * 2)
    }, 1000)
  })
}

function* generatorFn () {
  let num1 = yield promiseFn(1)
  console.log(num1);
  let num2 = yield promiseFn(num1)
  console.log(num2);
  let num3 = yield promiseFn(num2)
  console.log(num3);
  return num3
}

//需要传入一个generator函数
function generatorToAsync (generatorFn) {
  return function () {
    let gen = generatorFn.apply(this, arguments) //得到了一个iterater

    return new Promise((resolve, reject) => {

      function go (key, arg) {
        let res
        try {
          res = gen[key](arg)
        } catch (err) {
          return reject(error)
        }

        let { value, done } = res  //获得每次next后结果的value和done
        if (done) {
          //done为true,说明已经完成则resolve(value)返回结果
          return resolve(value)
        } else {
          //done为false,说明还要继续执行
          return Promise.resolve(value).then(res => {
            go('next', res)
          }, reason => {
            go('throw', reason)
          })
        }

      }
      go('next')  //第一次执行,不带参数
    })

  }
}

let asyncGen = generatorToAsync(generatorFn)
let asyncRes = asyncGen() //2 4 8 间隔一秒
console.log(asyncRes);  //Promise { <pending> }
asyncRes.then(res => console.log(res))  //8

```

## Promise

promise是js中很重要的一个知识点,也是经常使用的.这里就不介绍他的基本使用了,因为太复杂了,要介绍的话已经可以单独开一个章节介绍了下面直接开始手撕思路

首先大家都知道promise有三种状态,在new一个promise的时候需要传入一个函数执行,并且一旦resolve或者reject改变了promise的状态后,就不能再次进行改变了,也就是说promise的状态一旦变成fufilled或rejected就不会再改变通过这些特性我们可以写出下面的代码

```js
class myPromise {
  static PENDING = 'pending'
  static FIFILLED = 'fufilled'
  static REJECTED = 'rejected'
  //传入的executor即new Promise时传入的(resolve,reject)=>{}
  constructor(executor) {
    //初始时默认状态为pending
    this.status = myPromise.PENDING
    this.value = null;

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
    }
  }

  reject (reason) {
    if (this.status == myPromise.PENDING) {
      this.status = myPromise.REJECTED
      this.value = reason
    }
  }
}

let p = new myPromise((resolve, reject) => {
  console.log(isdioa);
  resolve("解决")
})
console.log(p);
```

### then

下面根据then的基本用法可以写出一个雏形的then

```js
  then (onResolved, onRejected) {
    //当没传onResolved或onRejected时也能执行,不报错
    if (typeof onResolved != "function") {
      onResolved = () => { }
    }
    if (typeof onRejected != "function") {
      onRejected = () => { }
    }
    //根据promise的状态不同执行不同的回调
    if (this.status == myPromise.FIFILLED) {
      //放到异步队列里异步执行
      setTimeout(() => {
        //如果执行onResolved回调时出错也要交给onRejected
        try {
          onResolved(this.value)
        } catch (error) {
          onRejected(error)
        }
      });
    }
    if (this.status == myPromise.REJECTED) {
      //放到异步队列里异步执行
      setTimeout(() => {
        //如果执行onRejected回调时出错也要交给onRejected
        try {
          onRejected(this.value)
        } catch (error) {
          onRejected(error)
        }
      });

    }
  }
```

现在有一个问题,就是then方法是直接调用的,但是如果newpromise时传入的函数里在异步操作中改变的status的状态,这时候会直接执行then,那么这时的status还是pending则不会执行,当异步中status更改了,then中的回调方法并不能知道状态改变而执行

我们可以定义一个回调数组,如果then执行时status是pending状态,则将回调加入到数组中,并在resolve或reject中遍历回调数组从而执行,这时我们自己写的promise已经成了下面的样子,注意看第10 28 29 30 39 40 41 53 54 55行为上述新增操作

```js
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
      onResolved = () => { }
    }
    if (typeof onRejected != "function") {
      onRejected = () => { }
    }
    //如果status状态是pending的话,则把onResolved和onRejected函数压入callbacks
    if (this.status == myPromise.PENDING) {
      this.callbacks.push({ onResolved, onRejected })
    }
    //根据promise的状态不同执行不同的回调
    if (this.status == myPromise.FIFILLED) {
      //放到异步队列里异步执行
      setTimeout(() => {
        //如果执行onResolved回调时出错也要交给onRejected
        try {
          onResolved(this.value)
        } catch (error) {
          onRejected(error)
        }
      });
    }
    if (this.status == myPromise.REJECTED) {
      //放到异步队列里异步执行
      setTimeout(() => {
        //如果执行onRejected回调时出错也要交给onRejected
        try {
          onRejected(this.value)
        } catch (error) {
          onRejected(error)
        }
      });
    }
  }
}
```

这时的then还不能进行链式调用.所以then方法需要返回一个新的promise以实现链式调用.并且根据原生的promise,链式的then默认是成功的,then中return的值会成为链式then中的value,所以需要在执行onresolved和onrejected时获取结果,并resolve(获取的结果) 从而传给链式的then.同时在callback里压入的函数也要做相应的处理.此时还有一点是then中如果发生错误的话应该交由链式then的onrejected来处理.所以需要将不同状态处理中catch时进行reject(error) 因为这个reject时返回的新promise的reject.同时在callback里压入的函数也要做相应的处理.

此时的promise如下.主要看65-71 81-87 93-100行

```js
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
      onResolved = () => { }
    }
    if (typeof onRejected != "function") {
      onRejected = () => { }
    }

    //返回一个新的promise以实现链式调用
    return new myPromise((resolve, reject) => {
      //如果status状态是pending的话,则把onResolved和onRejected函数压入callbacks
      if (this.status == myPromise.PENDING) {
        this.callbacks.push({
          onResolved: value => {
            let result = onResolved(value)
            resolve(result)
          }
          , onRejected: value => {
            let result = onRejected(value)
            resolve(result)
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
            //链式调用的then默认是成功的
            resolve(result)
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
            resolve(result)
          } catch (error) {
            reject(error)
          }
        });
      }
    })
  }
}

let p = new myPromise((resolve, reject) => {
  setTimeout(() => {
    reject(2)
  }, 1000);
}).then(value => {
  console.log(value);
  return "结果"
}, reason => {
  console.log(reason);
  return "结果"
}).then(value => {
  console.log("success!" + value);
}, reason => {
  console.log("error!" + reason);
})

```

原生的promise在then中可以返回一个新的promise并在下一个then中接收相应的结果,但是我们现在写的promise返回新的promise的话在下一个then中得到的只是一个promise,并不是resolve的结果.所以需要对返回的结果进行判断

```js
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
```

在准备和拒绝里面做同样的判断操作.一个大致的promise就完成了,完整代码如下

```js
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
```

### Promise.resolve

Promise.resolve也需要判断value值是普通值还是一个promise然后分别进行处理

```js
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
```

### Promise.reject

reject永远返回失败结果

```js
  static reject (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }
```

### Promise.all

all方法返回的也是一个promise,他接收一个promise数组,只有数组中所有的promise均是成功状态的时候,返回的新的promise才是成功状态.如果数组中有任何一个是失败状态,则新返回的promise

```js
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
```

