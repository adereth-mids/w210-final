$(document).ready(function() {
    // Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

    // Parse the date / time
    var formatDate = d3.time.format("%d-%b-%y");
    var formatTime = d3.time.format("%e %B");

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
    .x(function(d) { return x(d.article_date); })
    .y(function(d) { return y(d.prediction_confidence); });

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Adds the svg canvas
    var svg = d3.select("#graphic")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("./sample_data.csv", function(error, data) {
    data.forEach(function(d) {
        d.predicted_party = d.predicted_party
        d.article_date = new Date(d.article_date);
        d.prediction_confidence = +d.prediction_confidence;
        // console.log(d.article_date, d.prediction_confidence);
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.article_date; }));
    y.domain([0, d3.max(data, function(d) { return d.prediction_confidence; })]);

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line")
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0.3)
        .attr("d", valueline(data));

    // Add the scatterplot
    svg.selectAll("dot")
        .data(data)
    .enter().append("circle")
        .attr("r", function(d) { return 10 * d.prediction_confidence })
        .attr("fill", function(d) { return (d.predicted_party === 'republican' ? 'red' : 'blue') })
        .attr("cx", function(d) { return x(d.article_date); })
        .attr("cy", function(d) { return y(d.prediction_confidence); })
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(formatDate(d.article_date) + "<br/>"  + d.prediction_confidence)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    });
});