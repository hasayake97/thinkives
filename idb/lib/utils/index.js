/**
 * @file indexedDb utils
 * @Author luojun1@thinkive.com
 * @Date 2021-09-07 10:54:07
 */

export const isSupportIdb = () => {
  if (!window.indexedDB) {
    throw new SyntaxError('INFO: 当前环境不支持 IndexedDB 操作!')
  }

  return window.indexedDB
}


export const isType = (source, t) => {
  const _toString = _source => Object.prototype.toString.call(_source).slice(8, -1)

  if (Array.isArray(t)) {
    return t.includes(_toString(source))
  } else {
    return _toString(source) === t
  }
}