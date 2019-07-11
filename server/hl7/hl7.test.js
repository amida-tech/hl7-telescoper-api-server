const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const app = require('../../index');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## File Upload', () => {
  describe('# POST /api/hl7/upload', () => {
    it('should upload a file to /data/hl7-uploads', (done) => {
      const user = {
        username: 'username',
        email: 'mail@mail.mail',
        password: 'Password1'
      };
      // create a user
      request(app)
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        // then sign in
        .then(() => request(app)
          .post('/api/user/signing')
          .send(user)
          // then upload a file as that user
          .then(res => request(app)
            .post('/api/hl7/upload')
            .set('Authorization', `Bearer ${res.body.token}`)
            .attach('hl7-message', 'data/hl7-sample/test.txt')
            .expect(httpStatus.CREATED)
            .then(() => {
              done();
            })
            .catch(done)
          )
        );
    });
    it('should return unauthorized without a token', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .attach('hl7-message', 'data/hl7-sample/test.txt')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });

    it('Should not upload a file that it not a .txt extension', (done) => {
      request(app)
        .post('/api/hl7/upload')
        .attach('hl7-message', 'data/hl7-sample/test.json')
        .expect(httpStatus.BAD_REQUEST)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });
});
