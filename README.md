# jsFun-rewritre
一些js中函数的手撕

## async/await

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

