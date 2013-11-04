// Imports
var http = require("http");
var https = require('https');
var url = require("url");
var querystring = require("querystring");
var sys = require("sys");
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var cheerio = require('cheerio');
var mongo = require('mongodb');
var BSON = require('mongodb').BSONPure;

// Express setup
var express = require('express');
var app = express();
app.use(express.bodyParser());

// Mongo setup, this will be initialized at the end of our code before the server starts
var db = new mongo.Db('vinelist', new mongo.Server('127.0.0.1', 27017, {auto_reconnect: true}), {w:1});

// Base vine video url
var base_url = 'https://vine.co/v/';

// Video compilation route
app.get('/compile/:hash([0-9a-f]{24}).mp4', function(req, res) {
	// Lookup hash in db
	var hashes = db.collection('hashes');
	var obj_id = BSON.ObjectID.createFromHexString(req.params.hash);
	hashes.findOne({'_id': obj_id}, function(err, item) {
		var vines = '';
		var name = '';

		if(err || !item) {
			res.send(404, 'nope');
			return;
		}
		else {
			vines = item.hash.toString();
			name = item.name.toString();
		}

		// Generate a dirname for this video compilation session
		var sessionDir = null, probeDir;
		var i = 0;
		while(i < 10) {
			// If we're compiling more than 10 copies of the same playlist at once we're screwed anyway
			probeDir = req.params.hash+'-'+i;
			if(!fs.existsSync(probeDir)) {
				sessionDir = probeDir;
				break;
			} 
			i++;
		}
		if(!sessionDir) {
			res.send(404, 'stahhhppp');
			return;
		}
		
		
		compileVines(sessionDir, vines, name, function(err) {
			if(!err) {
				res.writeHead(200);
				var stream = fs.createReadStream(sessionDir+'/'+name + '.mp4', { bufferSize: 64 * 1024 });
				stream.pipe(res, {"Content-Type": "video/mp4"});

				stream.on('close', function() {
					exec('rm -rf '+sessionDir+'/* '+sessionDir);
				});
			}
			else{
				exec('rm -rf '+sessionDir+'/* '+sessionDir);
				res.send(404, 'nope');
			}
		});
	});
});
// Compile vines into playlist-name.mp4 into session directory from downloaded files
function compileVines(sessionDir, vines, name, callback) {
	fs.mkdirSync(sessionDir);

	downloadVines(sessionDir, vines, name, function(err) {
		if(err) {
			callback(1);
			return;
		}

		// Build list of mpg files
		var mpglist = ''
		var length = vines.length/11;
		for(var i = 0; i < length; i++) {
			var vinehash = vines.substring(i*11, i*11+11);
			mpglist += sessionDir+'/'+vinehash+'.mpg ';
		}

		// Compile mpg files into a single mp4 file
		exec('cat ' + mpglist + ' | ffmpeg -f mpeg -i - -qscale 0 -strict -2 -vcodec mpeg4 ' + sessionDir+'/'+name+'.mp4 -y', function(error, stdout, stderr) {
			if(error) {
				callback(1);
			}
			else {
				callback(null);
			}
		});
	});	
}
// Function to download vine mp4 files
function downloadVines(sessionDir, vines, name, callback) {
	var length = vines.length/11;
	var waserror = 0, numcompleted = 0;
	for(var i=0; i<length; i++) {
		var vinehash = vines.substring(i*11, i*11+11);

		// curl for vine web page
		exec('curl -f ' + base_url + vinehash + ' > ' + sessionDir+'/'+vinehash+'.html', function(error, stdout, stderror) {
			if(error) {
				waserror = 1;
				numcompleted++;
				if(numcompleted == length) callback(1);
			}
			else {
				// curl again for extracted mp4 link
				fs.readFile(sessionDir+'/'+vinehash+'.html', function(err, data) {
					if(err) {
						waserror = 1;
						numcompleted++;
						if(numcompleted == length) callback(1);
					}
					else {
						var $ = cheerio.load(data.toString());
						var video = $('#post source').attr('src');

						exec('curl -f ' + video + ' > ' + sessionDir+'/'+vinehash+'.mp4', function(error, stdout, stderror) {
							if(error) {
								waserror = 1;
								numcompleted++;
								if(numcompleted == length) callback(1);
								return;
							}

							numcompleted++;

							if(numcompleted == length) {
								if(waserror == 0) {
									convertVines(sessionDir, vines, name, function(err) {
										if(err) {
											callback(1);
										}
										else {
											callback(null);
										}
									});
								}
								else {
									callback(1);
								}
							}
						});
					}
				});
			}
		});
	}
}
// Convert vine mp4 files to mpg files
function convertVines(sessionDir, vines, name, callback) {
	var length = vines.length/11;
	var waserror = 0, numcompleted = 0;
	for(var i=0; i<length; i++) {
		var vinehash = vines.substring(i*11, i*11+11);
		exec('ffmpeg -i ' + sessionDir+'/'+vinehash+'.mp4 -qscale 0 ' + sessionDir+'/'+vinehash+'.mpg -y', function(error, stdout, stderr) {
			numcompleted++;
			if(numcompleted == length) {
				callback(null);
				return;
			}
		});
	}
}


// Save playlist to database
app.post('/save', function(req, res) {
	var vines = req.body.vines;
	var name = req.body.name;

	// Basic hash validity check, could be improved by checking with Vine that links
	// are valid, but we are assuming users are using the service correctly for now
	if(!(vines.length % 11 == 0 && vines.length > 0)) {
		res.send(404, 'nope');
	}

	// Insert our new playlist to db, return id for url
	var hashes = db.collection('hashes');

	hashes.insert({'hash': vines, 'name': name}, function(err, item) {
		if(err) {
			res.send(404, 'nope');
		}
		else {
			res.send(200, item[0]._id);
		}
	})
});


// Get vine hashes concatenated string for given hash url
app.get('/p/:hash([0-9a-f]{24})/string', function(req, res) {
	var hashes = db.collection('hashes');
	var obj_id = BSON.ObjectID.createFromHexString(req.params.hash);
	hashes.findOne({'_id': obj_id}, function(err, item) {
		if(err || !item) {
			res.send(404, 'nope');
		}
		else {
			res.send(item.hash);
		}
	});
});
// Return static playlist template, which will call route above to render page in js
app.get('/p/:hash([0-9a-f]{24})', function(req, res) {
	res.sendfile(__dirname + '/ui/playlist.html');
});


// Initialization/Begin
app.use(express.static(__dirname+'/ui'));
db.open(function(err, database) {
	if(!err) {
		db = database;
		app.listen(9000);
	}
});

