
require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const puppeteerService = require('./services/puppeteer.service');
const MUSTACHE_MAIN_DIR = './main.mustache';

/**
  * DATA is the object that contains all
  * the data to be provided to Mustache
  * Notice the "name" and "date" property.
*/
let DATA = {
  name: 'Archana Sevak',
  date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/Chicago',
  }),
  refresh_date: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/Chicago',
  }),
};

async function setWeatherInformation() {
  try {
   if (!process.env.OPEN_WEATHER_MAP_KEY) {
      console.error('❌ OPEN_WEATHER_MAP_KEY is not defined!');
    } else {
      console.log('✅ API key is set, length:', process.env.OPEN_WEATHER_MAP_KEY.length);
    }
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=4099974&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    );
    
    const r = await res.json();

    if (!res.ok) {
      throw new Error(`API error: ${r.message || res.status}`);
    }

    if (!r.main || !r.weather || !r.sys) {
      throw new Error('Unexpected response structure');
    }

    DATA.city_temperature = Math.round(r.main.temp);
    DATA.city_temperature_f = (r.main.temp - 32) * 5 / 9
    DATA.city_weather = r.weather[0].description;
    DATA.city_weather_icon = r.weather[0].icon;
    DATA.sun_rise = new Date(r.sys.sunrise * 1000).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    });
    DATA.sun_set = new Date(r.sys.sunset * 1000).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Chicago',
    });

  } catch (error) {
    console.error('Failed to fetch weather information:', error.message);
  }
}

/**
  * A - We open 'main.mustache'
  * B - We ask Mustache to render our file with the data
  * C - We create a README.md file with the generated output
  */
function generateReadMe() {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) =>  {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    
    fs.writeFileSync('README.md', output);
  });
}
generateReadMe();

async function action() {
    /**
     * Fetch Weather
     */
    await setWeatherInformation();
  
   
    /**
     * Generate README
     */
    await generateReadMe();
  
  
  }
  
  action();
  
