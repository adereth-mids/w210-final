const loadBarChart = (data) => {
    const margin = {top: 30, right: 20, bottom: 70, left: 50},
          width = 1000 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const formatDate = d3.time.format("%d-%b-%y");

    const blueHex = "#495D70";
    const redHex = "#CC6868";
    const greyHex = "grey";

    const x = d3.scale.ordinal().rangeRoundBands([20, width], .05);
    const y = d3.scale.linear().range([height, 0]);

    const xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
    const yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

    d3.select("#graphic").html("");

    const svg = d3.select("#graphic").append("svg").attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom).append("g")
                  .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
        d.date = formatDate(d.article_date);
        d.value = +d.prediction_confidence;
    });

    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis)
       .selectAll("text").style("text-anchor", "end").attr("dx", "-.8em").attr("dy", "-.55em").attr("transform", "rotate(-90)" );

    svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("transform", "rotate(-90)").attr("y", 6)
       .attr("dy", ".71em").style("text-anchor", "end").text("Prediction Confidence (%)");

    svg.selectAll("bar").data(data).enter().append("rect").style("fill", function(d) { return (d.predicted_party === 'republican' ? redHex : blueHex) })
        .attr("x", function(d) { return x(d.date); }).attr("width", x.rangeBand()).attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    svg.selectAll(".text").data(data).enter().append("text").attr("class","label").attr("x", (function(d) { return x(d.date) + (x.rangeBand() / 2.6); }  ))
        .attr("y", function(d) { return y(d.value) - 20; }).attr("dy", ".75em").text(function(d) { return `${Math.round(d.value)}%`; });
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
        loadBarChart(data);
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