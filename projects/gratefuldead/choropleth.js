var marginChoro = {top:20,right:20,bottom:30,left:50},
	widthChoro = parseInt(d3.select('.area-container').style('width'), 10),
	widthChoro = widthChoro - marginChoro.left - marginChoro.right,
    heightChoro = 500 - marginChoro.top - marginChoro.bottom;

var svgChoro = d3.select(".choropleth-container").append("svg")
    .attr("width", widthChoro + marginChoro.left + marginChoro.right)
    .attr("height", heightChoro + marginChoro.top + marginChoro.bottom);

var projectionChoro = d3.geoAlbersUsa()
	.scale(widthChoro)
	.translate([widthChoro/2,heightChoro/2]);

var pathChoro = d3.geoPath().projection(projectionChoro);	
	
var xChoro = d3.scaleLog()
				.base(Math.E)
				.domain([1,860])
				.rangeRound([600,860]);
				
var colorChoro = d3.scaleThreshold()
				.domain([0, 1.847069,   3.411663,   6.301578,  11.639448,  21.498862, 39.709879,  73.346882, 135.476745, 250.234881, 462.201064, 853.717207])
				.range(["#F7EFF1", "#DCDDDF", "#C1CCCE", "#A7BABD", "#8CA9AC", "#71979B", "#57868A", "#4B6F7B", "#40586C", "#34415D", "#292A4E", "#1E1340"]);
				
var colorChoroAxes = d3.scaleThreshold()
				.domain([1, 1.847069,   3.411663,   6.301578,  11.639448,  21.498862, 39.709879,  73.346882, 135.476745, 250.234881, 462.201064, 853.717207])
				.range(["#F7EFF1", "#DCDDDF", "#C1CCCE", "#A7BABD", "#8CA9AC", "#71979B", "#57868A", "#4B6F7B", "#40586C", "#34415D", "#292A4E", "#1E1340"]);
				
var inverseColorChoro = d3.scaleThreshold()
				.domain([0, 1.847069,   3.411663,   6.301578,  11.639448,  21.498862, 39.709879,  73.346882, 135.476745, 250.234881, 462.201064, 853.717207])
				.range(["#570D4B", "#592555", "#5C3E5F", "#5E576A", "#616F74", "#63887E", "#66A189", "#7FAF9D", "#99BDB2", "#B3CCC6", "#CDDADB", "#E7E9F0"]);			
var gChoro = svgChoro.append('g')
			.attr('class','choro-key')
			.attr('transform','translate(0,30)')

gChoro.selectAll('rect')
				.data(colorChoroAxes.range().map(function(d){ 
					d = colorChoroAxes.invertExtent(d);
					if (d[0] == null) d[0] = (xChoro.domain()[0]);
					if (d[1] == null) d[1] = (xChoro.domain()[1]);
					return d;
				}))
				.enter().append('rect')
					.attr('height',8)
					.attr('x',function(d){return xChoro(d[0]);})
					.attr('width',function(d){return xChoro(d[1]) - xChoro(d[0]);})
					.attr('fill',function(d){return colorChoro(d[0]);});
					
gChoro.append('text')
	.attr('class','choro-caption')
	.attr('x',xChoro.range()[0])
	.attr('y',-6)
	.attr('fill','#000')
	.attr('text-anchor','start')
	.attr('font-weight','bold')
	.text('Number of Concerts');
	
gChoro.call(d3.axisBottom(xChoro)
		.tickSize(13)
		.tickValues([0.999999999, 1.847069,   3.411663,   6.301578,  11.639448,  21.498862, 39.709879,  73.346882, 135.476745, 250.234881, 462.201064, 853.717207])
		.tickFormat(function(e){
        return Math.floor(e)
    }))
	.select('.domain')
		.remove();
		
d3.queue()
    .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json')
    //.defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.csv, "https://allenisaac.github.io/projects/gratefuldead/choro.csv")
    .await(ready);
		
function ready(error, us, shows) {		
	if (error) throw error;
	//colorChoro.domain([d3.quantile(densities, .01), d3.quantile(densities, .99)])
	var showCount = {};
	
	shows.forEach(function(d) {showCount[d.id] = +d.n;});
	
	svgChoro.append('g')
		.attr('class','choro-state-fill')
		.selectAll('path')
		.data(topojson.feature(us, us.objects.states).features)
		.enter().append('path')
			.attr('fill',function(d) { return colorChoro(showCount[d.id]);})//function(d){return colorChoro(d.n = shows.get(stateLabels[('$' + d.state_name)]));})
			.attr('d',pathChoro)
			.style('opacity',1)
		.on('mouseover',function(d){
		
			var xPosition = pathChoro.centroid(d)[0];//d3.mouse(this)[0];
            var yPosition = pathChoro.centroid(d)[1];
			var numberVar = showCount[d.id] - 1
			svgChoro//.append('g')
			//	.attr('class','choro-label')
				//.selectAll('text')
			//	.data(topojson.feature(us, us.objects.states).features)
				//.enter()
				.append('svg:text')
				.text(numberVar)
				.attr('id','number-tip')
				.attr("x", xPosition)
				  .attr("y", yPosition)
				.attr("text-anchor","middle")
				.attr('fill', 'white')
				.style('text-shadow', '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black')
		
			d3.select(this).transition().duration(300).style("fill",'#570D4B')//function(d) { return inverseColorChoro(showCount[d.id]);})
			})
			
		.on("mouseout", function(d) {
			d3.select('#number-tip')
				.remove();
			
			d3.select(this)
			.transition().duration(300)
			.style('fill',function(d) { return colorChoro(showCount[d.id]);})});

			
/*	svgChoro.append('g')
		.attr('class','choro-label')
		.selectAll('text')
		.data(topojson.feature(us, us.objects.states).features)
		.enter().append('svg:text')
		.text(function(d) { return (showCount[d.id] - 1);})

		.attr("x", function(d){
			  return pathChoro.centroid(d)[0];
		  })
		  .attr("y", function(d){
			  return  pathChoro.centroid(d)[1];
		  })
        .attr("text-anchor","middle")
		.attr('fill', function(d) { return colorChoro(showCount[d.id]);});*/


	
	svgChoro.append("path")
		  .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		  .attr("class", "choro-states")
		  .attr("d", pathChoro);