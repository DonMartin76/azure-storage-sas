var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var azure = require('azure-storage');
var uuidGen = require('node-uuid');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.disable('x-powered-by');

//app.use('/', routes);
//app.use('/users', users);

app.post('/bulk/token', function(req, res) {
	   var blobService = azure.createBlobService();
	   var startDate = new Date();
	   var expiryDate = new Date(startDate);
	   expiryDate.setMinutes(startDate.getMinutes() + 100);
	   startDate.setMinutes(startDate.getMinutes() - 10);

	   var filename = uuidGen.v4() + ".zip";
     var container = 'bulkingest';
     if (process.env.AZURE_STORAGE_SAS_CONTAINER)
     {
       container = process.env.AZURE_STORAGE_SAS_CONTAINER;
     }

	   var sharedAccessPolicy = {
	     AccessPolicy: {
	       Permissions: azure.BlobUtilities.SharedAccessPermissions.READ +
	         azure.BlobUtilities.SharedAccessPermissions.WRITE,
	       Start: startDate,
	       Expiry: expiryDate
	     },
	   };

	   var token = blobService.generateSharedAccessSignature(container, filename, sharedAccessPolicy);
	   var sasUrl = blobService.getUrl(container, filename, token);

	   res.jsonp({   storageUrl: sasUrl, 
			 filename: filename,
			 headers: [ { header: "x-ms-blob-type", value: "BlockBlob" } ], 
			 method: "PUT" });
});

app.post('/bulk/acknowledge', function(req, res, next) {
	   if (!req.body || !req.body.filename)
	     {
	       res.status(400);
	       return res.jsonp({ code: 400, error: 'Bad request: filename was not passed in POST body.' });
	     }
	   
	   res.jsonp({   filename: req.body.filename,
			 message: "Upload acknowledged." });
		 
	 });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
