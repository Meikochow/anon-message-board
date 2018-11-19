const mongo             = require('mongodb').MongoClient;
const ObjectId          = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB;
const bcrypt = require('bcrypt');

function HandleThread (){
  
this.allThreads = function(req,res){
let board = req.params.board;
  mongo.connect(CONNECTION_STRING, function(err,db){
  let collection = db.collection(board);
  collection.find(
  {},
  {
  reported                  : 0,
  delete_password           : 0,
  "replies.delete_password" : 0,
  "replies.reported"        : 0
  })
  .sort({bumped_on:-1})
  .limit(10)
  .toArray(function(err, docs){
  docs.forEach(function(val){
  val.replyCount = val.replies.length;
  if(val.replies.length > 1){
  val.replies = val.replies.slice(-1);
  }
  });
  res.json(docs);
  })
 })
}
  
this.newThread = function(req,res){
let board = req.params.board;
let pass = req.body.delete_password;
 let hash = bcrypt.hashSync(pass, 12)
let thread = {
text            : req.body.text,
created_on      : new Date(),
bumped_on       : new Date(),
reported        : Boolean,
delete_password : hash,
replies         : []
}
mongo.connect(CONNECTION_STRING,function(err,db){
let collection = db.collection(board);
collection.insert(thread,function(){
res.redirect('/b/'+board+'/');
})
})
}

this.reportThread = function(req, res){
let board = req.params.board;
let reportId = req.body.report_id.length==24?req.body.report_id:"000000000000000000000000"
let report_id = new ObjectId(reportId);
mongo.connect(CONNECTION_STRING, function(err,db){
  let collection = db.collection(board);
  collection.findAndModify(
    {
      _id:report_id
    },
  [],
  {$set:{reported:true}},
  function(err,docs){
  if(docs.value===null||err){
  res.send("invalid id")
  }
    else{
    res.send("success")
    }
  }
  )
 })
}

this.deleteThread = function(req, res){
let board     = req.params.board;
let treadId = req.body.thread_id.length==24?req.body.thread_id:"000000000000000000000000"
let thread_id = new ObjectId(treadId);
let delPass   = req.body.delete_password;
mongo.connect(CONNECTION_STRING, function(err, db){
let collection = db.collection(board);
  
collection.findOne(
  {_id: thread_id
   },
    function(err,docs){
      if(docs === null||err){
      res.send("invalid id")
      }
     else if(bcrypt.compareSync(delPass, docs.delete_password)){
       collection.findAndModify(
       {_id: thread_id
       },
       [],
       {},
      {remove: true, new: false},
      function(err,docs){
      if(err){
      res.send(err)}
      else{
      res.send("success")
        }
      }
    )
   }else{
   res.send("incorrect password");
   }
  }
 )
})
}
}

module.exports = HandleThread;