$(document).ready(function(){
    makeplot();
})

function makeplot() {
    Plotly.d3.csv("los-angeles-metro-bike-share-trip-data/metro-bike-share-trip-data.csv", function(data){ processData(data) } );

};

function sortSecond(a, b) {
    if(a[1] == b[1]){
        return 0;
    } else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function processData(allRows) {

    var tripID = [];
    var durations = [];
    var sTime = [];
    var eTime = [];
    var sStations = [];
    var eStations = [];
    var sLat = [];
    var sLon = [];
    var eLat = [];
    var eLon = [];
    var bikeID = [];
    var tCat = [];
    var passes = [];
    for (var i=0; i<allRows.length; i++) {
        row = allRows[i];
        tripID.push( row['Trip ID']);
        durations.push( row['Duration']);
        sTime.push(row['Start Time']);
        eTime.push(row['End Time']);
        sStations.push( row['Starting Station ID']);
        eStations.push(row['Ending Station ID']);
        sLat.push(row['Starting Station Latitude']);
        sLon.push(row['Starting Station Longitude']);
        eLat.push(row['Ending Station Latitude']);
        eLon.push(row['Ending Station Longitude']);
        bikeID.push(row['Bike ID']);
        tCat.push(row['Trip Route Category']);
        passes.push(row['Passholder Type']);
    }


    var startStations = [];
    var startCounts = [];
    for (var i = 0; i < sStations.length; i++) {
        if(startStations.includes(sStations[i])){
            j = startStations.indexOf(sStations[i]);
            startCounts[j] += 1;
        } else {
            startCounts.push(1);
            startStations.push(sStations[i]);
        }
    }
    var startData = [];
    for(var i = 0; i < startStations.length; i++){
        startData.push([startStations[i], startCounts[i]]);
    }
    startData.sort(sortSecond);
    
    var sortStations = [];
    var sortCounts = [];
    for(var i = 0; i < 15; i++){
        sortStations.push("S. " + startData[i][0].toString());
        sortCounts.push(startData[i][1]);
    }
    popStations(sortStations, sortCounts);

    var distances = [];
    for(var i = 0; i < sLat.length; i++){
        distances.push((distance(sLat[i], sLon[i], eLat[i], eLon[i])));
    }

    var aDistances = [];
    for(var i = 0; i < distances.length; i++){
        if(distances[i] < 1){
            aDistances.push(distances[i]);
        }
    }
    dHist(aDistances);


    var shour = [];
    var ehour = [];
    for(var i = 0; i < sTime.length; i++){
        shour.push(sTime[i].substring(11, 13));
        ehour.push(eTime[i].substring(11, 13));
    }
    hHist(shour, ehour);
    hHist2(shour, ehour);

    aDurations = [];
    for(var i = 0; i < durations.length; i ++){
        if(durations[i] < 2000){
            aDurations.push(durations[i]);
        }
    }
    gHist(aDurations);

    regulars(passes);
    
    var round_flex = 0;
    var round_month = 0;
    var round_walk = 0;
    var one_flex = 0;
    var one_month = 0;
    var one_walk = 0;
    for(var i = 0; i < tCat.length; i++){
        if(tCat[i] == "Round Trip"){
            if(passes[i] == "Flex Pass"){
                round_flex += 1;
            } else if(passes[i] == "Monthly Pass"){
                round_month += 1;
            } else {
                round_walk += 1;
            }
        } else if(tCat[i] == "One Way"){
            if(passes[i] == "Flex Pass"){
                one_flex += 1;
            } else if(passes[i] == "Monthly Pass"){
                one_month += 1;
            } else {
                one_walk += 1;
            }
        }
    }
    makeTable(round_flex, round_month, round_walk, one_flex, one_month, one_walk);


}

function makeTable(round_flex, round_month, round_walk, one_flex, one_month, one_walk){
    var values = [["Flex Pass", "Montly Pass", "Walk-up", ["Total"]], 
    [round_flex, round_month, round_walk, round_flex + round_month + round_walk],
    [one_flex, one_month, one_walk, one_flex + one_month + one_walk],
    [round_flex + one_flex, round_month + one_month, round_walk + one_walk, 
    round_flex + round_month + round_walk + one_flex + one_month + one_walk]];

    var data = [{
        type: 'table',
        header: {
            values: [["Passes"], ["Round Trip"], ["One Way"], ["Total"]],
            align: "center",
            line: {width: 1, color: 'black'},
            fill: {color: "RoyalBlue"},
            font: {family: "Arial", size: 16, color: "white"}
        },
        cells: {
            values: values,
            height: "30",
            align: "center",
            line: {color: "black", width: 1},
            fill: {color: ["PowderBlue", "white"]},
            font: {family: "Arial", size: 14, color: ["black"]}
        }
    }]
    var layout = {title: "Trip Route and Pass Type"}

    Plotly.plot('graph', data, layout);

    var trace1 = {
        x: ["Flex Pass", "Monthly Pass", "Walk-up"],
        y: [round_flex, round_month, round_walk],
        marker: {color: 'MediumTurquoise'},
        name: "Round Trip",
        type: 'scatter'
      };
      
      var trace2 = {
        x: ["Flex Pass", "Monthly Pass", "Walk-up"],
        y: [one_flex, one_month, one_walk],
        marker: {color: 'Orange'},
        name: "One Way",
        type: 'scatter'
      };
      var layout = {
          title: "Interaction Between Trip Route and Pass Type",
          xaxis: {
              title: "Pass Type"
          },
          yaxis: {
              title: "Trip Route"
          }
      }
      var data = [trace1, trace2];
      
      Plotly.newPlot('splot', data, layout);
    

}

function hHist(shours, ehours){
    var trace1 = {
        x: shours,
        name: "Starting Hour",
        opacity: 0.7,
        marker: {color: 'blue', line: {width: 1}},
        type: 'histogram',
    };
    var trace2 = {
        x: ehours,
        name: "Ending Hour",
        opacity: 0.7,
        marker: {color: 'red', line: {width: 1}},
        type: 'histogram',
    };
    var data = [trace1, trace2];
    var layout = {
            title: "Starting Hours vs. Ending Hours Stacked", 
            xaxis: {
                title: "Hour of the Day"
            },
            yaxis: {
                title: "Frequency"
            },
            barmode: "stack"};
    Plotly.newPlot('hHist', data, layout);
}

function hHist2(shours, ehours){
    var trace1 = {
        x: shours,
        name: "Starting Hour",
        opacity: 0.6,
        marker: {color: 'red', line: {width: 1}} ,
        type: 'histogram',
    };
    var trace2 = {
        x: ehours,
        name: "Ending Hour",
        opacity: 0.6,
        marker: {color: 'blue', line: {width: 1}}, 
        type: 'histogram',
    };
    var data = [trace1, trace2];
    var layout = {
            title: "Starting Hours vs. Ending Hours Overlapping",
            xaxis: {
                title: "Hour of the Day"
            },
            yaxis: {
                title: "Frequency"
            },
            barmode: "overlay"};
    Plotly.newPlot('hHist2', data, layout)
}

function gHist(hours){
    var trace = {
        x: hours,
        xbins: {size: 150},
        marker: {color: 'green', line: {width: 2}},
        type: 'histogram'
    };
    var layout = {
            title: "Durations of Trips",
            xaxis: {
                title: "Duration (Minutes)"
            },
            yaxis: {
                title: "Frequency"
            }
        }
    var data = [trace];
    Plotly.newPlot('gHist', data, layout);
}

function dHist(distances){
    var trace = {
        x: distances,
        nbinsx: 10,
        marker: {color: 'goldenrod', line: {width: 2}},
        type: 'histogram',
    };
    var layout = {
            title: "Distribution of Distances Under 1 Mile",
            xaxis: {
                title: "Distance (Miles)"
            },
            yaxis: {
                title: "Frequency"
            }
        }
    var data = [trace];
    Plotly.newPlot('dHist', data, layout);
}

function regulars(passes){
    var count = 0;
    for(var i = 0; i < passes.length; i++) {
        if(passes[i] == "Walk-up"){
            count += 1;
        }
    }
    console.log(passes.length - count);
    return (passes.length - count);
}

function popStations(x, y){
    var plotDiv = document.getElementById("plot");
    var traces = [{
        x: x,
        y: y, 
        marker: {line: {width: 2}},
        type: 'bar'
    }];
    var layout = {
        title: "Top 15 Most Popular Stations",
        xaxis: {
            title: "Station Number",
        },
        yaxis: {
            title: "Frequency of Departures"
        }
    }

    Plotly.newPlot('plot', traces, layout);
};

function avg(elements){
    var total = 0;
    for(var i = 0; i < elements.length; i++){
        total += elements[i];
    }
    return(Math.round(total/elements.length));
}

function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	return dist
}
