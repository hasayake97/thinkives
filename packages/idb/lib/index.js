/**
 * @file index.js
 * @Author luo
 * @Date 2021-09-07 10:21:28
 */

import { isSupportIdb, isType } from './utils'
import {
  handler,
  createHandler,
  execHandler,
  getAllHandler,
  clearHandler,
  batchCreateTableHandler
} from './utils/handler'


class Idb {
  constructor() {
    this.db = null
    this.primaryKey = null
    this.tName = null
    this.tasks = []
  }

  getDB() {
    if (this.db) {
      return this.db
    } else {
      throw new Error('IDB-ERROR-OPEN: 未获取到数据库!')
    }
  }

  getTName() {
    if (this.tName) {
      return this.tName
    } else {
      throw new Error('IDB-ERROR-TNAME: 未找到可操作的表对象!')
    }
  }

  getPrimaryKey() {
    if (this.primaryKey) {
      return this.primaryKey
    } else {
      throw new Error('IDB-ERROR-PRIMARYKEY: 请设置主键索引!')
    }
  }

  registers(handler) {
    this.tasks.push(handler)
  }

  open(name, version) {
    const handler = () => new Promise((resolve, reject) => {
      if (isType(name, 'String')) {
        const request = isSupportIdb().open(name, version)

        request.onupgradeneeded = ev => {
          this.db = ev.target.result

          resolve({
            statu: 'done',
            result: ev.target.result,
            mode: 'open-upgradeneeded'
          })

        }

        request.onblocked = () => {
          console.warn('IDB-INFO-ERROR: 数据库已被锁定!')
        }

        request.onsuccess = () => {
          this.db = request.result

          resolve({
            statu: 'done',
            result: request.result,
            mode: 'open-success'
          })
        }

        request.onerror = ev => reject({
          statu: 'error',
          result: ev,
          mode: 'open-error'
        })

      } else {
        reject({
          mode: 'open',
          statu: 'error',
          result: new Error('IDB-ERROR-OPEN: 数据库名称参数缺失或类型不正确!')
        })
      }
    })

    this.registers({
      action: 'open',
      handler
    })

    return this
  }

  table(...params) {
    return createHandler.call(this, ...params)
  }

  add(...params) {
    return handler.call(this, 'add', ...params)
  }

  put(...params) {
    return handler.call(this, 'put', ...params)
  }

  get(...params) {
    return handler.call(this, 'get', ...params)
  }

  delete(...params) {
    return handler.call(this, 'delete', ...params)
  }

  clear() {
    return clearHandler.call(this)
  }

  close() {
    const handler = resolve => {
      this.getDB().close()

      setTimeout(resolve, 100)
    }

    this.registers({
      action: 'close',
      handler
    })

    return this
  }

  batchCreateTable(configs) {
    return batchCreateTableHandler.call(this, configs)
  }

  getAll() {
    return getAllHandler.call(this)
  }

  exec(cb, abnormal) {
    execHandler.call(this, cb, abnormal)
  }
}

export default Idb
