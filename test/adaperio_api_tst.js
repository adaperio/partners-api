var fs = require('fs');
var crypto = require('crypto');
var https = require('https');
var assert = require('assert');

var SUM      = '100.000000';

var LOGIN = '';     // TODO: set your login here
var PASSWORD = '';  // TODO: set your password here

// Required to make sure that https will 100% work even with bad certificate on out side))
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Signature is a secret string that is checked when partner buys report.
function generatePartnerSignature(orderId){
     var s = '' + SUM + ':' + orderId + ':' + PASSWORD;
     var hash = crypto.createHash('md5').update(s).digest("hex");
     return hash;
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

     it('should create new Order', function(done){
          var num = 'а999му199';
          var out  = {
               login: LOGIN,  
               num: num       // cyr utf-8 symbols
          };

          // WARNING: .length won't work because we have Cyr symbols that are multibyte. 
          var post_data = JSON.stringify(out);
          var lenInBytes = Buffer.byteLength(post_data, 'utf8');

          var post_options = {
               host: 'api.adaperio.ru',
               // should be something like POST /v1/parners/:login/orders, but that is how it was implemented first...
               path: '/v1/partner_orders',
               method: 'POST',
               headers: {
               'Content-Type': 'application/json',
               'Content-Length': lenInBytes
               }
          };

          var req = https.request(post_options, function (res) {
               assert.equal(200, res.statusCode);

               var data = '';

               res.on('data', function (chunk) {
                    data += chunk;
               });

               res.on('end', function () {
                    // check data
                    var obj = JSON.parse(data);
                    orderId = obj.id;

                    assert.notEqual(obj.id,0);
                    done();
               });
          });

          req.write(post_data);
          req.end();
     })

     // this costs money
     it('should buy order', function(done){
          var sig = generatePartnerSignature(orderId);

          // orderId is retrieved in a method above
          var path = "/v1/buy_order/" + orderId;
          var payload = {
               OutSum:SUM,
               SignatureValue:sig
          };
          var post_data = JSON.stringify(payload);

          var post_options = {
               host: 'api.adaperio.ru',
               path: path,
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
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

                    console.log('Result: ');
                    console.log(parsed);

                    done();
               });
          });
     
          req.write(post_data);
          req.end();
     })
})
