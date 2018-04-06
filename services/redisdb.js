var redisClient;
var bcrypt = require('bcrypt');
// var config = require('./config.json');

function registerUser(userdata, callback)
{
  var responseMsg;
  redisClient.exists(userdata.pseudoname, function(err,results) {
    if(results){
      responseMsg='409'
    }else{
      responseMsg='201'
      redisClient.hmset(userdata.pseudoname, userdata);
    }
    return callback(responseMsg);
  })
  return 0;
}



function saveTeam(teamdata,callback)
{
  var team = [];
  var teamExist;

  redisClient.hgetall("teamsinfo",function(err,obj) {
    if(obj)
    {
      Object.keys(obj).forEach(key => {
        //console.log("keyyy :"+key);          // the name of the current key.
        //  console.log("val : "+obj[key]);   // the value of the current key.
        var objson=JSON.parse(obj[key]);
        if(objson.teamname!=teamdata.teamname){
          //team.push(obj[key]);
        }else{
          teamExist="409";
          //team.push(obj[key]);
        }
      });
      //console.log("outside team : "+team);
      //console.log("Exist_team : "+teamExist);
      if(teamExist=="409"){
        //  console.log("Exist_team : "+teamExist);

        return callback(teamExist);
      }else{
        redisClient.hmset("teamsinfo",teamdata.id, JSON.stringify(teamdata));
        redisClient.hgetall("teamsinfo", function (err, oabj) {
          Object.keys(oabj).forEach(key => {

            team.push(oabj[key]);


          });
          return callback(team);
        });
      }
    }else{
      redisClient.hmset("teamsinfo",teamdata.id, JSON.stringify(teamdata),function(err,res){
        if(err){
          return callback(err);
        }
        else{
          redisClient.hgetall("teamsinfo", function (err, oabj) {
            Object.keys(oabj).forEach(key => {
              team.push(oabj[key]);
            });
            return callback(team);
          });
        }
      });
    }
  });
}

function getAllTeams(callback) {
  var team = [];
  redisClient.hgetall("teamsinfo",function(err,obj) {
    if(obj){
      Object.keys(obj).forEach(key => {
        var objson=JSON.parse(obj[key]);
        team.push(obj[key]);
      });
    }
    else{}
    return callback(team);
  });
}

function userAuthentication(username, userPassword, callback)
{
  redisClient.hmget(username,["pseudoname", "hash"], function (err, obj)
  {
    var data = []
    if(obj!=",")
    {
      obj.forEach(function (reply, i)
      {
        data.push(obj[i]);
      });
      var password=bcrypt.compare(userPassword, data[1]);
      if(username==data[0] && password)
      {
        getAllUsers(username,function(res){
          return callback(res);
        });
      }
      else
      {
        return callback("401");
      }
    }
    else
    {
      return callback("401");
    }
  });
}

function getAllUsers(pseudoName,callback)
{
  console.log("name :"+pseudoName)
  redisClient.hgetall(pseudoName,function(err,reply) {
    return callback(reply)
  });
}

module.exports = function(callback)
{
  var redis = require('redis');
  redisClient = redis.createClient(
    {
      host : 'localhost',
      port : 6379
    });
    redisClient.on('ready',function()
    {
      callback(
        {
          registerUser : registerUser,
          userAuthentication : userAuthentication,
          saveTeam:saveTeam,
          getAllUsers:getAllUsers,
          getAllTeams:getAllTeams
        });
      }
    );
    redisClient.on('error',function(err)
    {
      console.log(err);
    }
  );
}
