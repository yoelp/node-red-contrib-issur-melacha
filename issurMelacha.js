
module.exports = function(RED) {
	"use strict"
	var HeDate = require('he-date');
	var kosherZmamin = require('kosher-zmanim');
	
	function getHeDateMonth(hedate) {
		var monthName = hedate.toDateString().match(/^.+?\d\d (.+) \d{4}$/)[1];
		return monthName
	}
	function isEventInHolidays(month, day, evt){
		return holidays[month] && holidays[month][day] && holidays[month][day][evt];
	}
	var holidays = {
		"Nisan": {
			// Day is 1 based;
			"14" : {
				"start": true,
			},
			"15" : {
				"ilEnd": true,
				"chulFull": true
			},
			"16" : {
				"chulEnd": true
			},
			"20" : {
				"start": true
			},
			"21" : {
				"ilEnd": true,
				"chulFull": true
			},
			"22" : {
				"chulEnd": true
			}
		},
		"Sivan": {
			"5" : {
				"start": true
			},
			"6" : {
				"ilEnd": true,
				"chulFull": true
			},
			"7" : {
				"chulEnd": true
			}
		},
		"Elul": {
			"29" : {
				"start": true,
			}
		},
		"Tishri" : {
			"1": {
				"ilFull": true,
				"chulFull": true
			},
			"2": {
				"ilEnd": true,
				"chulEnd": true
			},
			"9": {
				"ilStart": true,
				"chulStart": true
			},
			"10": {
				"ilEnd": true,
				"chulEnd": true	
			},
			"14" : {
				"start": true
			},
			"15" : {
				"ilEnd": true,
				"chulFull": true
			},
			"16" : {
				"chulEnd" : true
			},
			"21" : {
				"start" :true
			},
			"22" : {
				"ilEnd": true,
				"chulFull": true
			},
			"23" : {
				"chulEnd" : true
			}
		}
	}
    function IssurMelacha(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		node.startoffset = Number(config.startoffset);
		node.endoffset = Number(config.endoffset);
		node.intervalSettings = {
			msg: null,
			delay: Number(config.delay) && Number(config.delaytype) * Number(config.delay),
			interval: null,
			
		}
		function isurInEffectNow(end){
			var zmanim = kosherZmamin.getZmanimJson({
				latitude: node.lat,
				longitude: node.lon
			}).BasicZmanim;
			if(end){
				// check if before end zman
				if( ((new Date(zmanim.Tzais72)).getTime() + node.endoffset) - Date.now() >= 0)
					return true;
			} else {
				// check if after start zman
				if( ((new Date(zmanim.Sunset)).getTime() + node.startoffset) - Date.now() <= 0)
					return true;
			}
			return false;
		}
		function isIssurMelachaInEffect(){
				var day = (new Date()).getDay();
				var chul = config.diaspora;
				var il = !chul;
				var heDate = new HeDate()
				var jDay = heDate.getDate();
				var jMonth = getHeDateMonth(heDate);
				var usor = false;
				if(
					(chul && isEventInHolidays(jMonth,jDay,"chulFull")) ||
					(il && isEventInHolidays(jMonth,jDay,"ilFull"))
				) {
					// full day
					usor = true;
				} else if(
					(
					day === 5 || // friday
					isEventInHolidays(jMonth,jDay,"start") // erev yo"t
					) && isurInEffectNow(0)
				){
					// start
					usor = true;
				} else if( 
					(
						day === 6 || //shabbes
						(il && isEventInHolidays(jMonth,jDay,"ilEnd")) || // yo"t end il
						(chul && isEventInHolidays(jMonth,jDay,"chulEnd")) // yo"t end il
					) && isurInEffectNow(1)
				){
					// end
					usor = true;
				}
				return usor
			}
        node.on('input', function(msg) {
			var usor = isIssurMelachaInEffect();
			if(usor){
				node.send([msg, null]);
				if(node.intervalSettings.interval){
					clearInterval(node.intervalSettings.interval);
				}
				if(node.intervalSettings.delay){
					node.intervalSettings.msg = msg;
					node.intervalSettings.interval = setInterval(function(){
						if(!isIssurMelachaInEffect()){
							clearInterval(node.intervalSettings.interval);
							return;
						}
						node.send([node.intervalSettings.msg, null]);
					}, node.intervalSettings.delay);
				}
			} else {
				if(node.intervalSettings.interval){
					node.intervalSettings.msg = null;
					clearInterval(node.intervalSettings.interval);
				}
				node.send([null, msg]);
			}
        });
		node.on('close', function(){
			if(node.intervalSettings.interval){
					clearInterval(node.intervalSettings.interval);
				}
		});
    }
    RED.nodes.registerType("issur-melacha",IssurMelacha);
}