var featureKNNO = d3.range(5, 101, 5),
	outlierKNNO = d3.range(5, 101, 5);

var marginKNNO = {top:20,right:20,bottom:30,left:50},
	widthKNNO = parseInt(d3.select('.KNNO-container').style('width'), 10),
	widthKNNO = widthKNNO - marginKNNO.left - marginKNNO.right,
	gridSizeKNNO = Math.min(Math.floor(widthKNNO/featureKNNO.length), 30),
	heightKNNO = gridSizeKNNO *(outlierKNNO.length + 2);
	
var svgKNNO = d3.select('.KNNO-container').append('svg')
					.attr('width',widthKNNO + marginKNNO.left + marginKNNO.right)
					.attr('height',heightKNNO + marginKNNO.top + marginKNNO.bottom);
					
var gKNNO = svgKNNO.append('g').attr("transform", "translate(" + marginKNNO.left + "," + marginKNNO.top + ")");
					
				
var testButton = d3.select('.knno-menu-container').append('button')
	.attr('id','test')
	.attr('class','label')
	.text('Test Score')
	
var trainButton = d3.select('.knno-menu-container').append('button')
	.attr('id','train')
	.attr('class','label')
	.text('Train Score')		
	
var color2KNNO = d3.scalePow()
	.domain([1,100])
	.range(["#FFFFDD",  "#1F2D86"]) //"#3E9583", middle value
	.interpolate(d3.interpolateHcl);
	
var colorKNNO = d3.scaleSqrt()
	//.domain(d3.extent(data, function(d){return +d.Test_Score;}))
	.range([1,100])				
d3.csv('https://allenisaac.github.io/projects/mlexploration/KNNoutlierstuff.csv', function(error, data){
	if(error) throw error;
	
	/// initial button styling
	d3.select('#test')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#train')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');
	
	
	colorKNNO.domain(d3.extent(data, function(d){return +d.Test_Score*100;})).nice()

	
/*	var colorKNNO = d3.scaleSqrt()
						//.domain(d3.extent(data, function(d){return +d.Test_Score;}))
						.domain(d3.extent(data, function(d){return +d.Test_Score*100;})).nice()
						.range([1,100])
		
						
	var color2KNNO = d3.scalePow()
						.domain([1,100])
						.range(["#FFFFDD",  "#1F2D86"]) //"#3E9583", middle value
						.interpolate(d3.interpolateHcl);*/
						
	var featureLabelsKNNO = gKNNO.selectAll('.featureLabel')
						.data(featureKNNO)
						.enter().append('text')
						.text(function(d) {return d + '%';})
						.attr('x', 0)
						.attr('y', function(d,i) { return i * gridSizeKNNO;})
						.style('text-anchor','end')
						.attr('transform', 'translate(-6,' + gridSizeKNNO / 1.5 + ')');
						//.attr('class', function (d, i) { return ((}
	
	var outlierLabelsKNNO = gKNNO.selectAll('.outlierLabel')
						.data(outlierKNNO)
						.enter().append('text')
						.text(function(d) {return d + '%';})
						.attr('y', 0)
						.attr('x', function(d,i) { return i * gridSizeKNNO;})
						.style('text-anchor','middle')
						.attr('transform', 'translate(' + gridSizeKNNO / 2 + ', -6)');
						
	gKNNO.append('text')
		.text('Outlier Percentile')
		.attr('class','Oaxis')
		.attr('x',10*gridSizeKNNO)
		.attr('y',-20)
		.style('text-anchor','middle');

	gKNNO.append('text')
		.text('Feature Percentile')
		.attr('class','Oaxis')
		//.attr('x',-20)
		//.attr('y',10*gridSizeKNNO)
		.attr('transform','translate('+ (-40) + ', ' + 10*gridSizeKNNO + ')rotate(270)')
		.style('text-anchor','middle');
		
	var heatMapKNNO = gKNNO.selectAll('.score')
						.data(data)
						.enter().append('rect')
						.attr('x',function(d){return ((100 - d.outlier)/5 - 1) * gridSizeKNNO; })   //might have to adjust
						.attr('y',function(d){return ((d.feature)/5 - 1) * gridSizeKNNO; })
						.attr('width',gridSizeKNNO)
						.attr('height',gridSizeKNNO)
						.attr('id', function(d){return 'T' + (d.Test_Score).toString().replace('.','')})
						.attr('class', function(d){return 't' + (d.Train_Score).toString().replace('.','')})	
						//.attr('class','KNNO-heater')
						//.classed(function(d){return 'T' + (d.Test_Score).toString().replace('.','')})
						//.classed(function(d){return 't' + (d.Train_Score).toString().replace('.','')})	
						//.classed('KNNO-heater')
						.style('stroke','white')
						.style('stroke-opacity',0.6)
						.style('fill', function(d){ return color2KNNO(colorKNNO( +d.Test_Score*100)); });
						
	
	gKNNO.selectAll('#T' + d3.max(data, function(d){return (d.Test_Score).toString().replace('.','')}))
						.style('stroke', 'red')
						.style('stroke-opacity',1)
						.style('stroke-width', 3)

	///legend stuff

	var scoreScaleKNNO = d3.scaleLinear()
						.domain([0, d3.max(data, function(d) {return +d.Test_Score})])
						.range([0, widthKNNO]);

	var numStopsKNNO = 10;
	countRangeKNNO = scoreScaleKNNO.domain();
	countRangeKNNO[2] = countRangeKNNO[1] - countRangeKNNO[0];
	countPointKNNO = [];
	
	


	d3.select('#train').on('click',function() {
		updateData2(data);
	});
	
	d3.select('#test').on('click', function(){
		updateData1(data);
	});	
		
});
function updateData1(data) {
	d3.select('#test')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#train')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');	

	colorKNNO.domain(d3.extent(data, function(d){return +d.Test_Score*100;})).nice();
	
	gKNNO.selectAll('rect').transition()
		.duration(300)
		.style('fill',function(d){ return color2KNNO(colorKNNO( +d.Test_Score*100)); });

	
	gKNNO.selectAll('.t' + d3.max(data, function(d){return (d.Train_Score).toString().replace('.','')})).transition()
						.duration(300)
						.style('stroke', 'white')
						.style('stroke-opacity',0.6)
						.style('stroke-width', 1)
						
	gKNNO.selectAll('#T' + d3.max(data, function(d){return (d.Test_Score).toString().replace('.','')})).transition()
						.duration(300)
						.style('stroke', 'red')
						.style('stroke-opacity',1)
						.style('stroke-width', 3)						
	
	};
	
function updateData2(data) {
	d3.select('#train')
		.style('background-color','lightgrey')
		.style('box-shadow', 'inset 0px 0px 5px 0px grey');
	d3.select('#test')
		.style('background-color','white')		
		.style('box-shadow', 'inset 0px 0px 0px 0px');
		
	colorKNNO.domain(d3.extent(data, function(d){return +d.Train_Score*100;})).nice();
	
	gKNNO.selectAll('rect').transition()
				.duration(300)
				.style('fill',function(d){ return color2KNNO(colorKNNO( +d.Train_Score*100)); });
				
	gKNNO.selectAll('#T' + d3.max(data, function(d){return (d.Test_Score).toString().replace('.','')})).transition()
						.duration(300)
						.style('stroke', 'white')
						.style('stroke-opacity',0.6)
						.style('stroke-width', 1)
						
	gKNNO.selectAll('.t' + d3.max(data, function(d){return (d.Train_Score).toString().replace('.','')})).transition()
						.duration(300)
						.style('stroke', 'red')
						.style('stroke-opacity',1)
						.style('stroke-width', 3)	
						
	
			
	};