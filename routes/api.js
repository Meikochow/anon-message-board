
'use strict';

var expect = require('chai').expect;
let HandleBoards = require('../controllers/handleBoards');
var HandleThread = require('../controllers/handleThread.js');
var HandleReply = require('../controllers/handleReply.js');  

module.exports = function (app) {

let handleBoards = new HandleBoards();
var handleThread = new HandleThread();
var handleReply = new HandleReply();
  
  app.route('/boards')
    .get(handleBoards.allboards);
  
  app.route('/api/threads/:board')
    .get(handleThread.allThreads)
    .post(handleThread.newThread)
    .put(handleThread.reportThread)
    .delete(handleThread.deleteThread);
    
  app.route('/api/replies/:board')
   .get(handleReply.allReplies)
   .post(handleReply.newReply)
   .put(handleReply.reportReply)
   .delete(handleReply.deleteReply);
};
