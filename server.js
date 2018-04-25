const express = require('express');
const parser = require('body-parser');
const server = express();  // server is same as app. in our other examples

server.use(parser.json());
server.use(express.static('client/public'));

// const fullMongo = require('mongodb');
// const justMongoClient = fullMongo.MongoClient;   // OR:
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

// asyncronous action, so pass a function for it to run when it is done!!
MongoClient.connect('mongodb://localhost:27017', function (error, connectionToClient) {
  if (error) {  // if no error is passed, it will be null and thus false.
    console.log(error);
    return;
  };

  const db = connectionToClient.db('quotes_app')  // pass in db name... it will connect or create :-)
  console.log('Connected to db, WELL DONE!');
  const quotesCollection = db.collection('quotes');  // tap into the table quotes from the db.

  // CREATE ROUTE!!!!!!!!!!!!!
  server.post('/api/quotes', function (request, response) {
    const newQuote = request.body;   // get quote from body of request from client.
    // asyncronous action, so pass a function for it to run when it is done!!
    quotesCollection.save(newQuote, function (err, result) {
      if (error) { // if no error is passed, it will be null and thus false.
        console.error(err);  // better to catch and do, but for us we'll just log.
        response.status(500); // as return-ending won't do any thing. Need to report something.
        response.send(); // send nothing back, can do null, but all tied up.
        return; // do we need this? does it carry on after send();????
      };
      console.log("SAVED to DB:");

      response.status(201);  // 201 code means "created"
      response.json(result.ops[0]);
      //response.send(); // to send the status. BUT IT GETS SENT in the json above
    });  // insert the quote to the table.
  }); // end server.post


  // INDEX ROUTE!!!!!!
  server.get('/api/quotes', function (req, res) {
    quotesCollection.find().toArray(function (err, result) {
      if (err) {
        console.error(err);
        res.status(500);
        res.send();
        return;
      };
      res.json(result);
      //res.send(); DON't NEED as res.json is SENDing implicitly
    })
  });

// INDEX by ID Route!!!
server.get('/api/quotes/:id', function (req, res) {
  const id = req.params.id;
  const objectID = ObjectID(id);
  quotesCollection.find({ _id: objectID}).toArray(function (err, result) {
    if (err) {
      console.error(err);
      res.status(500);
      res.send();
      return;
    };
    res.json(result);
    //res.send(); DON't NEED as res.json is SENDing implicitly
  })
});


// DESTROY ROUTE!!!!
  server.delete('/api/quotes', function (req, res) {
//    quotesCollection.deleteMany({}, function (req, res) {
//    quotesCollection.deleteMany(null, function (req, res) {
    quotesCollection.deleteMany(function (err, result) {
      if (err) {
        console.error(err);
        res.status(500);
        res.send();
        return;
      };

      res.send(); // use res.send() if nothing to send, but res.json if want to send data back!
    });
  });

// DESTROY by ID ROUTE
server.delete('/api/quotes/:id', function (req, res) {
  const id = req.params.id;
  const objectID = ObjectID(id);
   quotesCollection.deleteMany({ _id: objectID}, function (err, result) {
//    quotesCollection.deleteMany(null, function (err, result) {
  // quotesCollection.deleteMany(function (err, result) {
    if (err) {
      console.error(err);
      res.status(500);
      res.send();
      return;
    };

    res.send(); // use res.send() if nothing to send, but res.json if want to send data back!
  });
});

// UPDATE ROUTE!!!!
  server.put('/api/quotes/:id', function (req, res) {
    const updatedQuote = req.body;

    const id = req.params.id;
    const objectID = ObjectID(id);
    // res.json(objectID); // just for looks

    quotesCollection.update({ _id: objectID }, updatedQuote, function (err, result) {
      if (err) {
        console.error(err);
        res.status(500);
        res.send();
        return;
      };

      res.json(result);
    });
  });


  server.listen(3000, function(){   // Moved this bit till after we have connected to DB so it won't mess up
  console.log("Listening on port 3000");
});
});
