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
	const dbo = db.db("JUCHADB");

	// 전체 차량 대수 확인
	dbo.collection("PARK_STATUS").count({}, function(err, numOfDatas){
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
	const dbo = db.db("JUCHADB");
	// 주차된 차량 대수 확인
	dbo.collection("PARK_STATUS").count({"OUT_TIME":null}, function(err,numOfNowDatas) {
		car_all_now = numOfNowDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}

getNumberNowOfCar().then();



//현재 누적 출차된 고객차량 대수
async function getNumberNowAll1OfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("JUCHADB");
	// 주차된 차량 대수 확인
	dbo.collection("PARK_STATUS").count({"MEMBER_TYPE":"고객", "OUT_TIME":{$exists:true}}, function(err,numOfNowDatas) {
		car_all_1_now = numOfNowDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}

getNumberNowAll1OfCar().then();


//현재 누적 출차된 상점고객차량 대수
async function getNumberNowAll2OfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("JUCHADB");
	// 주차된 차량 대수 확인
	dbo.collection("PARK_STATUS").count({"MEMBER_TYPE":"상점고객", "OUT_TIME":{$exists:true}}, function(err,numOfNowDatas) {
		car_all_2_now = numOfNowDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}

getNumberNowAll2OfCar().then();


//현재 주차되어있는 외부인 차량 대수
async function getNumberNowOutOfCar(){
	MongoClient.connect(uri, function(err, db) {
	if (err) throw err;
	const dbo = db.db("JUCHADB");
	// 주차된 차량 대수 확인
	dbo.collection("PARK_STATUS").count({"MEMBER_TYPE":"고객", "OUT_TIME":null}, function(err,numOfNowOutDatas) {
		car_now = numOfNowOutDatas;
		if(err) throw err;
			db.close();
		});
  });
	await Promise.resolve("ok");
}

getNumberNowOutOfCar().then();
     
//몽고의 주차장 전체공간을 park_number 에 넣어주는 함수
async function getNumberPark(){
	MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("JUCHADB");
  

    //전체 주차장 주차대수 확인
    dbo.collection("PARK_AREA").find({"PARK_NUM":"1"}, {projection:{_id:0,id:0}}).toArray(function(err,result) {
      park_number = result[0]["TOTAL_SPACE"];
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
    const dbo = db.db("JUCHADB");

    //전체 주차장 주차대수 확인
    dbo.collection("PARK_AREA").find({"PARK_NUM":"1"}, {projection:{_id:0,id:0}}).toArray(function(err,result) {
      park_usenumber = result[0]["RENTAL_SPACE"];
      console.log(park_usenumber);
		  if(err) throw err;
			  db.close();
		  });
	});
	await Promise.resolve("ok");
}

getUseNumberPark().then();
//------------------------------------------------------------------------------------------
//전체 인원PARK_NUMBER에 넣어주는 함수
async function getNumberPark2(){
	MongoClient.connect(uri, function(err, db) {
	  if (err) throw err;
	  const dbo = db.db("JUCHADB");

	// 전체대수확인
	  dbo.collection("PARK_STATUS").count({"OUT_TIME":null}, function(err, jucha_number){
		  console.log(jucha_number)
      PARK_NUMBER = 30-jucha_number;
      PARK_GONGAN = 10*PARK_NUMBER/3
		  if(err) throw err;
		  	db.close();
		  });
	});
	await Promise.resolve("ok");
}
getNumberPark2().then();
//---------------------------------------------------------------------------------

//13쪽 주차장 사양조회
app.get("/status/car/space", (req, res) => {
  getNumberPark();
  res.json({park_setting : { TOTAL_SPACE:park_number, RENTAL_SPACE:park_usenumber }});
});


//---------------------------------------------------------------------------------

//주차장 실시간 주차 대수 확인(전체)
app.get("/status/car/space/now/all", (req, res) => {
  getNumberOfCar()
  getNumberNowOfCar()
  getNumberNowAll1OfCar()
  getNumberNowAll2OfCar()
  getNumberNowOutOfCar()
  getNumberPark()
  getUseNumberPark()
  getNumberPark2()
  res.json({park_setting : { PARK_NUMBER,PARK_GONGAN,TOTAL_SPACE:park_number, RENTAL_SPACE:park_usenumber ,"현재 전체 주차 대수":car_all_now}});
});

//---------------------------------------------------------------------------------

//오늘 하루 현재 누적 출차된 차량
app.get("/status/car/space/now/all/today", (req, res) => {
  getNumberNowAll1OfCar()
  getNumberNowAll2OfCar()
  res.json({park_setting : { TOTAL_SPACE:park_number, RENTAL_SPACE:park_usenumber ,CAR_COUNT:car_all_1_now+car_all_2_now}});
});




//---------------------------------------------------------------------------------

//주차장 실시간 주차 대수 확인(고객)
app.get("/status/car/space/now", (req, res) => {
  getNumberNowOfCar();
  res.json({park_setting : { TOTAL_SPACE:park_number, RENTAL_SPACE:park_usenumber ,"현재 고객 주차 대수":car_now}});
});

//---------------------------------------------------------------------------------

//주차장 실시간 주차 가능 공간 확인(전체용)
app.get("/status/car/space/total", (req, res) => {
  getNumberPark();
  getNumberNowOutOfCar();
  res.json({park_number, car_all_now ,park_setting : { now_place:(park_number - car_all_now)}});
});



//---------------------------------------------------------------------------------

//주차장 실시간 주차 가능 공간 확인(고객용)
app.get("/status/car/space/possible", (req, res) => {
  getNumberOfCar()
  getNumberNowOfCar()
  getNumberNowAll1OfCar()
  getNumberNowAll2OfCar()
  getNumberNowOutOfCar()
  getNumberPark()
  getUseNumberPark()
  
  res.json({park_usenumber, car_now ,park_setting : { now_place:(park_usenumber - car_now)}});
});

//-----------------------------------------------------------------------------------
//14쪽 실시간 현황 데이터 조회
app.get("/status/car/data/all", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").find({}, {projection:{_id:0, id:0}}).sort({"IN_TIME" : -1}).toArray(function(err,result) {
      if (err) throw err;
      res.json( {current_data : result});
      db.close();
    });
  });
})

//======================================================================================================================
//입차 데이터 추가

app.post("/status/car/data/add/enter", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.body.car_number
    const enter_time = req.body.enter_time
    const type = req.body.type

    console.log(car_number)
    console.log(enter_time)
    console.log(type)

    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").insertMany([{CAR_NUM :  car_number, IN_TIME : enter_time, MEMBER_TYPE : type}])
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").insertMany([{CAR_NUM : car_number, OUT_TIME : out_time, MEMBER_TYPE : type}])
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").find({"CAR_NUM":car_number}, {projection:{_id:0}}).toArray(function(err,result) {
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").find({
      $or: [
      {"IN_TIME":{$gte:start_time}, "OUT_TIME":{$lte:end_time} },
      {"VISIT_DATE":date},
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").updateMany({"CAR_NUM" : car_number}, {$set:{"IN_TIME" : in_time}}, {upsert: true})
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").updateMany({"CAR_NUM" : car_number}, {$set:{"OUT_TIME" : out_time}}, {upsert: true})
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
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").updateMany({"CAR_NUM" : car_number}, {$set:{"CAR_NUM" : new_number}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차장 사양 추가

app.post("/status/car/data/add/park", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const park_num = req.body.park_num
    const total_space = req.body.total_space
    const rental_space = req.body.rental_space
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_AREA").insertMany([{PARK_NUM : park_num, RENTAL_SPACE : rental_space, TOTAL_SPACE : total_space}])
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차장 사양 수정(total_space)

app.post("/status/car/data/modify/park/total", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const park_num = req.body.park_num
    const total_space = req.body.total_space
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_AREA").updateMany({"PARK_NUM" : park_num}, {$set:{"TOTAL_SPACE" : total_space}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차장 사양 수정(rental_space)

app.post("/status/car/data/modify/park/rental", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const park_num = req.body.park_num
    const rental_space = req.body.rental_space
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_AREA").updateMany({"PARK_NUM" : park_num}, {$set:{"RENTAL_SPACE" : rental_space}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
  })
//======================================================================================================================
//주차장 사양 수정(둘다)

app.post("/status/car/data/modify/park/double", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const park_num = req.body.park_num
    const total_space = req.body.total_space
    const rental_space = req.body.rental_space
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_AREA").updateMany({"PARK_NUM" : park_num}, {$set:{"TOTAL_SPACE" : total_space, "RENTAL_SPACE": rental_space}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//입차 데이터 추가 get

app.get("/status/car/data/add/enter/get", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.query.car_number
    const enter_time = req.query.enter_time
    const type = req.query.type
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").insertMany([{CAR_NUM :  car_number, IN_TIME : enter_time, MEMBER_TYPE : type}])
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//출차 데이터 추가

app.get("/status/car/data/add/out/get", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.query.car_number
    const out_time = req.query.out_time
    const type = req.query.type
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").insertMany([{CAR_NUM : car_number, OUT_TIME : out_time, MEMBER_TYPE : type}])
      if (err) throw err;
      res.json({status : "success"});
    });
})

//======================================================================================================================
//주차현황 수정(출차시간) get

app.get("/status/car/data/modify/outtime/get", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    const car_number = req.query.car_number
    const out_time = req.query.out_time
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").updateMany({"CAR_NUM" : car_number}, {$set:{"OUT_TIME" : out_time}}, {upsert: true})
      if (err) throw err;
      res.json({status : "success"});
    });
})

//-----------------------------------------------------------------------------------
//14쪽 실시간 현황 데이터 조회
app.get("/status/car/data/all/cli", (req, res) => {
  MongoClient.connect(uri, function(err, db) {
    if (err) throw err;
    const dbo = db.db("JUCHADB");
    dbo.collection("PARK_STATUS").find({"MEMBER_TYPE" : "고객"}, {projection:{_id:0, id:0}}).sort({"IN_TIME" : -1}).toArray(function(err,result) {
      if (err) throw err;
      res.json( {current_data : result});
      db.close();
    });
  });
})


module.exports = app;
