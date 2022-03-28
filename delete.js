const { MongoClient } = require('mongodb');
const env =require("dotenv").config({ path: "/home/bitnami/payment/.env"});
var uri = process.env.uri;
var urp = process.env.urp;

var dele = true;
async function del(){
  MongoClient.connect(uri, function(err, db) {
      if (err) throw err;
      const dbo = db.db("JUCHADB");
      dbo.collection("PARK_STATUS").deleteMany({"OUT_TIME" : {$exists: true} })
      console.log("merong")
      dele = false;
        if (err) throw err;
        setTimeout(() => process.exit(0), 4000);
          // if ( dele == false) {
          // console.log("merong")
          
          // process.exit(0);
          // },4000);
        });
        // await Promise.resolve("ok");
};
del().then();