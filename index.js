'use strict';

// Import the interface to Tessel hardware
const tessel = require('tessel');

// require and set up RFID module
var rfidlib = require('rfid-pn532');
var rfid = rfidlib.use(tessel.port['A']);

// require and set up servo module
var servolib = require('servo-pca9685');
var servo = servolib.use(tessel.port['B']);
var servo1 = 1; // We have a servo plugged in at position 1


// set up camera
var av = require('tessel-av');
// var os = require('os');
var fs = require('fs');
var path = require('path');
// var http = require('http');
// var request = require('request');
var camera = new av.Camera({ fps: 24 });

var imgur = require('imgur-upload');

imgur.setClientID('786e4f3f4317d5d'); // Replace with your CleintID


servo.on('ready', function () {
      var position = 0;  //  Target position of the servo between 0 (min) and 1 (max).
      console.log('servo is ready');

  rfid.on('ready', function (version) {
    console.log('Ready to read RFID card');

    rfid.on('data', function(card) {
      // console.log('UID:', card.uid.toString('hex'));
      console.log('card has been read, triggering camera');


        //  Set the minimum and maximum duty cycle for servo 1.
        //  If the servo doesn't move to its full extent or stalls out
        //  and gets hot, try tuning these values (0.05 and 0.12).
        //  Moving them towards each other = less movement range
        //  Moving them apart = more range, more likely to stall and burn out


        servo.configure(servo1, 0.05, 0.12, function () {

          let counter = 0;
          var timer = setInterval(function () {
            // console.log('Position (in range 0-1):', position);
            //  Set servo #1 to position pos.
            servo.move(servo1, position);

            camera.capture().on('data', function(data) {

              // console.log('photo taken');

              var filepath = path.join(__dirname, 'test1.jpg');

              // console.log('saving to file system');
              fs.writeFile(filepath, data, function () {
                // console.log('saved to file system, uploading to imgur');
                imgur.upload(filepath, function (err, res) {
                if (err) console.log(err);
                console.log(res.data.link);
              })
              });


            });

            // Increment by 10% (~18 deg for a normal servo)
            position += 0.4;
            if (position > 1) {
              position = 0; // Reset servo position
            }

            counter++;

            if (counter > 4) {
              clearInterval(timer);
            }

          }, 2000); //
        });

    });
  });

});

rfid.on('error', function (err) {
  console.error(err);
});
