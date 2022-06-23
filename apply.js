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

//测试
function sum (a, b) {
  console.log(this);
  return a + b
}
let zhangsan = {
  name: "张三",
  age: 13
}
let res = sum.call(zhangsan, 2, 3)
console.log(res);