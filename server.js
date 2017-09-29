const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.enable('trust proxy');
app.use(cors());

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
const datastore = Datastore({
  projectId: 'weather-181322'
});

/**
 * Insert a location record into the database.
 *
 * @param {object} location The location record to insert.
 */
function insertLocation (location) {
  return datastore.save({
    key: datastore.key('location'),
    data: location
  });
}

/**
 * Retrieve the latest 10 locations records from the database.
 */
function getLocations (query) {
  const keywords = query.split(' ');
  const dsQuery = datastore.createQuery('location')
    .limit(10);

  keywords.forEach(keyword => {
    dsQuery.filter('keywords', '=', keyword);
  });

  return datastore.runQuery(dsQuery)
    .then((results) => {
      const entities = results[0];
      return entities;
    });
}

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// api routes for location
app.get('/locations/:query', (req, res) => {
  getLocations(req.params.query).then(results => {
    res.status(200).send(results);
  });
});

app.post('/locations', (req, res) => {
  insertLocation(req.body).then(saved => {
    res.status(201).send(saved);
  });
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
