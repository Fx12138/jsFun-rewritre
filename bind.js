Function.prototype.bind2 = function (newThis) {
  let self = this
  //获取调用bind函数时传入的第二个参数以后的
  let args = Array.prototype.slice.call(arguments, 1);


  let bindFun = function () {
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

//测试
var value = 2;
var foo = {
  value: 1
};

function bar (name, age) {
  this.habit = 'shopping';
  console.log(this.value);
  console.log(name);
  console.log(age);
}

bar.prototype.friend = 'kevin';
var bindFoo = bar.bind2(foo, 'daisy');
var obj = new bindFoo('18');
console.log(obj.habit);
console.log(obj.friend);