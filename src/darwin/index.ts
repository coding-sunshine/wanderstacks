import { mountLiving, type LivingSpec } from '../living'
import spec from '../../data/living/darwin.json'
import type { Mount } from '../types'

export const mount: Mount = (el) => mountLiving(el, spec as LivingSpec, 'darwin')
