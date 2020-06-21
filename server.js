'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const { response } = require('express');
const pg = require('pg');
require('ejs');
const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.urlencoded({extended: true}));
app.use('/public', express.static('public'));
app.set('view engine', 'ejs');
app.get('/', getMyPoke);
app.post('/add', addPokeFavorites);
app.get('/favorites', showFavoritePoke);
app.use('*', notFound);



function addPokeFavorites(request, response) {
  let name = request.body.name;
  let sql = 'INSERT INTO poke2_table (name) VALUES ($1);';
  let safeValues = [name];
  client.query(sql, safeValues)
    .then(sqlResults => {
      response.status(200).redirect('/');
    }).catch(error => console.error(error));
}

function getMyPoke(request, response) {
  let url = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20';
  superagent.get(url)
    .then(resultsFromSuperagent => {
      let pokeResultsArray = resultsFromSuperagent.body.results;
      const finalPokeArray = pokeResultsArray.map(poke => {
        return new Pokemon(poke);
      });
      sortPokemon(finalPokeArray);
      response.status(200).render('pages/show.ejs', {
        pokemonToShow: finalPokeArray});
    }).catch(error => console.error(error));
}

function showFavoritePoke(request, response) {
  let sql = 'SELECT * FROM poke2_table ORDER BY name ASC;';
  client.query(sql)
    .then(sqlResults => {
      let poke = sqlResults.rows;
      response.status(200).render('pages/favorites.ejs',
      {favoritePokemon: poke});
    }).catch(error => console.error(error));
}


function notFound(request, response){
  response.status(404).render('pages/error.ejs');
};


function Pokemon(info){
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.name = info.name;
  this.image = placeholderImage;
  this.url = info.url;
};


const sortPokemon = (arr) => {
  arr.sort((a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
  })
}


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    })
  }).catch(error => console.error(error));

  // ghhhh