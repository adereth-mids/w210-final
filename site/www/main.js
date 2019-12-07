const loadLineChart = (data) => {

    const margin = {top: 30, right: 20, bottom: 70, left: 110},
          width = 1000 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const formatDate = d3.time.format("%y");

    const blueHex = "#495D70";
    const redHex = "#CC6868";
    const greyHex = "grey";

    const colors = d3.scale.linear().domain([25,50,75]).range([blueHex, greyHex, redHex]);

    const x = d3.scale.ordinal().rangeRoundBands([20, width], .05);
    const y = d3.scale.linear().range([height, 0]);

    const xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickFormat(function(t) { return `\'${t}`});
    const yAxis = d3.svg.axis().scale(y).orient("left").ticks(10).tickFormat(function(t) {
        if (t === 100) {
            return 'Republican';
        } else if (t === 50) {
            return 'Neutral';
        } else if (t === 0) {
            return 'Democrat';
        } else {
            return null;
        }
    });

    data.forEach(function(d) {
        d.date = formatDate(d.article_date);
        d.value = +d.prediction_confidence;
        d.value = (d.predicted_party === 'republican' ? d.value : 50 - (d.value - 50));
    });

    var valueline = d3.svg.line().x(function(d) { return x(d.date); }).y(function(d) { return y(d.value); });

    d3.select("#graphic").html("");

    const svg = d3.select("#graphic").append("svg").attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom).append("g")
                  .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, 100]);

    svg.append("path").attr("class", "line").attr("stroke", greyHex).attr("stroke-width", 2)
       .attr("fill", "none").attr("opacity", 0.3).attr("d", valueline(data));

    svg.selectAll("dot").data(data).enter().append("circle").attr("r", function(d) { return 10 })
       .attr("fill", function(d) { return colors(d.value)}) // function(d) { return (d.predicted_party === 'republican' ? redHex : blueHex) }
       .attr("cx", function(d) { return x(d.date); }).attr("cy", function(d) { return y(d.value); })

    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);

    svg.append("g").attr("class", "y axis").call(yAxis);

    svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6)
       .attr("dy", ".71em").style("text-anchor", "end").text("Sounds Like");

    svg.selectAll(".text").data(data).enter().append("text").attr("class","label").attr("x", (function(d) { return x(d.date) + (x.rangeBand() / data.length - 18); }  ))
       .attr("y", function(d) { return y(d.value) - 25; }).attr("dy", ".75em").text(function(d) { return `${50 + Math.abs(50 - Math.round(d.value))}%`; });

    svg.append("line").attr("x1", 27).attr("y1", height / 2).attr("x2", width - 5).attr("y2", height / 2)
       .attr("stroke-width", 2).attr("stroke", "rgba(0,0,0,0.2)").style("stroke-dasharray", ("3, 3"));
}

const loadData = (keyword, limit, callback) => {
    $.get(`https://us-central1-w210-capstone-257720.cloudfunctions.net/biasinthenews?keyword=${keyword}&limit=${limit}`, (result) => {
        const presidentialTerms = [
            new Date(1989, 1 - 1, 20, 0, 0, 0, 0), // George Bush
            new Date(1993, 1 - 1, 20, 0, 0, 0, 0), // Bill Clinton
            new Date(1997, 1 - 1, 20, 0, 0, 0, 0), // Bill Clinton
            new Date(2001, 1 - 1, 20, 0, 0, 0, 0), // George W. Bush
            new Date(2005, 1 - 1, 20, 0, 0, 0, 0), // George W. Bush
            new Date(2009, 1 - 1, 20, 0, 0, 0, 0), // Barack Obama
            new Date(2013, 1 - 1, 20, 0, 0, 0, 0), // Barack Obama
            new Date(2017, 1 - 1, 20, 0, 0, 0, 0), // Donald Trump
        ];

        const dateBuckets = [];
        for (let i = 1989; i < 2019; i++) {
            const year = new Date(i, 1 - 1, 20, 0, 0, 0, 0);
            dateBuckets.push(year);
        }
        const clusteredEntries = {};
        dateBuckets.forEach((t, i) => { clusteredEntries[i] = [] });

        result.forEach((r, i) => {
            const date = r['Date-YYYYMMDD'];
            const formattedDate = new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6, 8), 0, 0, 0, 0);
            for (let j = 0; j < dateBuckets.length; j++) {
                const party = Math.round(r['political_affliation_pred_D0_R1']) ? 'republican' : 'democrat';
                const formattedData = {
                    article_id: i,
                    article_date: new Date(date.slice(0, 4), date.slice(4, 6) - 1, date.slice(6, 8), 0, 0, 0, 0),
                    article_title: r['Category'],
                    article_body: r['content'],
                    predicted_party: party,
                    prediction_confidence: r[`${party}_affliation`]
                };
                if (formattedDate >= dateBuckets[j] && formattedDate < dateBuckets[j + 1]) {
                    clusteredEntries[j].push(formattedData);
                }
            }
        });

        const data = [];
        const totals = { democrat: 0, republican: 0 };
        for (let t = 0; t < dateBuckets.length; t++) {
            const termEntries = clusteredEntries[t];

            let total = 0;
            for(let i = 0; i < termEntries.length; i++) {
                total += termEntries[i]['prediction_confidence'];
                totals[termEntries[i]['predicted_party']] += 1;
            }

            const party = totals['democrat'] > totals['republican'] ? 'democrat' : 'republican';

            const confidence = total / termEntries.length;
            const computedTerm = {
                article_id: t,
                article_date: dateBuckets[t],
                predicted_party: party,
                prediction_confidence: confidence * 100,
            };
            data.push(computedTerm);
        }

        const finalData = data.map(d => {
            if (d['prediction_confidence']) return d;
        }).filter(d => d);

        callback(finalData);
    });
}

const reload = () => {
    const keyword = document.getElementById('keyword').value;
    loadData(keyword, '1000', (data) => {
        // loadBarChart(data);
        loadLineChart(data);
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
    //     const waypoint = new Waypoint({
    //         element: document.getElementById(`waypoint-${i}`),
    //         handler: function() { window.currentSection = i }
    //     });
    //     waypoints.push(waypoint);
    // }

    const rellax = new Rellax('.rellax', { center: true });
    reload('fiscal');
});