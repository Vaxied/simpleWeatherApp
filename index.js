import { apiKey } from "../secrets.js"

(function () {
  const geocodingBaseUrl = 'http://api.openweathermap.org/geo/1.0/direct?q='
  const dataBaseUrl= 'https://api.openweathermap.org/data/2.5/weather?'
  let cityName = ''
  let country = ''

  const weathersList = {
    'Thunderstorm': 'thunderstorm.svg',
    'Clouds': 'cloud.svg',
    'Drizzle': 'rain.svg',
    'Rain': 'heavy-rain.svg',
    'Snow': 'snow.svg',
    'Clear': 'sun-light.svg',
    'Fog': 'fog.svg',
    'default': 'snow-flake.svg',
  }


  const searchBtn = document.querySelector('.search-btn')
  const cityInput = document.querySelector('.location-input')

  searchBtn.addEventListener('click', sendRequest)
  console.log('started')

  function fetchData (url) {
    return fetch(url)
  }

  function buildQueryForGeoApi () {
    if (!isInputFormatValid(cityInput.value))
    throw new Error('Invalid format')
  cityName = capitalizeCityName(cityInput.value)
  let inputs = cityName.split(', ')
  if(inputs[1])
  {
    cityName = inputs.join(',')
  }
  else {
    cityName = inputs[0]
  }
  let geoQuery = `${cityName}&limit=1&appid=${apiKey}&lang=en`
  cityName = inputs[0]
  return geoQuery
}

function isInputFormatValid (input) {
  if (!cityInput.value)
  throw new Error('Empty string')

if ((/^[A-Za-z\s]+,\s[A-Za-z]+$/.test(input)) || (/^[A-Za-z\s]+$/.test(input)))
return true
}

function capitalizeCityName (name) {
  let cityWords = name.toLowerCase().split(' ')
  // let cityWords = cityInput.value.split(' ')

    for (let i = 0; i < cityWords.length; i++) {
      cityWords[i] = cityWords[i][0].toUpperCase() + cityWords[i].substr(1)
    }

    const capitalizedCityName = cityWords.join(' ')
    return capitalizedCityName
  }

  function buildUrlForGeoApi () {
    let query = buildQueryForGeoApi()
    let url = `${geocodingBaseUrl}${query}`
    return url
  }

  async function buildQueryForCurrentWeatherApi () {
    
    let coordinates = await getLatitudeAndLongitude()
    
    const apiQuery = `lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${apiKey}&units=metric`

    return apiQuery
  }

  async function buildUrlForCurrentWeatherApi () {
    let query = await buildQueryForCurrentWeatherApi()
    let url = `${dataBaseUrl}${query}`

    return url
  }

  async function getLatitudeAndLongitude () {
    let url = buildUrlForGeoApi()

    try {
      const response = await fetchData(url)
      const data = await response.json()
      const latitude = data[0].lat
      const longitude = data[0].lon
      country = data[0].country

      return [latitude, longitude]

    } catch (error) {
      throw new Error (error) 
    }
  }

  async function getWeatherData () {
    
    try {
      const url = await buildUrlForCurrentWeatherApi()
      const response = await fetchData(url)
      const data = await response.json()
      const city = data.name
      const temperature = Math.floor(data.main.temp)
      const mainWeather = data.weather[0].main
      const weatherDescription = data.weather[0].description

      const card = fillComponentData(city, mainWeather,temperature, weatherDescription)
      appendCardElement(card)

    } catch (error) {
      throw new Error (error) 
    }
  }

  function buildCardComponent () {
    // Creating Html elements
    const cardElement = document.createElement('div')
    const locationName = document.createElement('span')
    const locationCountry = document.createElement('span')
    const locationTemp = document.createElement('span')
    const degrees = document.createElement('span')
    const weatherIconContainer = document.createElement('div')
    const weatherIcon = document.createElement('img')
    const weatherDesc = document.createElement('span')

    // Adding classes
    cardElement.classList.add('forecast')
    locationName.classList.add('location-name')
    locationCountry.classList.add('location-country')
    locationTemp.classList.add('location-temperature')
    degrees.classList.add('temp-degrees')
    weatherIconContainer.classList.add('weather-icon-container')
    weatherIcon.classList.add('weather-icon')
    weatherDesc.classList.add('weather-description')

    weatherIconContainer.append(weatherIcon)

    cardElement.append(locationName, locationCountry, locationTemp, degrees, weatherIconContainer, weatherDesc)

    return cardElement
  }

  function fillComponentData (city, weather, temperature, description) {
    const card = buildCardComponent()
    card.children[0].textContent = cityName
    card.children[1].textContent = country
    card.children[2].textContent = `${temperature}`
    card.children[3].textContent = '°c'
    const weatherIcon = selectWeatherIcon(weather)
    card.children[4].firstElementChild.src = `./icons/${weatherIcon}`
    card.children[5].textContent = description[0].toUpperCase() + description.slice(1)

    cityInput.value = ''

    return card
  }

  function selectWeatherIcon (weather) {
    return weathersList[weather] ? weathersList[weather]: weathersList['default']
  }

  function appendCardElement (component) {
    const app = document.querySelector('#mount')
    app.append(component)
  }

  function sendRequest () {
    getWeatherData()
  }

})()