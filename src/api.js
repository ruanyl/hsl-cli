import fetch from 'node-fetch'

export const addressSearchApi = ({ text = 'Kamppi', size = 1 } = {}) =>
  fetch(`http://api.digitransit.fi/geocoding/v1/search?text=${text}&size=${size}`)
    .then(res => ({ results: res.json() }))

export const routesSearchApi = ({ text = '158', modes = 'BUS' } = {}) => {
  const options = {
    method: 'POST',
    'Content-Type': 'application/graphql',
    body: `
    {
      routes(name: "${text}", modes: "${modes}") {
        id
        agency {
          id
        }
        gtfsId
        shortName
        longName
        desc
        mode
      }
    }
    `,
  }
  return fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options)
    .then(res => ({ results: res.json() }))
}

export const routeStopsApi = ({ id }) => {
  const options = {
    method: 'POST',
    'Content-Type': 'application/graphql',
    body: `
    {
      pattern(id:"${id}:1:01") {
        name
        stops{
          name
        }
      }
    }
    `,
  }
  return fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options)
    .then(res => ({ results: res.json() }))
}

export const searchPlanApi = ({ fromCoordinates, toCoordinates, fromPlace, toPlace }) => {
  const options = {
    method: 'POST',
    'Content-Type': 'application/graphql',
    body: `
    {
      plan(
        fromPlace: "${fromPlace}",
        toPlace: "${toPlace}"
        from: {lat: ${fromCoordinates.lat}, lon: ${fromCoordinates.lon}},
        to: {lat: ${toCoordinates.lat}, lon: ${toCoordinates.lon}},
        modes: "BUS,TRAM,RAIL,SUBWAY,FERRY,WALK",
        walkReluctance: 2.1,
        walkBoardCost: 600,
        minTransferTime: 180,
        walkSpeed: 1.2,
      ) {
        itineraries{
          walkDistance,
          duration,
          legs {
            mode
            startTime
            endTime
            route {
              shortName
              longName
            }
            from {
              lat
              lon
              name
              stop {
                code
                name
              }
            },
            to {
              lat
              lon
              name
            },
            agency {
              id
            },
            distance
            legGeometry {
              length
              points
            }
          }
        }
      }
    }
    `,
  }
  return fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', options)
    .then(res => ({ results: res.json() }))
}
