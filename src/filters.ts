import { Vue } from 'vue-property-decorator'
import BigNumber from 'bignumber.js'
import { toChecksumAddress } from 'thor-devkit/dist/cry/address'

Vue.filter('shortAddress', (v: string) => {
  return v.substring(0, 8) + '...' + v.substring(v.length - 6, v.length)
})

Vue.filter('toChecksumAddress', (val: string) => {
  return toChecksumAddress(val)
})

Vue.filter('balance', (val: string, decimals?: number) => {
  const x = new BigNumber('1e+' + (decimals || 18))
  const temp = new BigNumber(val)
  return Number(temp.isGreaterThan(0) ? temp.div(x).toString() : 0).toLocaleString(undefined, {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  })
})
