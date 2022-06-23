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