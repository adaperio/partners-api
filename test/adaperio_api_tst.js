var fs = require('fs');
var crypto = require('crypto');
var https = require('https');
var assert = require('assert');

var LOGIN = '';     // TODO: set your login here
var PASSWORD = '';  // TODO: set your password here

// Required to make sure that https will 100% work even with bad certificate on out side))
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

          https.get('https://api.adaperio.ru/v1/data_for_cars/' + numEncoded, function (res) {
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

                    assert.equal(car.accidentFound,false);
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

     it('should buy order', function(done){
          var login = LOGIN;
          var pass  = PASSWORD;

          var num = 'а999му199';
          var numEncoded = encodeURIComponent(num);    // url encoding

          var path = '/v2/partners/' + 
               login + '/report_by_num/' + 
               numEncoded + 
               '?password=' + pass;

          //console.log('-->PATH: ' + path);

          // this is what Robokassa gives us
          var post_options = {
               host: 'api.adaperio.ru',
               port: '443',
               path: path,
               method: 'GET'
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

                    console.log('-->RESULT: ');
                    console.log(parsed);

                    done();
               });
          });
     
          req.write('');
          req.end();
     })
})
