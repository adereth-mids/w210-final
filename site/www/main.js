// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
width = 1000 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// Parse the date
var formatDate = d3.time.format("%d-%b-%y");

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define Colors
const blueHex = "#495D70";
const redHex = "#CC6868";
const greyHex = "grey";

// Define the axes
var xAxis = d3.svg.axis().scale(x)
.orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
.orient("left").ticks(5);

const loadChart = (data) => {
    // Define the line
    var valueline = d3.svg.line()
    .x(function(d) { return x(d.article_date); })
    .y(function(d) { return y(d.prediction_confidence); });

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Clears parent container and adds the svg canvas
    d3.select("#graphic").html("");
    var svg = d3.select("#graphic")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.article_date; }));
    y.domain([0, d3.max(data, function(d) { return d.prediction_confidence; })]);

    // Add the valueline path.
    svg.append("path")
    .attr("class", "line")
    .attr("stroke", greyHex)
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("opacity", 0.3)
    .attr("d", valueline(data));

    // Add the scatterplot
    svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", function(d) { return 10 * d.prediction_confidence })
    .attr("fill", function(d) { return (d.predicted_party === 'republican' ? redHex : blueHex) })
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
}

const loadData = (keyword, limit, callback) => {
    $.get(`https://us-central1-w210-capstone-257720.cloudfunctions.net/biasinthenews?keyword=${keyword}&limit=${limit}`, (result) => {
    data = result.map((r, i) => {
        const party = Math.round(r['political_affliation_pred_D0_R1']) ? 'republican' : 'democrat';
        const date = r['Date-YYYYMMDD'];
        const formattedData = {
            article_id: i,
            article_date: new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6, 8), 0, 0, 0, 0),
            article_title: r['Category'],
            article_body: r['content'],
            predicted_party: party,
            prediction_confidence: r[`${party}_affliation`]
        };
        return formattedData;
    });
    callback(data);
});
}

const reload = () => {
    const keyword = document.getElementById('keyword').value;
    loadData(keyword, '10', (data) => {
        loadChart(data);
    });
}

// window.currentSection = 0;
// const scrollToNextSection = () => {
//     $('html, body').animate({
//         scrollTop: $(`#waypoint-${window.currentSection + 1}`).offset().top,
//         easing: 'easeout',
//     }, 1000);
//     window.currentSection += 1;
// }

$(document).ready(function() {
    // const waypoints = [];
    // for (let i = 0; i < 7; i++) {
    //     var waypoint = new Waypoint({
    //         element: document.getElementById(`waypoint-${i}`),
    //         handler: function() { window.currentSection = i }
    //     });
    //     waypoints.push(waypoint);
    // }

    var rellax = new Rellax('.rellax', { center: true });
    reload('Trump');
});