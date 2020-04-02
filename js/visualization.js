	var width = 960;
	var height = 500;

	var svg = d3
	.select("#map-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

	var svg2 = d3
	.select("#chart-container")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

	var projection = d3
	.geoAlbersUsa()
	.translate([width / 2, height / 2])
	.scale(width);

	var path = d3.geoPath().projection(projection);

	d3.json("us.json", function(us){
		//Error messgae
		d3.csv("data/cities-visited.csv", function(cities) {
			d3.csv("data/statesvisited.csv", function(statesVisited) {
				d3.tsv("data/us-state-names.tsv", function(stateNames) {
		drawMap(us, cities, statesVisited, stateNames)
		drawChart(cities);
	});
	});
	});
	});

	var brush = d3
	.brush()
	.on("start brush", highlight)
	.on("end", brushend);

	function drawChart(cities){

		let margin = {
			top: 20,
			right: 30,
			bottom: 40,
		}

		// Create a scale

		let xScale = d3.scaleLinear()
						.domain([
						d3.min(cities, function(d){ return d.food }),
						d3.max(cities, function(d){ return d.food })
						])
						.range([0, width])

		let yScale = d3.scaleLinear()
		.domain([
			d3.min(cities, function (d) {return d.diversity }),
			d3.max(cities, function (d) {return d.diversity })
			])
		.range([height, 0])

		// Create an axis

		let xAxis = d3.axisTop()
		.scale(xScale)
		.ticks(5);

		let yAxis = d3.axisRight()
		.scale(yScale)
		.ticks(5);

		let highlightChart = function(d) {

			if (d3.event.selection === null) return;

			let [[x0, y0], [x1, y1]] = d3.event.selection;
		
			circles = d3.selectAll("circle");

			circles.classed(
				"selected",
				d =>
				x0 <= xScale(d.food) &&
				xScale(d.food) <= x1 &&
				y0 <= yScale(d.diversity) &&
				yScale(d.diversity) <= y1
	 	);
			}

		var brush2 = d3
		.brush()
		.on('start brush', highlightChart)


		// render the axis 
		svg2
		.append("g")
		.call(xAxis)
		.attr("transform", 'translate(0,' + (height - 5) + ')')
		
		svg2
		.append("g")
		.call(yAxis)

		// render the points 
		svg2.selectAll("circle")
		.data(cities)
		.enter()
		.append("circle")
		.attr("cx", function(d){ return xScale(d.food)})
		.attr("cy", function(d){ return yScale(d.diversity)})
		.attr("r", 5)
		.attr('fill', 'orange')
		svg2.append("g").call(brush2);
	}

	function brushend() {
			console.log("end");
		}


	function drawMap(us, cities, statesVisited, stateNames){
		// console.log(us);
		// console.log(cities);

		var mapGroup = svg.append("g").attr("class", "mapGroup");

		let  fillFunction = function(d){
			let stateName = stateNames.filter(function (n) { return n.id == d.id })[0].name
			let statesVisitedNames = statesVisited.map(function (s) { return s.name });
			let isVisited = statesVisitedNames.includes(stateName);

			if (isVisited) {
			return 'blue';
			} else {
			return 'gray'
			}
		}

	mapGroup
	.append("g")
	// .attr("id", "states")
	.selectAll("path")
	.data(topojson.feature(us, us.objects.states).features)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("fill", fillFunction)
	.attr("class", "states")
	.on('mouseover', function(d) {
		let state = d3.select(this);
		state.attr("fill", "red");
	})
	.on( 'mouseout', function (d) {
		let state = d3.select(this);
		state.attr( 'fill', fillfunction);
	});

	mapGroup
	.append("path")
	.datum(
		topojson.mesh(us, us.objects.states, function(a, b) {
			return a !== b;
		})
		)
	.attr("id", "state-borders")
	.attr("d", path);

	var circles = svg
	.selectAll('circle')
	.data(cities)
	.enter()
	.append("circle")
	.attr("class", "cities")
	.attr("cx", function(d){
		return projection([d.lon, d.lat])[0];
	})
	.attr("cy", function(d) {
		return projection([d.lon, d.lat])[1]; 
	})
	.attr("r", 8);

	svg.append("g").call(brush);
	}

	function highlight() {
		if (d3.event.selection === null) return;

		let [[x0, y0], [x1, y1]] = d3.event.selection;
		
		circles = d3.selectAll("circle");

		circles.classed(
			"selected",
			d =>
			x0 <= projection([d.lon, d.lat]) [0] &&
			projection ([d.lon, d.lat])[0] <= x1 &&
			y0 <= projection([d.lon, d.lat])[1] &&
			projection([d.lon, d.lat])[1] <= y1
	 );
	}

	 var legend = svg
	 .append("g")
	 .attr("class","legend")
	 .attr("width", 140)
	 .attr("height", 200)
	 .selectAll("g")
	 .data([
	 	{'color': 'orange', 'label': 'Cities Visited'},
	 	{'color': 'gray', 'label' : 'States Not Visited'},
	 	{'color': 'blue', 'label' : 'States Visited'}
	 	]) //include the color and the actual word on the data
	 // always want to pass an array
	 .enter()
	 .append("g")
	 .attr("transform", function(d, i){
	 	return "translate(0," + i * 20 + ")";
	 });

	 legend
	 .append("rect")
	 .attr("width", 18)
	 .attr("height", 18)
	 .style("fill", function(d) {
	 	return d.color;
	 });

	 legend.append("text")
	 .attr("x", 24)
	 .attr("y", 9)
	 .attr("dy", ".35em")
	 .text(function(d) {
	 	return d.label;
	 });

