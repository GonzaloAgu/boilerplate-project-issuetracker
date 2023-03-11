const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', async function() {

  const rn = Math.floor(Math.random() * 100000).toString();
  console.log('Initializing test with id number: ', rn);
  let id;
  
  test('Create an issue with every field', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .post('/api/issues/apitest')
      .send({  // form data
        'issue_title': 'test1_title' + rn,
        'issue_text': 'test1_text' + rn,
        'created_by': 'test1_creator' + rn,
        'assigned_to': 'test1 assigned' + rn,
        'status_text': 'test1 status' + rn
      })
      .end( (err, res) => {
        if(err) console.log(err);
        assert.equal(res.body.issue_title, 'test1_title' + rn);
        assert.equal(res.body.issue_text, 'test1_text' + rn);
        assert.equal(res.body.created_by, 'test1_creator' + rn);
        assert.equal(res.body.assigned_to, 'test1 assigned' + rn);
        assert.equal(res.body.status_text, 'test1 status' + rn);
        id = res.body._id;
        console.log('_id', id)
        done();
        
      });
  });

  test('Create an issue with only required fields', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .post('/api/issues/apitest')
      .send({  // form data
        'issue_title': 'test2_title' + rn,
        'issue_text': 'test2_text' + rn,
        'created_by': 'test2_creator' + rn
      })
      .end( (err, res) => {
        if(err) console.log(err)
        assert.equal(res.body.issue_title, 'test2_title' + rn);
        assert.equal(res.body.issue_text, 'test2_text' + rn);
        assert.equal(res.body.created_by, 'test2_creator' + rn);
        done();
      })
  })
  test('Create an issue with missing required fields', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .post('/api/issues/apitest')
      .send({  // form data
        'issue_title': 'test3_title' + rn,
        'issue_text': 'test3_text' + rn
      })
      .end( (err, res) => {
        if(err) console.log(err)
        assert.equal(res.body.error, 'required field(s) missing')
        done();
      })
  });
  
  test('View issues on a project', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .get('/api/issues/apitest')
      .end((err, res) => {
        if(err) console.log(err);
        assert.isArray(res.body);
        done();
      })
  });

  test('View issues on a project with one filter', done => {
    let counter = 0;
    
    function recursiveRequest(){
    ++counter;
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .get('/api/issues/apitest')
      .query({ assigned_to: ('test1 assigned'+rn) })
      .end((err, res) => {
        if(err) console.error(err);
        if(res.body.length === 0 && counter < 5) {
          console.log('Empty data received, trying again... (attempt #', counter, ')')
          recursiveRequest()
        } else {
          if(counter >= 5) assert.fail('All requesting attempts returned empty data');
          assert.equal(res.body.length, 1);
          assert.equal(res.body[0].issue_title, 'test1_title' + rn);
          done();
        }
      })
    }
    recursiveRequest();
  });
  
  test('View issues on a project with multiple filters', done => {

    let counter = 0;
    
    function recursiveRequest(){
      ++counter;
      chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
        .get('/api/issues/apitest')
        .query({ assigned_to: 'test1 assigned' + rn, created_by: 'test1_creator' + rn })
        .end((err, res) => {
          if(err) console.error(err);
          if(res.body.length === 0 && counter < 5) {
            console.log('Empty data received, trying again... (attempt #', counter, ')')
            recursiveRequest()
          } else {
            if(counter >= 5) assert.fail('All requesting attempts returned empty data');
            assert.equal(res.body.length, 1);
            assert.equal(res.body[0].issue_title, 'test1_title' + rn);
            done();
          }
        })
      }
    recursiveRequest();
  })

  
  
  test('Update one field on an issue', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .put('/api/issues/apitest')
      .send({
        _id: id,
        issue_title: 'new_title' + rn
      })
      .end((err, res) => {
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  test('Update multiple fields on an issue', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .put('/api/issues/apitest')
      .send({
        _id: id,
        issue_title: 'newer_title' + rn,
        issue_text: 'new_text' + rn
      })
      .end((err, res) => {
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });
  
  test('Update an issue with missing _id', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .put('/api/issues/apitest')
      .send({
        _id: '',
        issue_title: 'newer_title' + rn,
        issue_text: 'new_text' + rn
      })
      .end((err, res) => {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test('Update an issue with no fields to update', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .put('/api/issues/apitest')
      .send({
        _id: id
      })
      .end((err, res) => {
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  })

  test('Update an issue with an invalid _id', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid_id123',
        issue_title: 'no_title' + rn,
      })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not update');
        done();
      });
  })

  test('Delete an issue', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .delete('/api/issues/apitest')
      .send({ _id: id })
    .end((err, res) => {
      assert.equal(res.body.result, 'successfully deleted');
      done();
    })
  })

  test('Delete an issue with an invalid _id', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .delete('/api/issues/apitest')
      .send({ _id: 'invalid_id12345' })
    .end((err, res) => {
      assert.equal(res.body.error, 'could not delete');
      done();
    })
  })

  test('Delete an issue with missing _id', done => {
    chai.request('https://boilerplate-project-issuetracker.gonzaloagu.repl.co')
      .delete('/api/issues/apitest')
      .send({ _id: '' })
    .end((err, res) => {
      assert.equal(res.body.error, 'missing _id');
      done();
    })
  })
});