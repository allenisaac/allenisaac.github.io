var marginKNN = {top:20,right:20,bottom:30,left:50},
	widthKNN = parseInt(d3.select('.knn-container').style('width'), 10),
	widthKNN = widthKNN - marginKNN.left - marginKNN.right,
	heightKNN = 500 - marginKNN.top - marginKNN.bottom;
	
var svgKNN = d3.select('.knn-container').append('svg')
					.attr('width',widthKNN + marginKNN.left + marginKNN.right)
					.attr('height',heightKNN + marginKNN.top + marginKNN.bottom);
					
var gKNN = svgKNN.append('g').attr('width',widthKNN)
					.attr('height',heightKNN)
					.attr("transform", "translate(" + marginKNN.left + "," + marginKNN.top + ")");
					
var xKNN = d3.scaleLog()
				.range([0, widthKNN]);

var yKNN = d3.scaleLinear()
				.range([heightKNN,0]);

var colorKNN = d3.scaleOrdinal(d3.schemeCategory10);				
var bisectX = d3.bisector(function(d) {return d.Train_Time;}).left

gKNN.append('text')
	.text('Training Time')
	.attr('class','xAxisTitle')
	.attr('x',widthKNN/2)
	.attr('y',heightKNN + marginKNN.bottom - 10)
	.style('text-anchor','middle')

gKNN.append('text')
	.text('Test Accuracy')
	.attr('class','yAxisTitle')
	.attr('x',0)
	.attr('y',-10)
	.style('text-anchor','middle')
		
d3.csv('https://allenisaac.github.io/css/mlexploration/KNNparemeter.csv', type, function(error, data){
	if (error) throw error;
	
	xKNN.domain(d3.extent(data, function(d) { return d.Train_Time; }));
	yKNN.domain(d3.extent(data, function(d) { return d.Test_Scores; }));
	
	var tooltipKNN = d3.select('.knn-container').append('div')
					.attr('class','tooltip')
					.style('opacity',0);
					
	var mouseOver = function(d) {
		var htmlText = ' Neighbors: ' + d.Neighbors + '<br/>' + 
						' P: ' + d.P + '<br/>' + 
						' Algorithm: ' + d.Algorithm + '<br/>' + 
						' Normalized: ' + d.Norm;
		tooltipKNN.html(htmlText)
					.style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
				.transition()
					.duration(100)
					.style('opacity',0.9)
	}
	
	var mouseOut = function(d) {
		tooltipKNN.transition()
			.duration(100)
			.style('opacity',0)
	}
	
	
	var nodesKNN = data.map(function(node, index) {
		return {
			index:index,
			P: node.P,
			Norm: node.Norm,
			Test_Scores: node.Test_Scores,
			Algorithm: node.Algorithm,
			Neighbors: node.Neighbors,
			Train_Time: node.Train_Time,
			x: xKNN(node.Train_Time),
			y: yKNN(node.Test_Scores),
			r: 10
		};
	});

	var forceKNN = d3.forceSimulation()
			.velocityDecay(0.2)
			.force('collide',d3.forceCollide().radius(function(d){return d.r + 0.5;}).iterations(2))//.strength(2))
			.force('x',d3.forceX(function(d){return d.x;}).strength(15))
			.force('y',d3.forceY(function(d){return d.y;}).strength(50))
			//.force("charge", d3.forceManyBody().strength(-100))
			//.stop();

	for (var i = 0; i < 150; ++i) forceKNN.tick();
		
			
	var columnsKNN = ['Norm','Algorithm','P', 'Neighbors'];

	var selectorKNN = d3.select('.parameter-menu-container')
	
	selectorKNN.append('select')
		.attr('class','dropmen knn-menu')
		.selectAll('option')
			.data(columnsKNN)
			.enter()
			.append('option')
				.attr('value', function(d){return d;})
				.text(function(d){return d;});
				
	var circleKNN = gKNN.selectAll('.dot')
						.data(nodesKNN)
						.enter().append('circle')
						.style('fill',function(d){return colorKNN(d.Norm); })
						.attr('cx',function(d) { return d.x; })
						.attr('cy', function(d) { return yKNN(d.Test_Scores); })
						.attr('r',function(d){return d.r})
						.style('opacity', 0.8)
						.on('mouseover',mouseOver)
						.on('mouseout',mouseOut)
				
	function ticked() {
		circleKNN//.attr('cy',function(d){return yKNN(d.Test_Scores);})
				 .attr('cy',function(d){return d.y;})
				 //.attr('cx',function(d){return d.x = Math.max((xKNN(d.Neighbors) - 3*d.r), Math.min((xKNN(d.Neighbors) + 3*d.r), d.x));})
				 .attr('cx',function(d){return d.x;})
				 
	};				
						
	forceKNN.nodes(nodesKNN)
			.on('tick',ticked);
						
	
					

	var xAxisKNN = d3.axisBottom(xKNN);
	var yAxisKNN = d3.axisRight(yKNN)
						.tickSize(widthKNN);
						
	gKNN.append('g').attr('transform','translate(0,' + (heightKNN -20)+ ')').call(customXAxisKNN);
	gKNN.append('g').call(customYAxisKNN);
	
	function customXAxisKNN(gKNN) {
		gKNN.call(xAxisKNN);
		gKNN.select('.domain').remove();
	}
	function customYAxisKNN(gKNN) {
	  gKNN.call(yAxisKNN);
	  gKNN.select(".domain").remove();
	  gKNN.selectAll(".tick:not(:first-of-type) line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
	  gKNN.selectAll(".tick text").attr("x", 4).attr("dy", -4);
	}	
	
/*	gKNN.selectAll('.dot')
		.data(data)
		.enter().append('circle')
			.attr('class','dot')
			.attr('r', 7)
			.attr('cx',function(d) {return xKNN(d.Neighbors); })
			.attr('cy',function(d) {return yKNN(d.Test_Scores); })
			.style('fill',function(d){return colorKNN(d.Norm); })
			.style('opacity',1);    
		*/	
		
		
	var legend = gKNN.selectAll('.legend')
		.data(colorKNN.domain())
		.enter().append('g')
			.attr('class','legend')
			.attr('transform',function(d,i){return 'translate(0,' + i * 20 + ')';});
	
	legend.append('rect')
		.attr('x', widthKNN - 18)
		.attr('width', 18)
		.attr('height', 18)
		.style('fill',colorKNN)
		
	legend.append('text')
		.attr('x',widthKNN - 24)
		.attr('y', 9)
		.attr('dy','0.35em')
		.style('text-anchor','end')
		.text(function(d){return d; });
	
//tooltip
/*	var focusKNN = svgKNN.append('g')
						.attr('class','focus label')
						.attr('visibility','hidden');
						

	
	focusKNN.append('rect')
			.attr('class','tooltip-box')
			.attr('width',100)
			.attr('height',115)
			.attr('fill','white')
			.style('opacity',.1);     
				
	
	focusKNN.append('text')
			.attr('class','topline')
			.attr('x',9)
			.attr('dy','1.35em')
            .style("font-size",15);

	svgKNN.append('rect')
			.attr('class','overlay')
			.attr('width',widthKNN)
			.attr('height',heightKNN)
			.attr("transform", "translate(" + marginKNN.left + "," + marginKNN.top + ")")
			.on('mouseover',function(){focusKNN.attr('visibility','visible');})
			.on('mouseout',function(){focusKNN.attr('visibility','hidden');})
			.on('mousemove',mousemove);

	function mousemove() {
		console.log(nodesKNN)
		var x0 = xKNN.invert(d3.mouse(this)[0]),
			i = bisectX(nodesKNN, x0, 1),
			d0 = nodesKNN[i-1],
			d1 = nodesKNN[i],
			d = x0 - d0.Train_Time > d1.Train_Time - x0 ? d1 : d0;
		var isLeft = (d3.mouse(this)[0] < widthKNN/2),
			isTop = (d3.mouse(this)[1] < heightKNN/2);
		focusKNN.select('.topline').text('help');		
	
		var dim = focusKNN.select('.topline').node().getBBox().width,
			rectX = (18 + dim) > 300 ? (18 + dim) : 300;
		focusKNN.select('rect')
			.attr('width',rectX);
		if (isLeft) { var xPos = xKNN(d.Train_Time) + marginKNN.left} else { var xPos = xKNN(d.Train_Time) - rectX + marginKNN.left};
		if (isTop) { var yPos = d3.mouse(this)[1] + marginKNN.top} else {var yPos = d3.mouse(this)[1] - 115 + marginKNN.top};
		focusKNN.attr('transform','translate(' + xPos + ',' + yPos + ')'); 
		hoverLineKNN.attr('transform','translate(' + (xKNN(d.Train_Time) + marginKNN.left) + ',' + marginKNN.top + ')'); 

		} 		*/
	

	
	
	
	var updateColorKNN = function(newVarKNN, legend) {
		gKNN.selectAll('.legend').remove();
	
		colorKNN.domain([]);

		var circlesKNN = gKNN.selectAll('.dot').data(nodesKNN);
		circleKNN.transition()
			.duration(300)
			.style('fill', function(d) { return colorKNN(d[newVarKNN]); });

		var legend = gKNN.selectAll('.legend')
			.data(colorKNN.domain())
			.enter().append('g')
				.attr('class','legend')
				.attr('transform',function(d,i){return 'translate(0,' + i * 20 + ')';});
		
		legend.append('rect')
			.attr('x', widthKNN - 18)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill',colorKNN)
			
		legend.append('text')
			.attr('x',widthKNN - 24)
			.attr('y', 9)
			.attr('dy','0.35em')
			.style('text-anchor','end')
			.text(function(d){return d; });	
		//update legend
	};

	selectorKNN.on('change',function() {
		var newVarKNN = d3.select(this)
							.select('.knn-menu')
							.property('value');
		updateColorKNN(newVarKNN, legend);
	});

});

function type(d,i,columns){
	if(!( d.Test_Scores || d.P || d.Train_Time)) return;
	d.Train_Time = +d.Train_Time;
	d.Test_Scores = +d.Test_Scores;
	d.P = +d.P;
	return d;
}