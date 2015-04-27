var express = require('express');
var app = express();
var amazon = require('amazon-product-api');



config = require('./config');

var client = amazon.createClient({
  awsId: config.amazon.awsId,
  awsSecret: config.amazon.awsSecret,
  awsTag: config.amazon.awsTag
});


var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({
  extended: false
});
var parseJson = bodyParser.json();

var logger = require('./logger');
app.use(logger);


//app.use(bodyParser.json());

// middleware => use
app.use(express.static('public'));


app.get('/search', function (request, response) {
  var paramsObj = {
    q: request.param('q')
  };
  console.log("SEARCH: " + request.param('q'));

  client.itemSearch({
    keywords: request.param('q'),
    searchIndex: 'Books',
    responseGroup: 'Medium,Images'
  }).then(function (results) {
    console.log("GOT RESULTS");
    //console.log(JSON.stringify(results, null, '\t'));
    response.status(201).json(results);
  }).catch(function (err) {
    console.log("GOT ERROR");
    console.log(JSON.stringify(err, null, '\t'));
    response.status(404).json(results);
  });
});

app.get('/lookup', function (request, response) {

  var paramsObj = {
    q: request.param('q')
  };
  console.log("SEARCH: " + request.param('q'));

  client.itemLookup({
      idType: 'ASIN',
      itemId: request.param('q').replace(/,/g, '%2C'), // 4/26 got this from amazon-product-api.utils.js
      condition: 'All',
      responseGroup: 'Similarities,Medium'
    }, function (err, results) {
      // response.status(201).json(results);
      var asins = [];
      var similarProd = results[0].SimilarProducts[0].SimilarProduct
      for (var i = 0; i < similarProd.length; i++) {
        asins.push(similarProd[i].ASIN);
      }
      console.log('ASINs: ', asins.join(','));


      client.itemLookup({
        idType: 'ASIN',
        itemId: asins.join(',').replace(/,/g, '%2C'), // 4/26 got this from amazon-product-api.utils.js
        condition: 'All',
        responseGroup: 'Medium'
      }, function (err, results) {
        response.status(201).json(results);
        if (err) {
          console.log(JSON.stringify(err, null, '\t'));
        } else {
          //console.log(results);
        }
      });
        if (err) {
      console.log(JSON.stringify(err, null, '\t'));
    } else {
      //console.log(results);
    }
  });

});






app.listen(3000, function () {
  console.log('Listening on port 3000');
});