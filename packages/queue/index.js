/**
 * @file queue
 * @Author czj
 * @Date 2021-09-27 09:46:30
 */


/**
 * 创建循环队列
 */
class Queue {
  constructor(maxCount = 3) {
    this.maxCount = maxCount;
    this.list = [];
    this.taskList = [];
    this.ArrayProto();
  }
  /**
   * 向队列中添加对应的任务
   * @param {*} fn
   */
  addTasks(fn, data, func) {
    this.taskList.push({ fn, data, func });
  }
  /**
   * 向队列中添加对应的任务
   * @param {*} i
   */
  delTasks(i) {
    this.taskList.splice(i, 1);
  }
  /**
   * 队列执行任务
   */
  tasksPerform({ fn, data, func }, i) {
    fn(data).then(result => {
      func(result, this.delTasks.bind(this, i));
    });
  }
  /**
   * 创建自定义数组对象 - 用于监听当前数组是否发生变化
   */
  ArrayProto() {
    // 创建this指向用于在function中使用对应的对象
    let _this = this;
    let arrayMethods = Object.create(Array.prototype);
    // 创建一个新的原型，这就是改造之后的数组原型
    let ArrayProto = [];
    // 重新构建Array原型里面的虽有方法
    Object.getOwnPropertyNames(Array.prototype).forEach(method => {
      if (typeof arrayMethods[method] === "function") {
        ArrayProto[method] = function () {
          // 添加事件
          if (method == "push") {
            // 如果当前运行中任务队列少于对应的数组则添加到指定的任务队列中 - 此时push还未添加
            if (this.length + 1 <= _this.maxCount) {
              _this.tasksPerform(arguments[0], this.length);
              return arrayMethods[method].apply(this, arguments);
            } else {
              // 如果已满则添加到待定组中
              return _this.list[method].apply(_this.list, arguments);
            }
          }
          // 删除事件 - splice = 非固定队列删除
          if (method == "splice") {
            // 待定组中存在对应的数组则将其添加至当前数组
            if (_this.list.length > 0) {
              setTimeout(() => { this.push(_this.list.shift()); })
            }
            return arrayMethods[method].apply(this, arguments);
          }
        }
      } else {
        ArrayProto[method] = arrayMethods[method]
      }
    });
    this.taskList.__proto__ = ArrayProto;
  }
}


export default Queue;