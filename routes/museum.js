var express = require('express');
var router = express.Router();
var dbClient = require('./ifDb');

router.all('/', function(req, res, next) {
	var query = req.query;

	var sql = 'SELECT * FROM bggdatacn WHERE nameCN != ""'

	if(query.name) {
		sql += ' AND nameCN like "%' + query.name + '%"'
    } else {
        query.name = ""
    }
    if(query.minPlayers) {
        sql += ' AND minplayers <= ' + query.minPlayers
        sql += ' AND maxplayers >= ' + query.minPlayers
    } else {
    	query.minPlayers = "";
    }
    if(query.maxPlayers) {
        sql += ' AND minplayers <= ' + query.maxPlayers
        sql += ' AND maxplayers >= ' + query.maxPlayers
    } else {
    	query.maxPlayers = "";	
    }

    sql += ' ORDER BY average DESC LIMIT 10'

    console.log(sql);

    dbClient.query(sql, null, function (err, results, fields) {
        if (err) {throw err;}

        if(results) {
            res.render('museum_list', {"query": query, "gameData" : results});
        }
    });
});


var pageFunction = {
	"info" : function(gameData, req, res, next) {
	    //gameData.rates = new Number(gameData.average).toFixed(1)
        //gameData.weight = new Number(gameData.averageweight).toFixed(2)
        gameData.docTitle = gameData.nameCN + "简介";
		res.render('museum_info', gameData);
	},
	"rule" : function(gameData, req, res, next) {
	    //gameData.rates = new Number(gameData.average).toFixed(1)
        //gameData.weight = new Number(gameData.averageweight).toFixed(2)
        gameData.docTitle = gameData.nameCN + "规则";
		res.render('museum_rule', gameData);
	},
}

var gameItem = function(req, res, next) {
	var sql = 'SELECT * FROM bggdatacn WHERE gameid = ?';
    var sqlParams = [req.params.id];

    dbClient.query(sql, sqlParams, function (err, results, fields) {
        if (err) {
        	console.log(err);
        }

        if(results) {
        	var needRedirect = false;
        	var page = "info";
            gameData = results[0]

            //	TODO 字符串转换
            var expectedName = gameData.nameCN;

            if(req.params.name != expectedName) {
            	needRedirect = true;
            }

            if (req.params.page && (req.params.page in pageFunction)) {
            	page = req.params.page;
            } else {
            	needRedirect = true;
            }

            if (needRedirect) {
            	res.redirect(req.baseUrl+'/' + req.params.id + '/'+expectedName+'/'+page);
            	return;
            }

            pageFunction[page](gameData, req, res, next);
        }
    });
}

router.all('/:id', gameItem);
router.all('/:id/:name', gameItem);
router.all('/:id/:name/:page', gameItem);

module.exports = router;