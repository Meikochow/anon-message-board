const mongo             = require('mongodb').MongoClient;
const ObjectId          = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB;
const bcrypt            = require('bcrypt');

function HandleReply (){
  
this.allReplies = function(req, res){
let board     = req.params.board;
let thread_id = new ObjectId(req.query.thread_id);
  mongo.connect(CONNECTION_STRING, function(err,db){
    let collection = db.collection(board);
    collection.find(
    {_id: thread_id},
    {
    reported                  : 0,
    delete_password           : 0,
    "replies.delete_password" : 0,
    "replies.reported"        : 0
    })
    .toArray(function(err, docs){
    res.json(docs[0]);
    })
  })
}
this.newReply = function(req,res){
let board     = req.params.board;
let thread_id = req.body.thread_id.length==24?req.body.thread_id:"000000000000000000000000"
let delPass = req.body.delete_password
let hash = bcrypt.hashSync(delPass, 12)
let reply = {
  _id             : new ObjectId(),
  text            : req.body.text,
  created_on      : new Date(),
  delete_password : hash,
  reported        : false
  };
mongo.connect(CONNECTION_STRING, function(err,db){
  let collection = db.collection(board);
  collection.findAndModify(
    {_id:new ObjectId(thread_id)},
    [],
    {
    $set  : {bumped_on : new Date()},
    $push : {replies : reply}
    },
    function(err, doc){
      if(doc.value === null || err){
      //here we can make a 404 page with redirect
      res.send("invalid Id")
      }
      else{
      res.redirect(`/b/${board}/${thread_id}`);
     }
    });
  });
}

this.reportReply = function(req, res){
let board = req.params.board;
let thread_id = new ObjectId(req.body.thread_id);
let reply_id  = new ObjectId(req.body.reply_id);
  mongo.connect(CONNECTION_STRING, function(err,db){
  let collection = db.collection(board);
    collection.findAndModify(
    {
    _id:thread_id,
    "replies._id":reply_id
    },
    [],
    {
    $set:{"replies.$.reported":true}
    },
    function(err,docs){
    //no existend case for an incorect id
    if(docs.value === null||err){
    res.send("reply report failed")
    }else{
    res.send("reported");
     }
    })
  })
}

this.deleteReply = function(req, res){
let board = req.params.board;
let thread_id = new ObjectId(req.body.thread_id);
let reply_id  = new ObjectId(req.body.reply_id);
let delPass   = req.body.delete_password;
let passMatch = false;
mongo.connect(CONNECTION_STRING,function(err,db){
  let collection = db.collection(board);
  collection.findOne(
    {_id:thread_id
    },
    function(err,docs){
      if(docs==null){res.send('invalid ID')}
       for(let i=0;i<docs.replies.length;i++){
        if(docs.replies[i]._id==req.body.reply_id){
         // console.log("reply id found");
         passMatch=bcrypt.compareSync(delPass, docs.replies[i].delete_password)?true:false;
         break;
         }else{
         console.log("reply id not found");
         }
       }
    if(passMatch){
      collection.findAndModify(
      {
      _id:thread_id,
      replies: {$elemMatch:{_id:reply_id}}
      },
      [],
      {$set: {"replies.$.text": "[deleted]"}},
      function (err,docs){
      res.send("success!!! Refresh page");
     }
    )
    }else{
     res.send("Invalid Password and/or Id");
     }
    }
   )
 })
}
}

module.exports = HandleReply;