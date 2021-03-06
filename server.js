'use strict';

// Application Dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// Application Setup
const app = express();
app.use(cors());
const PORT = process.env.PORT;
if(!process.env.DATABASE_URL) {
throw new Error('Missing database URL.');
}
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

// Route Definitions
app.get('/location', locationHandler);	
app.get('/', rootHandler);
app.get('/yelp', restaurantHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
function rootHandler(request, response) {
response.status(200).send('City Explorer back-end');
}

function locationHandler(request, response) {
  const city = request.query.city;
  const url = 'https://us1.locationiq.com/v1/search.php';
  superagent.get(url)
    .query({
      key: process.env.LOCATION_KEY,
      q: city,
      format: 'json'
    })
    .then(locationIQResponse => {
      const topLocation = locationIQResponse.body[0];
      const myLocationResponse = new Location(city, topLocation);
      response.status(200).send(myLocationResponse);
    })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    })
  }

function restaurantHandler(request, response) {
      const lat = parseFloat(request.query.latitude);
      const lon = parseFloat(request.query.longitude);
      const currentPage = request.query.page;
      const numPerPage = 4;
      const start = ((currentPage - 1) * numPerPage + 1);
      const url = 'https://api.yelp.com/v3/businesses/search';
      superagent.get(url)
      .query({
        latitude: lat,
        longitude: lon,
        limit: numPerPage,
        offset: start
      })
  .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
  .then(yelpResponse => {
    const arrayOfRestaurants = yelpResponse.body.businesses;
    const restaurantsResults = [];
    arrayOfRestaurants.forEach(restaurantObj => {
      restaurantsResults.push(new Restaurant(restaurantObj));
    });
    response.send(restaurantsResults);
   })
    .catch(err => {
      console.log(err);
      errorHandler(err, request, response);
    })
  }

function weatherHandler (request, response) {
  const latitude =parseFloat(request.query.latitude);
  const longitude =parseFloat(request.query.longitude);
  const url = 'https://api.weatherbit.io/v2.0/forecast/daily';
  superagent.get(url)
  .query({
    key: process.env.WEATHER_API_KEY,
    lat: latitude,
    lon: longitude
  })
  .then(weatherResponse => {
    const arrayOfWeather = weatherResponse.body.data;
    const weatherResults = [];
    arrayOfWeather.forEach(weatherObj => {
    weatherResults.push(new Weather(weatherObj));
    });
    response.send(weatherResults);
  })
  .catch(err => {
    console.log(err);
    errorHandler(err, request, response);
  })
}

function trailHandler (request, response) {
  const latitude = parseFloat(request.query.latitude);
  const longitude = parseFloat(request.query.longitude);
  const url = 'https://www.hikingproject.com/trail/7011192/boulder-skyline-traverse';
  superagent.get(url)
  .query({
    key: process.env.TRAILS_API_KEY,
    lat: latitude,
    lon: longitude
  })
  .then(trailHandler => { 
   const arrrayOfTrails = trailHandler.body.trails;
   const trailResults = [];
   arrrayOfTrails.forEach(trail => {
     trailResults.push(new Trails(trail));
   });
   response.send(trailResults);
})
.catch(err => {
  console.log(err);
  errorHandler(err, request, response);
})}

function notFoundHandler(request, response) {
  response.status(404).send('Not found');
}
function errorHandler(error, request, response) {
  response.status(500).json({ error: true, message: error.message });
}
// Constructors
function Location(city, location) {
  this.search_query = city;
  this.formatted_query = location.display_name;
  this.latitude = parseFloat(location.lat);
  this.longitude = parseFloat(location.lon);
}
  function Restaurant(obj) {
    this.name = obj.name;
    this.url = obj.url;
    this.rating = obj.rating;
    this.price = obj.price;
    this.image_url = obj.image_url;
} 
  function Weather(weatherObj) {
    this.time = weatherObj.valid_date;
    this.forecast = weatherObj.weather.description; 
  }
  function Trails(trail) {
    this.id = trail.id;
    }

// Make sure the server is listening for requests
client.connect()
  .then(() => {
    console.log('Postgres connected.');
    app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => {
    throw `Postgres error: ${err.message}`;
  })

