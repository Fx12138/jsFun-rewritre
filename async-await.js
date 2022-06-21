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

