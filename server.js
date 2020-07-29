'use strict';

// Application Dependencies
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { response } = require('express');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Route Definitions
app.get('/location', locationHandler);	
app.get('/', rootHandler);
app.use('*', notFoundHandler);
app.get('/yelp', restaurantHandler);
app.use(errorHandler);

// Route Handlers
function locationHandler(request, response) {
  const city = request.query.city;
  const locationData = require('./data/location.json');
  const location = new Location(city, locationData);
  response.status(200).send(location);
}
function locationaHandler(request, response) {
  const city =request.query.city;
  const url = https://usl.locationiq.com/v1/search.php';

}
function restaurantHandler(request, response) {
  const restaurantsData = require('./data/restaurants.json');
  const arrayOfRestaurants = restaurantsData.nearby_restaurants;
  arrayOfRestaurants.forEach(restaurantObj => {   
  });
}
function notFoundHandler(request, response) {
  response.status(404).json({ notFound: true });
  const arrayOfResturants = locationData.nearby_restaurants;
  arrayOfRestaurants.forEach(restaurant)

}
response.send(restaurantResults); 

function errorHandler(error, request, response, next) {
  response.status(500).json({ error: true, message: error.message });
}
//Helper Functions
  // Constructors
  function Location(city, locationData) {
    this.search_query = city;
    this.formatted_query = locationData[0].display_name;
    this.lat = parseFloat(locationData[0].lat);
    this.lon = parseFloat(locationData[0].lon);
  } 
  function Restaurant(restaurantsData)
  this.url = restruantData.url;
  this.name = restaurantsData.name;
  this.rating = restaurantsData.user_rating.aggerate_rating;
  this.price = restaurantsData.price_range;
  this.image_url = restruants.featured_image;
// App listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));