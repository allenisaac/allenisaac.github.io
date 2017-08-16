var marginBar = {top:20,right:20,bottom:30,left:50},
/*	width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom; */
	widthBar = parseInt(d3.select('.bar-container').style('width'), 10),
	widthBar = widthBar - marginBar.left - marginBar.right,
    heightBar = 320 - marginBar.top - marginBar.bottom;

var colorBar = d3.scaleOrdinal(['#BD5280','#557ABA','#9153BB','#56B896'])
	
/*var titleBar = d3.select('.bar-container').append('p')
			.attr('class','label title')
			.attr('text-anchor', 'middle')
			.text('Average Uniqueness by Region and State')*/
	
var svgBar = d3.select('.bar-container').append('svg')
    .attr("width", widthBar + marginBar.left + marginBar.right)
    .attr("height", heightBar + marginBar.top + marginBar.bottom)	

var regionButton = d3.select('.bar-button-container').append('button')
	.attr('id','region')
	.attr('class','label')
	.text('REGION')
	
var stateButton = d3.select('.bar-button-container').append('button')
	.attr('id','state')
	.attr('class','label')
	.text('STATE')	
	
	
var xBar = d3.scaleBand().range([0,widthBar]).padding(0.3),
	yBar = d3.scaleLinear().range([heightBar, 0]);	

var yAxis = d3.axisRight(yBar)
			.tickSize(widthBar);
	
var gBar = svgBar.append('g')
    .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");
	
d3.csv('https://github.com/allenisaac/allenisaac.github.io/projects/gratefuldead/map2data.csv', function(error, data){

/// initial button styling
	d3.select('#region')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#state')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');

/// creating the data I want
	var america = data.filter(function(d){return d.region !== 'NA';});

	var stateOrder = ['IA','IL','IN','KS','MI','MN','MO','ND','NE','OH','SD','WI',
					'CT','MA','ME','NH','NJ','NY','PA','RI','VT',
					'AL','AR','DE','FL','GA','KY','LA','MD','MS','NC','OK','SC','TN','TX','VA','DC','WV',
					'AK','AZ','CA','CO','HI','ID','MT','NV','NM','OR','UT','WA','WY']
	
	var regionAvg = d3.nest()
						.key(function(d) {return d.region;}).sortKeys(d3.ascending)
						.rollup(function(d) {
							return d3.mean(d, function(g) {return +g.fixedfinal2})
						})
						.entries(america);
						
	var stateAvg = d3.nest()
						.key(function(d) {return d.state;}).sortKeys(function(a,b) { return stateOrder.indexOf(a) - stateOrder.indexOf(b);})
						.key(function(d) {return d.region;})
						.rollup(function(d) {
							return d3.mean(d, function(g) {return +g.fixedfinal2})
						})
						.entries(america);
	
/// x and y axis	
	xBar.domain(regionAvg.map(function(d) {return d.key;}));
	yBar.domain([0, 8]);//d3.max(regionAvg, function(d){return d.value;})]);
	
	gBar.append('g')
		.attr('class','axis axis--x')
		.attr("transform", "translate(0," + heightBar + ")")
		.call(d3.axisBottom(xBar));	

	gBar.append('g')
		.attr('class','axis axis--y')
		.call(customYAxis);	
		
	function customYAxis(g) {
	  gBar.call(yAxis);
	  gBar.select(".domain").remove();
	  gBar.selectAll('.tick:not(:first-of-type) line').attr('stroke','#777').attr('stroke-dasharray','2,2');
	  gBar.selectAll(".tick text").attr("x", -2).attr("dy", -4);
	}

	
/// y axis label	
	svgBar.append('text')
		.attr('class','label axis-label')
		.attr('transform','rotate(-90)')
		.attr('y',0 )
		.attr('x', 0 - (heightBar/2))
		.attr('dy','1em')
		.style('text-anchor','middle')
		.text('Average Uniqueness');
	
/// create bars		
	gBar.selectAll('.bar')
		.data(regionAvg)
		.enter().append('rect')
			.attr('class','bar')
			.attr('x',function(d){return xBar(d.key);})
			.attr('y',function(d){return yBar(d.value);})
			.attr('width',xBar.bandwidth())
			.attr('height',function(d){return heightBar - yBar(d.value);})
			.attr('fill',function(d){return colorBar(d.key)});			
						

						
						
						
						
						
/// button clicks						
	d3.select('#region').on('click',function() {
		updateData2(regionAvg);
	});
	
	d3.select('#state').on('click', function(){
		updateData1(stateAvg);
	});						
});
	
function type(d) {
	if (d == d.region || d == d.state) return;
	d.fixedfinal = +d.fixedfinal;
	d.fixedfinal2 = +d.fixedfinal2;
	return d
}

function updateData1(regi) {
	d3.select('#state')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#region')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');		

	
	xBar.domain(regi.map(function(d){return d.key}));

	var bars = gBar.selectAll('.bar').data(regi);

	bars.enter().append('rect')
		.attr('class','bar')
		.attr('y',heightBar)
		
	var bars = gBar.selectAll('.bar').data(regi);

	bars.exit()
		.transition()
		.duration(300)
		//.attr('heightBar',0)
		.remove();
	
	bars.transition()
		.duration(300)
		.attr('width', xBar.bandwidth())
		.attr('fill',function(d){return colorBar(d.values[0].key)});
		
	bars.transition()
		.delay(300)
		.duration(300)
		.attr('x',function(d){return xBar(d.key);})

	bars.transition()
		.delay(600)
		.duration(300)
		.attr('y',function(d){return yBar(d.values[0].value);})
		.attr('height',function(d){return heightBar - yBar(d.values[0].value);});

	gBar.select('.axis--x')
		.transition()
		.delay(0)
		.duration(900)
		.call(d3.axisBottom(xBar));	
};

function updateData2(regi) {
	d3.select('#region')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#state')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');

	xBar.domain(regi.map(function(d) {return d.key;}));

	var bars = gBar.selectAll('.bar').data(regi);

	bars.enter().append('rect')
		.attr('class','bar')
		.attr('y',heightBar)
		
	var bars = gBar.selectAll('.bar').data(regi);

	bars.exit()
		.transition()
		.duration(300)
		.attr('y',heightBar)
		.attr('height',0)
		.remove();

	bars.transition()
		.duration(300)
		.attr('y',function(d){return yBar(d.value);})
		.attr('height',function(d){return heightBar - yBar(d.value);})
		.attr('fill',function(d){return colorBar(d.key)});
		
	bars.transition()
		.delay(300)
		.duration(300)
		.attr('x',function(d){return xBar(d.key);})

	bars.transition()
		.delay(600)
		.duration(300)
		.attr('width', xBar.bandwidth());

	gBar.select('.axis--x')
		.transition()
		.duration(900)
		.call(d3.axisBottom(xBar));	
};