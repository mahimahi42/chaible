var transferInProgress = false;

Pebble.addEventListener("ready", function(e) {
  console.log("NetDownload JS Ready");
});

// Show configuration webpage
Pebble.addEventListener("showConfiguration", function() {
    Pebble.openURL("http://bryceadavis.com/chaible-config.html");
});

// We've received the configuration
Pebble.addEventListener("webviewclosed", function(e) {
    var config = JSON.parse(decodeURIComponent(e.response));
    console.log("S'bux num: " + config);
    
//    var barcodeURL = "http://www.bcmaker.com/cgi-bin/pdf417cgid?data=" + JSON.stringify(config) + "&cmode=0&ecl=9&col=2&row=0&cpdf=1&angle=0&quiet=1&alignh=1&alignv=1&bcolor=ffffff&fcolor=000000&y2x=4.0&xdim=2&w=144&h=&submit=+Generate+PDF417+&debug=1"

    var barcodeURL = "http://generator.barcodetools.com/barcode.png?gen=2&data=" + JSON.stringify(config) + "&col=3&row=0&bcolor=FFFFFF&fcolor=000000&y2x=4.0&xdim=2&w=144&h=&cmode=0&ecl=9&cpdf=0&angle=0&quiet=1&alignh=1&alignv=1"
    var barcodeXHR = new XMLHttpRequest();
    barcodeXHR.open("GET", barcodeURL, true);
    barcodeXHR.responseType = "arraybuffer";
    barcodeXHR.onload = function(e) {
        var byteArray = barcodeXHR.response;
        if (byteArray) {
            transferImageBytes(byteArray, 176877475,
                function() { console.log("Done transmitting!"); },
                function(e) { console.log("Error transmitting: " + e); }
            );
        }
    };
    barcodeXHR.send(null);

    //if (transferInProgress == false) {
        //transferInProgress = true;
        //downloadBinaryResource(barcodeURL, function(bytes) {
                //transferImageBytes(bytes, 1768777475,
                //function() { console.log("Done transmitting!"); transferInProgress = false; },
                //function(e) { console.log("Transmission failed: " + e); transferInProgress = false; }
                //);
        //},
            //function(e) {
                //console.log("Download failed: " + e);
                //transferInProgress = false;
            //});
    //} else {
        //console.log("Another transfer is in progress.");
    //}
});

//Pebble.addEventListener("appmessage", function(e) {
  //console.log("Got message: " + JSON.stringify(e));

  //if ('NETDL_URL' in e.payload) {
    //if (transferInProgress == false) {
      //transferInProgress = true;
      //downloadBinaryResource(e.payload['NETDL_URL'], function(bytes) {
        //transferImageBytes(bytes, e.payload['NETDL_CHUNK_SIZE'],
          //function() { console.log("Done!"); transferInProgress = false; },
          //function(e) { console.log("Failed! " + e); transferInProgress = false; }
        //);
      //},
      //function(e) {
        //console.log("Download failed: " + e); transferInProgress = false;
      //});
    //}
    //else {
      //console.log("Ignoring request to download " + e.payload['NETDL_URL'] + " because another download is in progress.");
    //}
  //}
//});

function downloadBinaryResource(imageURL, callback, errorCallback) {
    var req = new XMLHttpRequest();
    req.open("GET", imageURL,true);
    req.responseType = "arraybuffer";
    req.onload = function(e) {
        console.log("loaded");
        var buf = req.response;
        if(req.status == 200 && buf) {
            var byteArray = new Uint8Array(buf);
            var arr = [];
            for(var i=0; i<byteArray.byteLength; i++) {
                arr.push(byteArray[i]);
            }

            console.log("Downloaded file with " + byteArray.length + " bytes.");
            callback(arr);
        }
        else {
          errorCallback("Request status is " + req.status);
        }
    }
    req.onerror = function(e) {
      errorCallback(e);
    }
    req.send(null);
}

function transferImageBytes(bytes, chunkSize, successCb, failureCb) {
  var retries = 0;

  success = function() {
    console.log("Success cb=" + successCb);
    if (successCb != undefined) {
      successCb();
    }
  };
  failure = function(e) {
    console.log("Failure cb=" + failureCb);
    if (failureCb != undefined) {
      failureCb(e);
    }
  };

  // This function sends chunks of data.
  sendChunk = function(start) {
    var txbuf = bytes.slice(start, start + chunkSize);
    console.log("Sending " + txbuf.length + " bytes - starting at offset " + start);
    Pebble.sendAppMessage({ "NETDL_DATA": txbuf },
      function(e) {
        // If there is more data to send - send it.
        if (bytes.length > start + chunkSize) {
          sendChunk(start + chunkSize);
        }
        // Otherwise we are done sending. Send closing message.
        else {
          Pebble.sendAppMessage({"NETDL_END": "done" }, success, failure);
        }
      },
      // Failed to send message - Retry a few times.
      function (e) {
        if (retries++ < 3) {
          console.log("Got a nack for chunk #" + start + " - Retry...");
          sendChunk(start);
        }
        else {
          failure(e);
        }
      }
    );
  };

  // Let the pebble app know how much data we want to send.
  Pebble.sendAppMessage({"NETDL_BEGIN": bytes.length },
    function (e) {
      // success - start sending
      sendChunk(0);
    }, failure);

}


