/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

let thread1Id,thread2Id,replyId;
const thread1Pass = "0000";
const thread2Pass = "1111";
const replyDelPass = "2222" 
suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
     test('create 2 threads', function(done) {
       chai.request(server)
        .post('/api/threads/testing')
        .send({text:"First thread test text",delete_password:thread1Pass})
        .end(function(err, res){
          assert.equal(res.status, 200);
        });

       chai.request(server)
        .post('/api/threads/testing')
        .send({text:"Second thread test text",delete_password:thread2Pass})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
       });
    });
    
    suite('GET', function() {
      test('most recent 10 bumped threads on the board with only the most recent 3 replies', function(done) {
       chai.request(server)
        .get('/api/threads/testing')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.property(res.body[0], "_id");
          assert.property(res.body[0], "text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "bumped_on");
          assert.notProperty(res.body[0], "reported");
          assert.notProperty(res.body[0], "delete_password");
          assert.property(res.body[0], "replies");   
          assert.isArray(res.body[0].replies); 
          assert.isBelow(res.body[0].replies.length,4);
          thread1Id = res.body[1]._id;
          thread2Id = res.body[0]._id;
          done();
        });
       });
      
    });
    
    suite('DELETE', function() {
    test('Delete thread request with a VALID password', function(done) {
       chai.request(server)
        .delete('/api/threads/testing')
        .send({thread_id:thread1Id,delete_password:thread1Pass})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "success")
          done();
        });
       });
    test(' FAIL A delete thread request with a INVALID password', function(done) {
       chai.request(server)
        .delete('/api/threads/testing')
        .send({thread_id:thread2Id,delete_password:"IamAWrongPassword"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "incorrect password")
          done();
        });
       });
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
       chai.request(server)
        .put('/api/threads/testing')
        .send({report_id:thread2Id})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, "success")
          done();
        });
       });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Post a new reply', function(done) {
       chai.request(server)
        .post('/api/replies/testing')
        .send({thread_id:thread2Id,text:"This is a text reply",delete_password:replyDelPass})
        .end(function(err, res){
          assert.equal(res.status, 200);
          // assert.equal(res.text, "success")
          done();
        });
       });
    });
    
    suite('GET', function() {
      
      test('Get all replies for a thread', function(done) {
        chai.request(server)
        .get('/api/replies/testing')
        .query({thread_id: thread2Id})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
          replyId = res.body.replies[0]._id;
          done();
        });
      });
    }); 
    suite('PUT', function() {
      test('report a reply', function(done){
        chai.request(server)
         .put('/api/replies/testing')
         .send({thread_id:thread2Id, reply_id:replyId})
         .end(function(err, res){
           assert.equal(res.status,200);
           assert.equal(res.text, 'reported');
           done();
        })
      }) 
    });
    
    suite('DELETE', function() {
      test('DELETE REPLY REQUEST with an INVALID password',function(done){
        chai.request(server)
        .delete('/api/replies/testing')
        .send({thread_id:thread2Id, reply_id:replyId, delete_password:'IamAWrongPass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Invalid Password and/or Id')
          done();
        })
      })
      
      test('DELETE REPLY REQUEST with a VALID password',function(done){
        chai.request(server)
        .delete('/api/replies/testing')
        .send({thread_id:thread2Id, reply_id:replyId, delete_password:replyDelPass})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success!!! Refresh page')
          done();
        })
      })
    });
  });

 });

