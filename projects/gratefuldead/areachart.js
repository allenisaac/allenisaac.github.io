var colorArea = d3.scaleOrdinal(['#56B896','#557ABA','#9153BB','#BD5280']);
var marginArea = {top:20,right:20,bottom:60,left:70},
/*	width = svg.attr("width") - marginArea.left - marginArea.right,
    height = svg.attr("height") - marginArea.top - marginArea.bottom; */
	widthArea = parseInt(d3.select('.area-container').style('width'), 10),
	widthArea = widthArea - marginArea.left - marginArea.right,
    heightArea = 400 - marginArea.top - marginArea.bottom;

/*var titleArea = d3.select('.area-container').append('p')
			.attr('class','label title')
			.attr('text-anchor', 'middle')
			.text('Songs Played in Each Region, Ordered by Total Plays')*/

var svgArea = d3.select(".area-container").append("svg")
    .attr("width", widthArea + marginArea.left + marginArea.right)
    .attr("height", heightArea + marginArea.top + marginArea.bottom);	
	
var countnButton = d3.select('.area-button-container').append('button')
	.attr('id','start')
	.attr('class','label')
	.text('COUNT');
	
var percentButton = d3.select('.area-button-container').append('button')
	.attr('id','reset')
	.attr('class','label')
	.text('PERCENT');		
	
var xArea = d3.scaleLinear().range([0,widthArea]),
	yArea = d3.scaleLinear().range([heightArea, 0]);


var bisectX = d3.bisector(function(d) {return d.index;}).left,
	formatValue = d3.format(',.2f'),
	formatPercent = function(d) { return formatValue(d) + '%';};
	
			
var area = d3.area()
			 .x(function(d){ return xArea(d.data.index);})
			 .y0(function(d) {return yArea(d[0]);})
			 .y1(function(d) { return yArea(d[1]);}) 
			 .curve(d3.curveBasis); 

var stack = d3.stack();
			 

var gArea = svgArea.append("g")
			.attr("transform", "translate(" + marginArea.left + "," + marginArea.top + ")");
			
					
d3.csv("allenisaac.github.io/projects/gratefuldead/data.csv", type,function(error, data) {
	if (error) throw error;
	yArea.domain([0, 1486]);
/// button styling
	d3.select('#start')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#reset')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');	

/// data creation		
	var regionsT = data.map(function(d) {
		return {			
			index: +d.index,
			West: +d.west,
			Norhteast: +d.northeast,
			South: +d.south,
			Midwest: +d.midwest
		};
	});
	
	var regionsP = data.map(function(d) {
		return {
			index: +d.index,
			West: +d.west/d.all3,
			Norhteast: +d.northeast/d.all3,
			South: +d.south/d.all3,
			Midwest: +d.midwest/d.all3
		};
	});

	
	
//	domains
	var keys = Object.keys(regionsT[1]).slice(1);
	xArea.domain(d3.extent(data, function(d) { return d.index; }));
	colorArea.domain(keys);
	stack.keys(keys);
	

/// build the paths	
	var layer = gArea.selectAll(".layer")
		.data(stack(regionsT))
		.enter().append("g")
		.attr("class", "layer");

	layer.append("path")
		.attr("class", "area")
		.style("fill", function(d) { return colorArea(d.key); })
		.attr("d", area);
/// axes
	gArea.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightArea + ")")
		.call(d3.axisBottom(xArea));

	gArea.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(yArea).ticks(10));
		
	svgArea.append('text')
		.attr('class','label axis-label')
		.attr('transform','rotate(-90)')
		.attr('y',0 )
		.attr('x', 0 - (heightArea/2))
		.attr('dy','1em')
		.style('text-anchor','middle')
		.text('Song Count');
		
	svgArea.append("text")    
		.attr('class','label axis-label')	
		.attr("transform",
				"translate(" + ((widthArea/2) +marginArea.left - marginArea.top) + " ," + 
							   (heightArea + marginArea.top + 40) + ")")
		.style("text-anchor", "middle")
		.text("Song Rank");		
/// buttonpresses		
	d3.select('#start').on('click',function() {
		updateData(regionsT, data, 'count');
	});
	
	d3.select('#reset').on('click', function(){
		updateData(regionsP, data, 'percent');
	});


		
//tooltip		
	var focus = svgArea.append('g')
						.attr('class','focus label')
						.attr('visibility','hidden');
						
	var hoverLine = svgArea.append('g')
						.attr('class','hoverLine')
						.attr('visibility','hidden');
	
	
	hoverLine.append('line')
			.attr('y1',0)
			.attr('y2',heightArea)
			.attr('x1',0)
			.attr('x2',0)
			.attr('stroke-dasharray','10,1')
			.style('stroke','white')
			.style('stroke-width', '1')
			.style('opacity',0.7);
	
	focus.append('rect')
			.attr('class','tooltip-box')
			.attr('width',100)
			.attr('height',115)
			.attr('fill','white')
			.style('opacity',0.9);     
				
	
	focus.append('text')
			.attr('class','topline')
			.attr('x',9)
			.attr('dy','1.35em')
            .style("font-size",15);

	focus.append('text')
			.attr('class','midwest')
			.attr('x',9)
			.attr('dy','2.7em')
            .style("font-size",15);

	focus.append('text')
			.attr('class','south')
			.attr('x',9)
			.attr('dy','4.05em')
            .style("font-size",15);

	focus.append('text')
			.attr('class','northeast')
			.attr('x',9)
			.attr('dy','5.40em')
            .style("font-size",15);

	focus.append('text')
			.attr('class','west')
			.attr('x',9)
			.attr('dy','6.75em')
            .style("font-size",15);			

	svgArea.append('rect')
			.attr('class','overlay')
			.attr('width',widthArea)
			.attr('height',heightArea)
			.attr("transform", "translate(" + marginArea.left + "," + marginArea.top + ")")
			.on('mouseover',function(){focus.attr('visibility','visible');
										hoverLine.attr('visibility','visible');})
			.on('mouseout',function(){focus.attr('visibility','hidden');
										hoverLine.attr('visibility','hidden');})
			.on('mousemove',mousemove);
			
	function mousemove() {
		var x0 = xArea.invert(d3.mouse(this)[0]),
			i = bisectX(data, x0, 1),
			d0 = data[i-1],
			d1 = data[i],
			d = x0 - d0.index > d1.index - x0 ? d1 : d0;
		var isLeft = (d3.mouse(this)[0] < widthArea/2),
			isTop = (d3.mouse(this)[1] < heightArea/2);
		var topline = d.songs + ': #' + d.index + ' most played song' ,
			westinfo = formatValue(100*d.west/d.all3) + '%: Played ' + d.west + ' times in the West',
			neinfo = formatValue(100*d.northeast/d.all3) + '%: Played ' + d.northeast + ' times in the Northeast',
			midwestinfo = formatValue(100*d.midwest/d.all3) + '%: Played ' + d.midwest + ' times in the Midwest',
			southinfo = formatValue(100*d.south/d.all3) + '%: Played ' + d.south + ' times in the South';
		focus.select('.topline').text(topline);		
		focus.select('.midwest').text(midwestinfo);		
		focus.select('.south').text(southinfo);		
		focus.select('.northeast').text(neinfo);		
		focus.select('.west').text(westinfo);		
		var dim = focus.select('.topline').node().getBBox().width,
			rectX = (18 + dim) > 300 ? (18 + dim) : 300;
		focus.select('rect')
			.attr('width',rectX);
		if (isLeft) { var xPos = xArea(d.index) + marginArea.left;} else { var xPos = xArea(d.index) - rectX + marginArea.left;};
		if (isTop) { var yPos = d3.mouse(this)[1] + marginArea.top} else {var yPos = d3.mouse(this)[1] - 115 + marginArea.top};
		focus.attr('transform','translate(' + xPos + ',' + yPos + ')'); 
		hoverLine.attr('transform','translate(' + (xArea(d.index) + marginArea.left) + ',' + marginArea.top + ')'); 

		} 		

});




/* function type(d, i, columns) {

	for (var i = 0, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
	return d;
} */
		   
function type(d) {
	if (d == d.songs) return;
	d.index = +d.index;
	d.all = +d.all;
	d.midwest = +d.midwest;
	d.west = +d.west;
	d.northeast = +d.northeast;
	d.all3 = +d.all3;
	d.south = +d.south; 
	d.A = +d.A;
	return d
}

function updateData(regi, data, buttonNum) {
	if (buttonNum == 'count') {
		d3.select('#start')
			.style('background-color','lightgrey')
			.style('box-shadow', 'inset 0px 0px 5px 0px grey');
		d3.select('#reset')
			.style('background-color','white')		
			.style('box-shadow', 'inset 0px 0px 0px 0px');		
	} else {
		d3.select('#reset')
			.style('background-color','lightgrey')
			.style('box-shadow', 'inset 0px 0px 5px 0px grey');
		d3.select('#start')
			.style('background-color','white')		
			.style('box-shadow', 'inset 0px 0px 0px 0px');		
	}
	
	
	var maxValue = d3.max(regi, function(d){ return (+d.West)});
	
	if (maxValue > 500) { yArea.domain([0, 1486]); var tick = null} else{ yArea.domain([0,1]); var tick = '%';}
	
	gArea.selectAll('.area')
			.data(stack(regi))
			.transition()
			.duration(750)
			.delay(25)
			.attr('d',area);
			
			
	gArea.select('.axis--y')
		.transition()
		.duration(750)
		.call(d3.axisLeft(yArea).ticks(10, tick));
		
	}
  