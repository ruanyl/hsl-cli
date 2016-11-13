import 'babel-polyfill'
import co from 'co'
import program from 'commander'
import { cond, isNil, has, last, head, isEmpty, both } from 'ramda'
import { notNil, red, green, log, hasArg } from './helps'

import { searchAddress, searchRoutes, routeStops, searchPlan } from './address'

const printAddress = address => {
  const feature = address.features[0]
  if (isNil(feature)) {
    log(`The Address (${red(address.query.text)}) can not be found`)
  } else {
    log(`Found Address ${green(feature.properties.label)}, Region: ${green(feature.properties.region)}`)
    log(`Coordinate: [${green(feature.geometry.coordinates[0])}, ${green(feature.geometry.coordinates[1])}]`)
  }
}

const doSearchAddress = query => {
  co(function* () {
    const address = yield searchAddress({ text: query })
    return address
  }).then(printAddress)
}

const stopsToText = stops => stops.map(stop => stop.name).join(' => ')

const printBus = bus => {
  if (isEmpty(bus)) {
    log('Can NOT find Bus')
  } else {
    log(`Found Bus ${green(bus.longName)}(${bus.shortName})`)
    if (has('stops')(bus)) {
      log(`From: ${green(head(bus.stops).name)} To: ${green(last(bus.stops).name)}`)
      log(`Stops: ${stopsToText(bus.stops)}`)
    }
  }
}

const doSearchBus = query => {
  co(function* () {
    const routeResults = yield searchRoutes({ text: query, modes: 'BUS' })
    const { data: { routes } } = routeResults
    const route = head(routes)
    let busStops = {}
    if (notNil(route)) {
      const stopResults = yield routeStops({ id: route.gtfsId })
      busStops = stopResults.data.pattern ? { stops: stopResults.data.pattern.stops } : {}
    }
    return Object.assign({}, route, busStops)
  }).then(printBus)
}

const legToText = leg => {
  const mode = leg.mode === 'WALK' ? 'WALK' : `Take ${leg.mode}`
  const from = leg.from.name === 'Origin' ? 'Your Current Location' : leg.from.name
  const to = leg.to.name
  const distanceInKm = Math.round(leg.distance / 1000)
  const distance = distanceInKm ? `${distanceInKm}Km` : `${Math.round(leg.distance)}m`
  const ways = leg.route ? leg.route.shortName : ''
  return `${mode}${ways ? '(' + red(ways) + ')' : ''} From: ${green(from)} To: ${green(to)} (${red(distance)})`
}

const printPlans = plans => {
  plans.data.plan.itineraries.map((itinerarie, i) => {
    log(`Plan ${i + 1}:`)
    const legTexts = itinerarie.legs.map(legToText)
    log(legTexts.join('\n'))
    log('------------------------------------------------------------------')
    return legTexts
  })
}

const doSearchPlan = ({ from, to }) => {
  co(function* () {
    const fromPlace = yield searchAddress({ text: from })
    const toPlace = yield searchAddress({ text: to })
    const fromFeature = fromPlace.features[0]
    const toFeature = toPlace.features[0]
    const searchOptions = {
      fromPlace: fromFeature.properties.label,
      toPlace: toFeature.properties.label,
      fromCoordinates: { lon: fromFeature.geometry.coordinates[0], lat: fromFeature.geometry.coordinates[1] },
      toCoordinates: { lon: toFeature.geometry.coordinates[0], lat: toFeature.geometry.coordinates[1] },
    }
    const planResults = yield searchPlan(searchOptions)
    return planResults
  }).then(printPlans)
}

program
  .version('0.1.0')
  .option('-s, --search [query]', 'Search Address')
  .option('-b, --bus [query]', 'Search Bus')
  .option('-f, --from [query]', 'From Place')
  .option('-t, --to [query]', 'To Place')
  .parse(process.argv)

cond([
  [hasArg('search'), ({ search }) => doSearchAddress(search)],
  [hasArg('bus'), ({ bus }) => doSearchBus(bus)],
  [both(hasArg('from'), hasArg('to')), ({ from, to }) => doSearchPlan({ from, to })],
])(program)
