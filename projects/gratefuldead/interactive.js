// JavaScript Document
function filterCSV(csv, key, value) {
	var result = [];
	csv.forEach(function(d, i, column) {
		if(d[key] == value) {
			result.push(d);
		}
	});
	return result;
}
/*var menuContainer = d3.select('body')
					.append('div')
					.attr('class','menuContainer');
					
var mapContainer = d3.select('body')
					.append('div')
					.attr('class','mapContainer');
					
var textContainer = d3.select('body')
					.append('div')
					.attr('class','textContainer');
					
var beeContainer = d3.select('body')
					.append('div')
					.attr('class','beeContainer');*/



////map intro					
var marginMap = {top:20,right:20,bottom:30,left:50},
	widthMap = parseInt(d3.select('.map-container').style('width'), 10),
	widthMap = widthMap - marginMap.left - marginMap.right,
    heightMap = 500 - marginMap.top - marginMap.bottom;

var svgMap = d3.select(".map-container").append("svg")
    .attr("width", widthMap + marginMap.left + marginMap.right)
    .attr("height", heightMap + marginMap.top + marginMap.bottom);

var projection = d3.geoAlbersUsa();
var formatValue = d3.format(',.2f');

var radius = d3.scaleSqrt()
				.domain([0, 36])
				.range([2,15]);

var path = d3.geoPath()
		.projection(projection); 

////bee intro
var	beewidth = parseInt(d3.select('.beechart-container').style('width'), 10),
	beewidth = beewidth - marginMap.left - marginMap.right,
	beeheight = 400 - marginMap.top - marginMap.bottom;
		
var svgBee = d3.select(".beechart-container").append("svg")
    .attr("width", beewidth + marginMap.left + marginMap.right)
    .attr("height", beeheight + marginMap.top + marginMap.bottom);
		
var xBee = d3.scaleLinear().range([0, beewidth]);
	
var gBee = svgBee.append("g")
	.attr('class','bee-g')
    .attr("transform", "translate(" + marginMap.left + "," + marginMap.top + ")");

var radiusB = d3.scaleSqrt()
				.domain([0, 36])
				.range([2,5]);	
				
var beeAxis = d3.axisBottom(xBee)
					.tickSize(-beeheight)
					.ticks(10, '.0s');
					

d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json", function(error, us) {
    if (error) throw error;
	projection
      .scale(widthMap*1.25)
	  .translate([widthMap/2,heightMap/2])
	  //.attr('transform','translate(' + (width / 2) + ',' + (height / 2) + ')');
    
	svgMap.append("g")
        .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
        .attr("d", path);

    svgMap.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

    d3.csv('https://github.com/allenisaac/allenisaac.github.io/projects/gratefuldead/map2data.csv', type, function(error, data){
        if (error) throw error;
		
		var months = d3.nest()
						.key(function(d){ return d.month; }).sortKeys(d3.ascending)
						.entries(data);
		
		
		var years = d3.nest()
						.key(function(d){ return d.year; }).sortKeys(d3.ascending)
						.entries(data);

		var days = d3.nest()
						.key(function(d){ return d.day; }).sortKeys(d3.ascending)
						.entries(data);
						
		var venueCount = d3.nest()
							.key(function(d){return d.location})
							.rollup(function(d) {return d.length})
							.entries(data)
		                    .sort(function(a, b){ return d3.descending(a.value, b.value); })
							
		data.sort(function(a,b){return b.fixedfinal - a.fixedfinal});
		
//// Creating the Map						
        svgMap.selectAll('.bubble')
            .data(data).enter()
            .append('circle')
			.attr('class', 'bubble')
            .attr('cx',function (d){ if (projection([+d.lon,+d.lat]) != null){return projection([+d.lon,+d.lat])['0']; }})
            .attr('cy', function (d){ if (projection([+d.lon,+d.lat]) != null){ return projection([+d.lon, +d.lat])[1]; }})
            .attr('r',function(d) {return radius(+d.n)})
			
		svgMap.selectAll('.bubble')
			.on('mouseover',function() { tooltipMap.style('display',null);})
			.on('mouseout',function() { tooltipMap.style('display','none');})
			.on('mousemove', function(d) {
				var isLeft = (d3.mouse(this)[0] < widthMap/2),
					isTop = (d3.mouse(this)[1] < heightMap/2);
				tooltipMap.select('.venue-text').text(d.venue);
				tooltipMap.select('.date-text').text('Played on ' + d.month + ' ' + d.day + ', ' + d.year);
				tooltipMap.select('.songs-text').text('Played ' + d.n + ' songs');
				var dim = tooltipMap.select('.venue-text').node().getBBox().width;
				tooltipMap.select('rect')
						.attr('width', (dim + 18));
				if (isLeft) { var xPos = d3.mouse(this)[0] } else { var xPos = d3.mouse(this)[0] - dim - 18};
				if (isTop) { var yPos = d3.mouse(this)[1] } else { var yPos = d3.mouse(this)[1] - 75};
				tooltipMap.attr("transform", "translate(" + xPos + "," + yPos + ")");

				});
/////Map tooltipMap info				
		var tooltipMap = svgMap.append('g')
			.attr('class','tooltipMap')
			.style('display','none');
		
		tooltipMap.append('rect')
			.attr('height', 75)
			.attr('fill','white')
			.style('opacity',0.9);
			
		tooltipMap.append('text')
			.attr('class','venue-text')
			.attr('x',9)
			.attr('dy','1.35em')
			.attr('font-size','15px');

		tooltipMap.append('text')
			.attr('class','date-text')
			.attr('x',9)
			.attr('dy','2.7em')
			.attr('font-size','15px');	
			
		tooltipMap.append('text')
			.attr('class','songs-text')
			.attr('x',9)
			.attr('dy','4.05em')
			.attr('font-size','15px');				

/////beechart creation			
	    xBee.domain(d3.extent(data, function(d){ return d.fixedfinal; }));
		//x.domain([0,10])
		var simulation = d3.forceSimulation(data)
                        .force('x', d3.forceX(function(d) { return xBee(d.fixedfinal);}).strength(1))
                        .force('y', d3.forceY(beeheight/2))
                        .force('collide', d3.forceCollide(function(d) {return (radiusB(d.n))}))
                        .stop();

		var n = data.length
			
	    for(var i = 0; i< 360; ++i) simulation.tick();


			
		gBee.append('g')
			.attr('class','axisM axis--xM beechart bee-g')
			.attr('transform','translate(0,' + beeheight + ')')
			.call(customXAxis);
			
		function customXAxis(gBee) {
			gBee.call(beeAxis);
			gBee.select('.domain').remove();
			gBee.selectAll('.axis--xM line').attr('stroke-dasharray','5,3');
			gBee.selectAll('tick text').attr('x', 4).attr('dy', -4);
		}



			
		var cell = gBee.append('g')
						.attr('class','cells bee-g')
					.selectAll('.bee-g').data(d3.voronoi()
						.extent([[-marginMap.left, -marginMap.top], [beewidth + marginMap.right, beeheight + marginMap.top]])
						//.extent([[0,0], [beewidth, beeheight]])						
						.x(function(d){ return d.x; })
						.y(function(d) { return d.y; })
					.polygons(data)).enter().append('g');

					
		cell.append('circle')
			.attr('r', function(d) { return radiusB(d.data.n) })
			.attr('cx', function(d) {  return d.data.x; })
			.attr('cy', function(d) { return d.data.y; });

		cell.append('path')
			.attr('d', function(d) { return 'M' + d.join('L') + 'Z'; });
			
			
			
			
////Dropdown creation			
		var dateMenu = d3.select('.menu-container');
		
		dateMenu.append('select')
					.attr('class','dropmen label year-menu')
					.selectAll('option')
						.data([{key:'Year'}].concat(years))
						.enter()
						.append('option')
							.attr('value', function(d){ return d.key; })
							.text(function(d){return d.key; });
							

		dateMenu.append('select')
					.attr('class','dropmen label month-menu')
					.selectAll('option')
						.data([{key:'Month'}].concat(months))
						.enter()
						.append('option')
							.attr('value', function(d){ return d.key; })
							.text(function(d){return d.key; })		
							
		dateMenu.append('select')
					.attr('class','dropmen label day-menu')
					.selectAll('option')
						.data([{key:'Day'}].concat(days))
						.enter()
						.append('option')
							.attr('value', function(d){ return d.key; })
							.text(function(d){return d.key; });		


/////updating graphs
		var updateGraph = function(year, month, day){
			svgMap.selectAll('.bubble')
				.style('display',function(d) {
								var yearO = (year == 'Year' || d.year == year) ? 1 : 0,
									monthO = (month == 'Month' || d.month == month) ? 1 : 0,
									dayO = (day == 'Day' || d.day == day) ? 1 : 0;
								if( yearO * monthO * dayO == 1) { return null} else {return 'none'};
						});
			svgBee.select('.cells').selectAll('circle')
					.style('fill', function(d) {
								var yearO = (year == 'Year' || d.data.year == year) ? 1 : 0,
									monthO = (month == 'Month' || d.data.month == month) ? 1 : 0,
									dayO = (day == 'Day' || d.data.day == day) ? 1 : 0;
								if( yearO * monthO * dayO == 1) { return '#56B896'} else {return '#89858B';}								
						})
					.style('opacity', function(d) {
								var yearO = (year == 'Year' || d.data.year == year) ? 1 : 0,
									monthO = (month == 'Month' || d.data.month == month) ? 1 : 0,
									dayO = (day == 'Day' || d.data.day == day) ? 1 : 0;
								if( yearO * monthO * dayO == 1) { return 1} else {return 0.2};								
						});	
		
			
		};
		
		//console.log(d3.values(data).filter(function(d) {return (d.month == month && d.year == year && d.day == day)}).map(function(d) { return d.n}));
		
		
	//	d3.csv('songdata.csv', type, function(error, songdata){
		var textPlace = d3.select('.interactive-textcontainer').append('g');
		
		d3.select('.interactive-textcontainer').append('p')
						.attr('id','line1')
						.text('');
						
		d3.select('.interactive-textcontainer').append('p')
					.attr('id','line2')
					.text('');
					
		d3.select('.interactive-textcontainer').append('p')
					.attr('id','line3')
					.text('');
		
		d3.select('.interactive-textcontainer').append('p')
					.attr('id','line4')
					.text('');
			
			var updateText = function(year, month, day){
				var dateData = data.filter(function(d) {return (d.month == month && d.year == year && d.day == day)})
				if(year == 'Year' || month == 'Month' || day == 'Day') {
					d3.select('#line1').text('')
					d3.select('#line2').text('')
					d3.select('#line3').text('')
					d3.select('#line4').text('')
				} else if (dateData.length == 0) {
					d3.select('#line1').text('')
					d3.select('#line2').text('')
					d3.select('#line3').text('')
					d3.select('#line4').text('') } else {
					var currentVenue = dateData.map(function(d){return d.location});	
					var thisV = venueCount.filter(function(d){return d.key == currentVenue;});
					var thisVenueCount = d3.values(thisV).map(function(d) {return d.value});
					var venueRank = d3.values(venueCount).findIndex(function(d){return d.key == currentVenue}) + 1
					console.log(venueRank)
					var uniquenessScore = formatValue(d3.values(dateData).map(function(d) {return d.fixedfinal}));
					var uniquenessRankHelp = d3.values(dateData).map(function(d) {return d.ext});
					var uniquenessRank = d3.values(data).findIndex(function(d){return d.ext == uniquenessRankHelp}) + 1

					var uniquenessPerc = formatValue((1 - (uniquenessRank/2318))*100)
					
					var dateText = month + ' ' + day + ', ' + year,
						venueText = 'The Grateful Dead played at ' + currentVenue + ' ' + thisVenueCount + ' times.',
						venueText2 = 'It was the ' + ordinal_suffix_of(venueRank) + ' most played venue.',
						uniquenessText = 'The concert(s) this day had a uniqueness score of ' + uniquenessScore + '.  '  + 'This is the ' + ordinal_suffix_of(uniquenessRank) + ' most unique concert, putting it ahead of ' + uniquenessPerc + '% of all other concerts.'
					
					d3.select('#line1').text(dateText)
					d3.select('#line2').text(venueText)
					d3.select('#line3').text(venueText2)
					if (d3.values(dateData.map(function(d){return d.n})) == 1) {
						d3.select('#line4').text('Unfortunately, there was no setlist available for this concert.')
					}else{
						d3.select('#line4').text(uniquenessText)}
	
					//create text
						
				}
			}
		//});
		
		dateMenu.on('change',function() {
			var selectedYear = d3.select(this)
									.select('.year-menu')
									.property('value');
									
			var selectedMonth = d3.select(this)
									.select('.month-menu')
									.property('value');

			var selectedDay = d3.select(this)
									.select('.day-menu')
									.property('value');			
			
			updateGraph(selectedYear,selectedMonth,selectedDay);
			updateText(selectedYear,selectedMonth,selectedDay);
		});
		
		
		
		})


});

function type(d, i, columns) {
	if (!(d.lat || d.lon || d.n || d.fixedc || d.standardc || d.fixedfinal || d.fixedp ||  d.day || d.year)) return;
	d.lat = +d.lat;
	d.lon = +d.lon;
	d.n = +d.n;
	d.fixedc = +d.fixedc;
	d.fixedp = +d.fixedp;	
	d.standardc = +d.standardc;
	d.fixedfinal = +d.fixedfinal;
	d.year = +d.year;
	d.day = +d.day;
	return d;
}
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}		
