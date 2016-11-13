import co from 'co'
import ora from 'ora'
import chalk from 'chalk'
import { addressSearchApi, routesSearchApi, routeStopsApi, searchPlanApi } from './api'

export const searchAddress = co.wrap(function* (options) {
  const spinner = ora(`Loading Address Information of ${chalk.green(options.text)}`).start()
  const { results } = yield addressSearchApi(options)
  if (results) {
    spinner.succeed()
  } else {
    spinner.fail()
  }
  return results
})

export const searchRoutes = co.wrap(function* (options) {
  const spinner = ora(`Searching Bus: ${chalk.green(options.text)}`).start()
  const { results } = yield routesSearchApi(options)
  if (results) {
    spinner.succeed()
  } else {
    spinner.fail()
  }
  return results
})

export const routeStops = co.wrap(function* (options) {
  const spinner = ora(`Searching Stops Information of: ${chalk.green(options.id)}`).start()
  const { results } = yield routeStopsApi(options)
  if (results) {
    spinner.succeed()
  } else {
    spinner.fail()
  }
  return results
})

export const searchPlan = co.wrap(function* (options) {
  const spinner = ora(`Searching Trip From: ${chalk.green(options.fromPlace)} To: ${chalk.green(options.toPlace)}`).start()
  const { results } = yield searchPlanApi(options)
  if (results) {
    spinner.succeed()
  } else {
    spinner.fail()
  }
  return results
})
