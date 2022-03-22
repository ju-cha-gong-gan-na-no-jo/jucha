const express =require("express");
const bodyParser = require('body-parser');
const app = express();
const { MongoClient } = require('mongodb');
const env =require("dotenv").config({ path: "/home/bitnami/park/.env"});
var uri = process.env.uri;
var urp = process.env.urp;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//몽고의 차량 대수 값을 CAR_NUMBER 변수에 넣어주는 함수
async function getNumberOfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("parkdb");

	// 전체 차량 대수 확인
	dbo.collection("park").count({}, function(err, numOfDatas){
		CAR_NUMBER = numOfDatas;
		if(err) throw err;
			db.close();
		});
	});
	await Promise.resolve("ok");
}
getNumberOfCar().then();


//현재 주차되어있는 차량 대수
async function getNumberNowOfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("parkdb");
	// 주차된 차량 대수 확인
	dbo.collection("park").count({"출차시간":null}, function(err,numOfNowDatas) {
		car_all_now = numOfNowDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}
getNumberNowOfCar().then();

//현재 주차되어있는 외부인 차량 대수
async function getNumberNowOutOfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("parkdb");
	// 주차된 차량 대수 확인
	dbo.collection("park").count({"출차시간":null, "유형":"방문객"}, function(err,numOfNowOutDatas) {
		car_now = numOfNowOutDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}
getNumberNowOutOfCar().then();
     
    
    
    
//     ,function(err,numOfNowData) {
// 		car_now = numOfNowData;
// 		if(err) throw err;
// 			db.close();
// 		}});
//   });
// 	await Promise.resolve("ok");
// }
// getNumberNowOutOfCar().then();


//몽고의 주차된 차량 대수 값을 CAR_NOW 변수에 넣어주는 함수
// async function getNumberNowOfCar(){
// 	MongoClient.connect(uri, function(err, db) {
// 	if (err) throw err;
// 	const dbo = db.db("parkdb");

// 	// 주차된 차량 대수 확인
// 	dbo.collection("park").find({"depTime":""}, {projection:{_id:0}}).count(function(err,numOfNowDatas) {
// 		CAR_NOW = numOfNowDatas;
// 		if(err) throw err;
// 			db.close();
// 		});
// 	});
// 	await Promise.resolve("ok");
// }
// getNumberNowOfCar().then();

//몽고의 주차장 전체공간을 park_number 에 넣어주는 함수
async function getNumberPark(){
	MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");

    //전체 주차장 주차대수 확인
    dbo.collection("park_area").find({"id":"1"}, {projection:{_id:0,id:0}}).toArray(function(err,result) {
      park_number = result[0]["전체공간"];
      console.log(park_number);
		  if(err) throw err;
			  db.close();
		  });
	});
	await Promise.resolve("ok");
}
getNumberPark().then();

//몽고의 주차장 대여공간을 park_usenumber 에 넣어주는 함수
async function getUseNumberPark(){
	MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");

    //전체 주차장 주차대수 확인
    dbo.collection("park_area").find({"id":"1"}, {projection:{_id:0,id:0}}).toArray(function(err,result) {
      park_usenumber = result[0]["대여공간"];
      console.log(park_usenumber);
		  if(err) throw err;
			  db.close();
		  });
	});
	await Promise.resolve("ok");
}
getUseNumberPark().then();


//---------------------------------------------------------------------------------

//13쪽 주차장 사양조회
app.get("/status/car/space", (req, res) => {
  getNumberPark();
  res.json({park_setting : { all_place:park_number, rent_place:park_usenumber }});
});

//---------------------------------------------------------------------------------

//주차장 실시간 주차 대수 확인
app.get("/status/car/space/now", (req, res) => {
  getNumberNowOfCar();
  res.json({park_setting : { all_place:park_number, rent_place:park_usenumber ,"현재 주차 대수":car_all_now}});
});


//---------------------------------------------------------------------------------

//주차장 실시간 주차 가능 공간 확인
app.get("/status/car/space/possible", (req, res) => {
  getNumberPark();
  getNumberNowOutOfCar();
  res.json({park_usenumber, car_now ,park_setting : { now_place:(park_usenumber - car_now)}});
});

//-----------------------------------------------------------------------------------
//14쪽 실시간 현황 데이터 조회
app.get("/status/car/data/all", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").find({}, {projection:{_id:0, id:0}}).toArray(function(err,result) {
      if (err) throw err;
      res.json( {current_data : result});
      db.close();
    });
  });
})

//------------------------------------------------------------------------------------------------------
//   getNumberPark();
//   getNumberNowOfCar();

//   var Free_space = PARK_NUMBER - CAR_NOW
//   console.log(Free_space)
//   res.json({status:"OK", message:"OK", totalData:1, placecount:[{total:park_number, Free_space:Free_space}]});
// });

//simple api

//app.get("/Hello", (req, res) => {
//  res.json({status:"OK", message:"OK", totalData:1, total:park_area});
//})

//======================================================================================================================
//입차 데이터 추가

app.post("/status/car/data/add/enter", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const enter_time = req.body.enter_time
    const type = req.body.type
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").insertMany([{차량번호 :  car_number, 입차시간 : enter_time, 유형 : type}])
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//출차 데이터 추가

app.post("/status/car/data/add/out", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const out_time = req.body.out_time
    const type = req.body.type
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").insertMany([{차량번호 : car_number, 출차시간 : out_time, 유형 : type}])
      if (err) throw err;
      res.json({status : "success"});
    });
})

//-----------------------------------------------------------------------------------
// 특정 차량 데이터 조회
app.post("/status/car/data/id", (req, res) => {
  const car_number = req.body.car_number
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").find({"차량번호":car_number}, {projection:{_id:0}}).toArray(function(err,result) {
      if (err) throw err;
      res.json({found_data : result});
      db.close();
    });
  });
})

// 특정 시점 데이터 조회
app.post("/status/car/data/detail", (req, res) => {
  const start_time = req.body.start_time
  const end_time = req.body.end_time
  const date = req.body.date
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").find({
      $or: [
      {"입차시간":{$gte:start_time}, "출차시간":{$lte:end_time} },
      {"날짜":date},
      {projection:{_id:0}}
      ]
    }).toArray(function(err,result) {
      if (err) throw err;
      res.json({found_data : result});
      db.close();
    });
  });
})

//======================================================================================================================
//주차현황 수정(입차시간)

app.post("/status/car/data/modify/intime", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const in_time = req.body.in_time
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").updateMany({"차량번호" : car_number}, {$set:{"입차시간" : in_time}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차현황 수정(출차시간)

app.post("/status/car/data/modify/outtime", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const out_time = req.body.out_time
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").updateMany({"차량번호" : car_number}, {$set:{"출차시간" : out_time}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차현황 수정(차량번호)

app.post("/status/car/data/modify/carnumber", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const new_number = req.body.new_number
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").updateMany({"차량번호" : car_number}, {$set:{"차량번호" : new_number}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차현황 수정(차량번호)

app.post("/status/car/data/modify/type", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const type = req.body.type
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").updateMany({"차량번호" : car_number}, {$set:{"유형" : type}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})


//path parameter, request parm 0, response 0

app.get("/api/park/:park_id", (req, res) => {
  const park_id = req.params.park_id
  const bark = park.filter(data => data.id == park_id);
    if(park_id > park_area)
    res.json({status:"ok", "이 주차장의 최대 주차 대수" : park_area})
  res.json({Total:park_area, park:bark});
})

//post, request body, response 0

app.post("/api/park/parkBody", (req, res) => {
  const park_id = req.body.id
  const bark = park.filter(data => data.id == park_id);
    if(park_id > park_area)
    res.json({status:"ok", "이 주차장의 최대 주차 대수" : park_area})
  res.json({Total:park_area, park:bark});
})

//path parameter, request parm 0, response 0

app.get("/api/park/number/:car_id", (req, res) => {
  const car_id = req.params.car_id
    if(car_id > park_area)
    res.json({status:"ok", "이 주차장의 최대 주차 대수" : park_area})
  var Free_space = park_area - car_id
  res.json({Total:park_area, Free_space:Free_space});
})

//simple api

app.get("/Hello", (req, res) => {
  res.json({status:"OK", message:"OK", totalData:1, total:park_area});
})


//전체 주차장을 띄워주는 api
app.get("/api/db/park_area/function", (req, res) => {
  getNumberPark();
  res.json({status:"OK", message:"OK", totalspace:PARK_NUMBER});
});


//현황을 띄워주는 api
app.get("/api/db/park_area/function/now", (req, res) => {
  getNumberPark();
  getNumberNowOfCar();

  var Free_space = PARK_NUMBER - CAR_NOW
  console.log(Free_space)
  res.json({status:"OK", message:"OK", totalData:1, placecount:[{total:park_number, Free_space:Free_space}]});
});


// request param x, response 0
// response park_area
app.get("/api/db/park_area", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park_area").find({}, {projection:{_id:0, id:0}}).toArray(function(err,result) {
      if (err) throw err;
      res.json({status:"OK", message:"OK", result:result});
      db.close();
    });
  });
})

// request param 0, response 0
// response park_area
app.get("/api/db/park_area/number", (req, res) => {
  const parkid = req.query.id
  if (parkid < 1 || parkid >10){
    res.json({status:"ERROR-1004", message:"Invalid parkID!", totalData:0, parkTimeInfos:[{}]});
  }

  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park_area").find({"id":parkid}, {projection:{_id:0}}).toArray(function(err,result) {
      if (err) throw err;
      res.json({status:"OK", message:"OK", result:result});
      db.close();
    });
  });
})

// request param x, response 0
// response park_carnumber
app.get("/api/db/park_car/number", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").count({}, function(err,result) {
      if (err) throw err;
      Allcar = car_number = result;
      res.json({status:"OK", message:"OK", Allcar});
      db.close();
    });
  });
})

// request param x, response 0
// response park_area
app.get("/api/db/park_count", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("parkdb");
    dbo.collection("park").find({"depTime":""}, {projection:{_id:0}}).count(function(err,result) {
      if (err) throw err;
      res.json({status:"OK", message:"OK", result:result});
      db.close();
    });
  });
})


// Query parameter, request param O, response O

app.get("/api/park/number/car/car", (req, res) => {
  const car = req.query.car_id
  console.log(car)
    if(car > park_area)
    res.json({status:"ok", "이 주차장의 최대 주차 대수" : park_area})
  var Free_space = park_area - car
  console.log(Free_space)
  res.json({status:"OK", message:"OK", totalData:1, placecount:[{total:park_area, Free_space:Free_space}]});

})

//post, request body, response 0

app.post("/api/park/number/carBody", (req, res) => {
  const car_id = req.body.id
    if(car_id > park_area)
    res.json({status:"ok", "이 주차장의 최대 주차 대수" : park_area})
  var Free_space = park_area - car_id
  res.json({status:"OK", message:"OK", totalData:1, placecount:[{total:park_area, Free_space:Free_space}]});
})

//mongo

app.get("/api/mongo", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    let dbo = db.db("parkdb");
    dbo.collection("park_area").find().toArray(function(err,result) {

      if (err) throw err;
      console.log(result);
      res.json({status:"ok", message:"ok", result:result});
      console.log(result);
      db.close();
		});
	});
})

module.exports = app;