/**
 * @file indexedDb utils
 * @Author luo
 * @Date 2021-09-07 10:54:07
 */

export const isSupportIdb = () => {
  const idb = indexedDB || window.indexedDB || global.indexedDB || self.indexedDB

  if (!idb) {
    throw new SyntaxError('INFO: 当前环境不支持 IndexedDB 操作!')
  }

  return idb
}


export const isType = (source, t) => {
  const _toString = _source => Object.prototype.toString.call(_source).slice(8, -1)

  if (Array.isArray(t)) {
    return t.includes(_toString(source))
  } else {
    return _toString(source) === t
  }
}