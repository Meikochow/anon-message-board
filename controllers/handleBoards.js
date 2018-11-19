const mongo             = require('mongodb').MongoClient;
const ObjectId          = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB;
// const bcrypt            = require('bcrypt');

function HandleBoards (){
  
this.allboards = function(req, res){
  mongo.connect(CONNECTION_STRING, (err, db)=>{
        db.listCollections().toArray(function (err, collections) {
        res.json(collections);
    }); 
                })
}

}
module.exports = HandleBoards;