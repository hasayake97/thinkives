/**
 * @file handler
 * @Author luo
 * @Date 2021-09-08 10:27:34
 */

import { isType } from './index'

const getKeyPath = keyPath => {
  return keyPath ? { keyPath } : { autoIncrement: true }
}

const multipleHandler = (r, data, mode) => {
  return new Promise((resolve, reject) => {
    let request = null

    if (Array.isArray(data)) {
      const result = []
      const main = () => {
        const [item] = data.splice(0, 1)

        if (!item) {
          resolve({ mode, result, statu: 'done' })

          return
        }

        request = r[mode](item)

        request.onsuccess = ev => {
          ev.target.result && result.push(ev.target.result)

          main()
        }
      }

      main()
    } else {
      request = r[mode](data)

      request.onsuccess = ev => {
        resolve({
          mode,
          statu: ev.target.readyState,
          result: ev.target.result || null
        })
      }
    }

    request.onerror = ev => reject({
      mode,
      statu: ev.target.error.message,
      result: ev
    })
  })
}

const core = function(mode, data, tableName) {
  const type = ['Object', 'Array', 'Number', 'String']
  const tName = tableName || this.getTName()

  return new Promise((resolve, reject) => {
    if (isType(data, type)) {
      const request = this.getDB()
        .transaction([tName], 'readwrite')
        .objectStore(tName)

      multipleHandler(request, data, mode)
        .then(ev => resolve(ev))
        .catch(reject)
    } else {
      reject(new Error(`IDB-ERROR-${mode}: 参数缺失或类型不正确!`))
    }
  })
}

export const handler = function(mode, data, tableName) {
  const handler = () => core.call(this, mode, data, tableName)

  this.registers({
    action: mode,
    handler
  })

  return this
}

const existOsName = function(name) {
  return this.getDB().objectStoreNames.contains(name)
}

/**
 * 创建 Table
 * @param {*} tableName
 * @param {*} keyPath
 * @returns
 */
export const createHandler = function (name, primaryKey) {
  const _tableName = name || this.getTName()

  const handler = () => new Promise((resolve, reject) => {
    if (existOsName.call(this, _tableName)) {
      this.tName = _tableName

      resolve()
    } else {
      const _keyPath = getKeyPath(primaryKey)

      const { transaction } = this.getDB().createObjectStore(_tableName, _keyPath)

      transaction.oncomplete = () => {
        this.tName = _tableName
        this.primaryKey = _keyPath

        resolve()
      }

      transaction.onabort = () => reject(new Error('IDB-ERROR-CREATE: 新建数据库失败!'))
    }
  })

  this.registers({
    action: 'table',
    handler
  })

  return this
}

const cursorAll = function() {
  return new Promise((resolve, reject) => {
    const all = []
    const tName = this.getTName()
    const request = this
      .getDB()
      .transaction(tName)
      .objectStore(tName)
    const openCursor = request.openCursor()

    openCursor.onsuccess = ev => {
      const cursor = ev.target.result

      if (cursor) {
        all.push(cursor.value)

        cursor.continue()
      } else {
        resolve(all)
      }
    }

    openCursor.onerror = ev => reject(ev)
  })
}

export const getAllHandler = function() {
  this.registers({
    action: 'getAll',
    handler: cursorAll.bind(this)
  })

  return this
}

export const clearHandler = function() {
  const handler = () => new Promise((resolve, reject) => {
    const tName = this.getTName()
    const request = this.getDB()
      .transaction([tName], 'readwrite')
      .objectStore(tName)

    const { transaction } = request.clear()

    transaction.oncomplete = ev => resolve({
      statu: 'done',
      mode: 'clear',
      result: ev
    })

    transaction.onerror = err => reject({
      statu: 'error',
      mode: 'clear',
      resut: err
    })
  })

  this.registers({
    action: 'clear',
    handler
  })

  return this
}

/**
 * @description 批量创建表
 * @param {*} configs
 * @return {*}
 */
export const batchCreateTableHandler = function(configs) {
  const handler = () => new Promise((resolve, reject) => {
    if (isType(configs, 'Array')) {
      const db = this.getDB()
      const batchCreateList = configs.filter(item => !existOsName.call(this, item.name))

      if (batchCreateList.length) {
        batchCreateList.forEach(item => {
          const { transaction } = db.createObjectStore(item.name, getKeyPath(item.keyPath))

          transaction.oncomplete = resolve

          transaction.onabort = () => reject(new Error(`IDB-ERROR-BATCH-CREATE: 新建数据库 ${item.name} 失败!`))
        })
      } else {
        resolve()
      }
    } else {
      reject({
        mode: 'batch-create',
        statu: 'error',
        result: new Error('IDB-ERROR-OPEN: 批量创建时参数期望是一个数组!')
      })
    }
  })

  this.registers({
    action: 'batchCreate',
    handler
  })

  return this
}

/**
 * @description 执行已注册的方法
 * @param {*} cb
 * @return {*}
 */
export const execHandler = function(cb, abnormal) {
  const main = prev => {
    const [t] = this.tasks.splice(0, 1)

    if (!t) {
      cb && cb(prev)

      return
    }

    t.handler()
      .then(res => main(res))
      .catch((error) => {
        this.tasks = []

        abnormal && abnormal(error)

        throw error
      })
  }

  main()
}
