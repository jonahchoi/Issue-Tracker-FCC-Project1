const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  let test_id;
  suite('POST tests', function(){
    //#1
    test('Issue with every field', function(done){
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Title',
          issue_text: 'some random text',
          created_by: 'Joe',
          assigned_to: 'Bob',
          status_text: 'In progress'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id)
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'some random text');
          assert.equal(res.body.created_by, 'Joe');
          assert.equal(res.body.assigned_to, 'Bob');
          assert.equal(res.body.status_text, 'In progress');
          assert.isTrue(res.body.open);
          assert.isNumber(Date.parse(res.body.created_on));
          assert.isNumber(Date.parse(res.body.updated_on));
          test_id = res.body._id;
          done();
        });
    });
    //#2
    test('Issue with only required fields', function(done){
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Title',
          issue_text: 'some random text',
          created_by: 'Joe'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isNotNull(res.body._id)
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'some random text');
          assert.equal(res.body.created_by, 'Joe');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isTrue(res.body.open);
          assert.isNumber(Date.parse(res.body.created_on));
          assert.isNumber(Date.parse(res.body.updated_on));
          done();
        });
    });
    //#3
    test('Issue with missing required fields', function(done){
      chai
        .request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Title',
          assigned_to: 'Bob',
          status_text: 'In progress'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });
  
  suite('GET tests', function(done){
    //#4
    test('View all issues', function(done){
      chai
        .request(server)
        .get('/api/issues/apitest')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          done();
        });
    });
    
    //#5
    test('View issues with ONE filter', function(done){
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({ assigned_to: 'Bob' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue)=>{
            assert.equal(issue.assigned_to, 'Bob');
          });
          done();
        });
    });
    //#6
    test('View issues with multiple filters', function(done){
      chai
        .request(server)
        .get('/api/issues/apitest')
        .query({
          issue_title: 'Title',
          created_by: 'Joe',
          open: true
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach((issue)=>{
            assert.equal(issue.issue_title, 'Title');
            assert.equal(issue.created_by, 'Joe');
            assert.equal(issue.open, true);
          });
          done();
        });
    });
  });
  
  suite('PUT tests', function(done){
    //#7
    test('Update one field', function(done){
      chai
        .request(server)
        .put('/api/issues/apitest')
        .send({
          _id: test_id,
          issue_title: 'title update'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, test_id);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });
    //#8
    test('Update multiple fields', function(done){
       chai
        .request(server)
        .put('/api/issues/apitest')
        .send({
          _id: test_id,
          issue_title: 'title update',
          open: false,
          created_by: 'Rob'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, test_id);
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });
    //#9
    test('Update with missing id', function(done){
       chai
        .request(server)
        .put('/api/issues/apitest')
        .send({
          issue_title: 'title update'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    //#10
    test('Update with no fields to update', function(done){
       chai
        .request(server)
        .put('/api/issues/apitest')
        .send({
          _id: test_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, test_id);
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });
    //#11
    test('Update with invalid id', function(done){
       chai
        .request(server)
        .put('/api/issues/apitest')
        .send({
          _id: 'wrongId',
          issue_title: 'title update'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, 'wrongId');
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });
  
  suite('DELETE tests', function(done){
    //#12
    test('delete an issue', function(done){
       chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: test_id
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, test_id);
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });
    //#13
    test('delete with invalid id', function(done){
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: 'wrongId'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body._id, 'wrongId');
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });
    //#14
    test('delete with missing id', function(done){
      chai
        .request(server)
        .delete('/api/issues/apitest')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
  });
  
    
});
