var fs = require('fs');
var crypto = require('crypto');
var http = require('http');
var https = require('https');
var assert = require('assert');
var url = require('url');

var LOGIN = '';     // TODO: set your login here
var PASSWORD = '';  // TODO: set your password here

var EMAILS = 'one@g_m_a_il.com,two@y_a_nd_ex.ru'; // TODO: send report here

// Required to make sure that https will 100% work even with bad certificate on our side))
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var g_authToken = 0;
var g_invId = 0;

// HELPERS:
// Will send HTTP HEAD request and check if URL exists
function checkIfFileExistsHttp(path,cb){
     var parsedUrl = url.parse(path);

     var qs = (parsedUrl.search==null)?"":parsedUrl.search ;

     var options = 
     {
          method: 'HEAD', 
          host: parsedUrl.hostname,
          path: parsedUrl.pathname + qs,
          port: 80,
     };

     var req = http.request(options, function(res) {
          var good = (res.statusCode==200);
          cb(good);
     });

     req.on('error',function(err){
          cb(false);
     });
     req.end();
}


// *****************************************************************************
describe('ADAPERIO PARTNER-interaction module',function(){
     var orderId = '';

     before(function(done){
          done();
     });

     after(function(done){
          done();
     });

     it('should get basic car data',function(done){
          var num = 'а999му199';
          var numEncoded = encodeURIComponent(num);    // url encoding

          https.get('https://partner.api.adaperio.ru/v1/data_for_cars/' + numEncoded, function (res) {
               assert.equal(200, res.statusCode);

               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    // TODO: do error-checking 
                    var parsed = JSON.parse(data);

                    assert.equal(parsed.length,1);
                    var car = parsed[0];

                    assert.equal(car.accidentFound,true);
                    assert.equal(car.picsFound,true);
                    assert.equal(car.taxiFound,false);
                    assert.equal(car.customsFound,false);
                    assert.equal(car.equipInfoFound,true);

                    assert.equal(car.milleageFound,true);
                    assert.equal(typeof(car.milleageArr),'undefined');
                    // ...
                    done();
               }); 
          });
     })

     it('should login', function(done){
          var partnerLogin = LOGIN;
          var password = PASSWORD;

          var data = {
               password: password
          };
          var post_data = JSON.stringify(data);

          var path = '/partners/' + partnerLogin + '/authenticate/v2';

          var post_options = {
               host: 'partner.api.adaperio.ru',
               path: path,
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
               }
          };

          var req = https.request(post_options, function (res) {
               assert.equal(200, res.statusCode);

               var data = '';

               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);

                    var parsed = JSON.parse(data);
                    g_authToken = parsed.token;

                    assert.notEqual(g_authToken.length,0);

                    done();
               });
          });

          req.write(post_data);
          req.end();
     })

     it('should buy order', function(done){
          var num = 'а999му199';
          var emails = 'mail1@some_mail.ru, mail2@some_mail.ru';

          var numEncoded = encodeURIComponent(num);    // url encoding
          var emailsEncoded = encodeURIComponent(emails);

          var path = '/auth/partners/report_by_num/v3/' + numEncoded + '?emails=' + emailsEncoded;

          var post_options = {
               host: 'partner.api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET',
               headers: {
                    'Authorization':'Bearer ' + g_authToken
               }
          };

          var req = https.request(post_options, function (res) {
               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);

                    var parsed = JSON.parse(data);

                    // Final result
                    assert.notEqual(parsed.link.length,0);
                    assert.notEqual(parsed.signature,0);
                    assert.notEqual(parsed.invId,0);

                    g_invId = parsed.invId;

                    console.log('-->RESULT: ');
                    console.log(parsed);

                    done();
               });
          });
     
          req.write('');
          req.end();
     })

     it('should send email as requested', function(done){
          var emails = EMAILS;
          var emailAddresses = encodeURIComponent(emails);    // url encoding

          var path = '/auth/partners/orders/' + g_invId + '/email_report/v3/' + '?emails=' + emailAddresses;

          var post_options = {
               host: 'partner.api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET',
               headers: {
                    'Authorization':'Bearer ' + g_authToken
               }
          };

          var req = https.request(post_options, function (res) {
               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);
                    done();
               });
          });
     
          req.write('');
          req.end();
     })

     it('should get link to PDF file', function(done){
          var path = '/auth/partners/orders/' + g_invId + '/pdf_report/v3';

          var post_options = {
               host: 'partner.api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET',
               headers: {
                    'Authorization': 'Bearer ' + g_authToken
               }
          };

          var req = https.request(post_options, function (res) {
               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);

                    var parsed = JSON.parse(data);
                    assert.notEqual(parsed.link.length,0);

                    console.log('PDF link: ' + parsed.link);

                    // send HEAD
                    checkIfFileExistsHttp(parsed.link,function(res){
                         assert.equal(res,true);
                         done();
                    });
               });
          });
     
          req.write('');
          req.end();
     })

     it('should buy by vin', function(done){
          var vin = 'WAUZZZ4G5CN021391'; 
          var emails = 'mail1@some_mail.ru, mail2@some_mail.ru';
          var emailsEncoded = encodeURIComponent(emails);

          var path = '/auth/partners/report_by_vin/v3/' + vin + '?emails=' + emailsEncoded;

          var post_options = {
               host: 'partner.api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET',
               headers: {
                    'Authorization':'Bearer ' + g_authToken
               }
          };

          var req = https.request(post_options, function (res) {
               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);

                    var parsed = JSON.parse(data);

                    // Final result
                    assert.notEqual(parsed.link.length,0);
                    assert.notEqual(parsed.signature,0);
                    assert.notEqual(parsed.invId,0);

                    //g_invId2 = parsed.invId;

                    console.log('-->RESULT: ');
                    console.log(parsed);

                    done();
               });
          });
     
          req.write('');
          req.end();
     })

     it('should check balance', function(done){
          var path = '/auth/partners/balance/v3';

          var post_options = {
               host: 'partner.api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET',
               headers: {
                    'Authorization':'Bearer ' + g_authToken
               }
          };

          var req = https.request(post_options, function (res) {
               var data = '';
               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    assert.equal(200, res.statusCode);
                    done();
               });
          });
     
          req.write('');
          req.end();
     })
})
