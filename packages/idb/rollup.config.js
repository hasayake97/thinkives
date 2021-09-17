/**
 * @file config
 * @Author luojun1@thinkive.com
 * @Date 2021-09-17 16:02:18
 */

import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'lib/index.js',

  output: {
    format: 'umd',
    name: 'Idb',
    file: 'dist/idb.umd.js'
  },

  plugins: [
    resolve(),
    terser()
  ]
}