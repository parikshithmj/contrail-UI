var express = require('express');
var app = express();

app.use(express.static('html'));
app.use(express.static('images'));
app.use(express.static('public'));
var http = require("http");
var MongoClient = require('mongodb').MongoClient;

var mysql  = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'mysql'
});

connection.connect();

app.get('/traffics', function(req, res){

  MongoClient.connect("mongodb://parikshith:parikshith@ds023510.mlab.com:23510/contraildb", function(err, db) {
    var collection = db.collection('traffic');
    collection.find().toArray(function(err, items) {
	res.send(items);    
	});
  });

});

app.get('/traffics/:protocol/:destination_ip/:source_ip', function(req, res){
  var timestampBegin = Number(req.params.timestampBegin);
  var timestampEnd = Number(req.params.timestampEnd);
  var protocol = Number(req.params.protocol);
  var destination_ip = Number(req.params.destination_ip);
  var source_ip = Number(req.params.source_ip);
  console.log("aaa");
  console.log(timestampBegin+" :"+timestampEnd+":"+source_ip);
  var result =[];
  MongoClient.connect("mongodb://parikshith:parikshith@ds023510.mlab.com:23510/contraildb", function(err, db) {
    var collection = db.collection('traffic');
    collection.find().toArray(function(err, items) {
	for(var i = 0; i<items.length; i++){	
		if(items[i].protocol == protocol || items	  
      		[i].destination_ip == destination_ip || items[i].source_ip == source_ip){
			result.push(items[i]);
		}
	}
	res.send(result);    

	});
  });

});
//http://localhost:3000/traffics/""/""/6/""/""/""/""/""/""/""/""/""
app.get('/traffics/:timestampBegin/:timestampEnd/:protocol/:destination_ip/:destination_vn/:destination_port/:direction_ingress/:source_ip/:source_vn/:source_port/:sum_bytes_kb/:sum_packets', function(req, res){
  var timestampBegin = Number(req.params.timestampBegin);	
  var timestampEnd = Number(req.params.timestampEnd);
  var protocol = Number(req.params.protocol);
  if(isNaN(protocol)){
  	var pro_bool 	
  }	
  var destination_ip = req.params.destination_ip;
  var source_ip = req.params.source_ip;
  var destination_port = Number(req.params.destination_port);
  var source_port = Number(req.params.source_port);
  var destination_vn = req.params.destination_vn;
  var source_vn = req.params.source_vn;
  var sum_bytes_kb = req.params.sum_bytes_kb;
  var sum_packets = Number(req.params.sum_packets);
  var direction_ingress = Number(req.params.direction_ingress);	
  console.log("hey"); 
  console.log(protocol+" :"+timestampEnd+":"+source_ip +":"+destination_ip);
  var result =[];
  MongoClient.connect("mongodb://parikshith:parikshith@ds023510.mlab.com:23510/contraildb", function(err, db) {
    var collection = db.collection('traffic');
    collection.find({ $or : [{protocol: protocol}, {destination_ip:destination_ip}, {destination_vn:destination_vn}, {destination_port:destination_port}, {direction_ingress: direction_ingress}, 
							 {source_ip: source_ip}, {source_vn: source_vn}, {source_port:source_port}]}).toArray(function(err, items) {
	for(var i = 0; i<items.length; i++){	
			result.push(items[i]);
		
	}
	res.send(result);    
	});
  });

});


app.get('/traffic/:protocol?', function(req, res){

  var protocol = Number(req.query.protocol);
  var result =[];
  MongoClient.connect("mongodb://parikshith:parikshith@ds023510.mlab.com:23510/contraildb", function(err, db) {
    var collection = db.collection('traffic');
    collection.find().toArray(function(err, items) {
	for(var i = 0; i<items.length; i++){	
		if(items[i].protocol == protocol){
			result.push(items[i]);
		}
	}
	res.send(result);    
	});
  });

});

app.get('/traffic/query/:q?', function(req, res){

  var queryStr = req.query.q;
  var result =[]; 	
  console.log("Query is "+queryStr);	
  connection.query(queryStr, function(err, rows, fields) {
      if (!err && rows.length!=0){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){	
		
			result.push(rows[i]);
		}
		  	res.send(result);  
	}
	
      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.get('/traffic/timeRange/:timestampBegin/:timestampEnd', function(req, res){
  console.log("Timerange api invoked");
  var timestampBegin = Number(req.params.timestampBegin);
  var timestampEnd = Number(req.params.timestampEnd);
    var result =[];
  MongoClient.connect("mongodb://parikshith:parikshith@ds023510.mlab.com:23510/contraildb", function(err, db) {
    var collection = db.collection('traffic');
    collection.find().toArray(function(err, items) {
	for(var i = 0; i<items.length; i++){	
		if(items[i].timestamp >= timestampBegin && items[i].timestamp <= timestampEnd){
			result.push(items[i]);
		}
	}
	res.send(result);    
	});
  });

});

console.log("Listening on port"+3000);
app.listen(3000);


  

