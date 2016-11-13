import chalk from 'chalk'
import { compose, isNil, not, isEmpty, prop } from 'ramda'

export const log = console.log
export const green = chalk.green
export const red = chalk.red
export const notEmpty = compose(not, isEmpty)
export const notNil = compose(not, isNil)
export const hasArg = arg => compose(not, isNil, prop(arg))
