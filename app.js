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

var express = require('express');
var app = express();
app.use(express.bodyParser());

// mongoooooooooooo letssssgoooooooooooo
var db = new mongo.Db('vinelist', new mongo.Server('127.0.0.1', 27017, {auto_reconnect: true}), {w:1});

app.use(express.static(__dirname+'/ui'));

var base_url = 'https://vine.co/v/';
app.post('/compile', function(req, res) {
	var vines = req.body.vines;
	var length = vines.length/11;
	var list = '';
	for(var i = 0; i < length; i++) {
		// grab video from vine.co/vines[0], async function, save as vinehash.mp4
		var vinehash = vines.substring(i*11, i*11+11);
		var waserror = 0, numcompleted = 0;
		//var req_url = base_url + vinehash;

		(function(hash){exec('curl -f ' + base_url + vinehash + ' > ' + hash + '.html', function(error, stdout, stderror) {
			
			if(error) {
				// tell client something went wrong, file didn't exist?
				// end response
				//res.send(404, 'nope');
				waserror = 1;
				console.log('404 from vine html');
			}
			else {
				// curl AGAIN for video, save as vines.substring(i*11, i*11+11).mp4s
				fs.readFile(hash + '.html', function(err, data) {
					if(err) {
						//res.send(404, 'nope');
						waserror = 1;
						console.log('error reading vine html');
					}
					else {
						var $ = cheerio.load(data.toString());
						var video = $('#post source').attr('src');

						exec('curl -f ' + video + ' > ' + hash + '.mp4', function(error, stdout, stderror) {

							if(error) {
								//res.send(404, 'nope');
								waserror = 1;
								console.log('404 from vine video');
							}
							else {
								list += 'file \'' + hash + '.mp4\'\n';
							}

							numcompleted++;

							if(numcompleted == length) {
								if(waserror == 0) {
									
									fs.writeFile('output.txt', list, function(err) {
										if(!err) {
											exec('ffmpeg -f concat -i output.txt -c copy output.mp4 -y', function(error, stdout, stderr) {
												if(!error) {
													res.writeHead(200);
													var stream = fs.createReadStream('output.mp4', { bufferSize: 64 * 1024 });
													stream.pipe(res);
												}
												else{
													res.send(404, 'nope');
													console.log('error sending video to client');
												}
											});
										}
										else {
											res.send(404, 'nope');
											console.log('error creating list file');
										}
									});

								}
								else {
									res.send(404, 'error, sorry');
								}

							}
						});
					}		
				});
			}
		})})(vinehash);/// end of exec;
	}
});



app.post('/save', function(req, res) {
	var vines = req.body.vines;
	// probably should check for valid string...
	db.open(function(err, db) {
		var hashes = db.collection('hashes');
		hashes.insert({'hash': vines}, function(err, item) {
			//console.log(item);
			if(err) {
				res.send(404, 'nope');
			}
			else {
				//console.log(item[0]._id);
				res.send(200, item[0]._id);
			}
			db.close();
		});
	});
});


app.get('/p/:hash/string', function(req, res) {
	if(req.params.hash.length != 24) { res.send(404, 'nope'); return; }
	db.open(function(err, db) {
		var hashes = db.collection('hashes');
		var obj_id = BSON.ObjectID.createFromHexString(req.params.hash);
		hashes.findOne({'_id': obj_id}, function(err, item) {
			if(err || !item) {
				res.send(404, 'nope');
			}
			else {
				res.sendfile(item.hash);
			}
			db.close();
		});
	});
});

app.get('/p/:hash', function(req, res) {
	res.sendfile(__dir + '/ui/playlist.html');
}






app.listen(80);
