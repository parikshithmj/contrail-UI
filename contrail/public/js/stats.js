
var repeat = function getPieChartByProtocol() {
    $.ajax({
        type: "GET",
        url: 'traffics',
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            var w = 300,
                h = 400,
                r = 100,
                color = d3.scale.category20c();

            var data = [];
            var proto = [0, 0, 0, 0, 0, 0, 0];
            for (var i = 0; i < response.length; i++) {
                var num = Number(response[i].protocol).valueOf();
                proto[num]++;
            }

            for (var key in proto) {
                if (proto.hasOwnProperty(key)) {
                    if (proto[key] != 0) {
                        var entry = {};
                        entry.label = key;
                        entry.value = proto[key];
                        data.push(entry);
                    }
                }
            }

            var vis = d3.select(".pie")
                .data([data])
                .attr("width", w)
                .attr("height", h)
                .append("svg:g")
                .attr("transform", "translate(" + r + "," + r + ")")
            var arc = d3.svg.arc()
                .outerRadius(r);
            var pie = d3.layout.pie()
                .value(function(d) {
                    return d.value;
                });
            var arcs = vis.selectAll("g.slice")
                .data(pie)
                .enter()
                .append("svg:g")
                .attr("class", "slice");
            arcs.append("svg:path")
                .attr("fill", function(d, i) {
                    return color(i);
                })
                .attr("d", arc);
            arcs.append("svg:text")
                .attr("transform", function(d) {
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    return data[i].label;
                });
            barGraphOfIncomingPackets(response); //avoiding another API call to have better speed and also reduce load on server.
        },
        error: function(data) {
            console.log("no");
        }
    });
}	
//Function to obtain the bar graph of incoming data packets from VN.
function barGraphOfIncomingPackets(response) {

    var w = 600;
    var h = 250;

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var dataset = [];
    var incoming = [];
    var maxvalue = 0;

    for (var i = 0; i < response.length; i++) {
        var num = Number(response[i].sum_bytes_kb).valueOf();
        if (incoming[response[i].destination_ip] != null) {
            incoming[response[i].destination_ip] = incoming[response[i].destination_ip] + num;
        } else {
            incoming[response[i].destination_ip] = num;
        }
        if (incoming[response[i].destination_ip] > maxvalue) {
            maxvalue = incoming[response[i].destination_ip];
        }
    }
    var labels = [];

    for (var key in incoming) {
        if (incoming.hasOwnProperty(key)) {
            if (incoming[key] != 0) {
                var entry = {};
                entry.key = key;
                entry.value = incoming[key];
                dataset.push(entry);
                labels.push(entry.key);
            }
        }
    }

    var svgHeight = 400;
    var svgWidth = 400;
    var barSpacing = 1; //space between the bars
    var padding = {
        left: 60,
        right: 0,
        top: 20,
        bottom: 20
    };



    animateBarsUp(svgHeight, svgWidth, maxvalue, barSpacing, padding, dataset, '.chart');
    barGraphOfOutgoingPacketSize(response);
}	
//Function to obtain the bar graph of outgoing data packets from VN.
function barGraphOfOutgoingPacketSize(response) {


    var w = 600;
    var h = 250;

    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var dataset = [];
    var outgoing = [];
    var maxvalue = 0;

    for (var i = 0; i < response.length; i++) {
        var num = Number(response[i].sum_packets).valueOf();
        if (outgoing[response[i].source_ip] != null) {
            outgoing[response[i].source_ip] = outgoing[response[i].source_ip] + num;
        } else {
            outgoing[response[i].source_ip] = num;
        }
        if (outgoing[response[i].source_ip] > maxvalue) {
            maxvalue = outgoing[response[i].source_ip];
        }
    }
    var labels = [];

    for (var key in outgoing) {
        if (outgoing.hasOwnProperty(key)) {
            if (outgoing[key] != 0) {
                var entry = {};
                entry.key = key;
                entry.value = outgoing[key];
                dataset.push(entry);
                labels.push(entry.key);
            }
        }
    }

    var svgHeight = 400;
    var svgWidth = 400;
    var barSpacing = 1; //space between the bars
    var padding = {
        left: 60,
        right: 0,
        top: 20,
        bottom: 20
    };

    animateBarsUp(svgHeight, svgWidth, maxvalue, barSpacing, padding, dataset, '.chart-pack');
}

function animateBarsUp(svgHeight, svgWidth, maxvalue, barSpacing, padding, dataset, className) {
    var maxWidth = svgWidth - padding.left - padding.right;
    var maxHeight = svgHeight - padding.top - padding.bottom;

    // Define your conversion functions
    var convert = {
        x: d3.scale.ordinal(),
        y: d3.scale.linear()
    };

    // Define your axis
    var axis = {
        x: d3.svg.axis().orient('bottom'),
        y: d3.svg.axis().orient('left')
    };

    // Define the conversion function for the axis points
    axis.x.scale(convert.x);
    axis.y.scale(convert.y);

    // Define the output range of your conversion functions
    convert.y.range([maxHeight, 0]);
    convert.x.rangeRoundBands([0, maxWidth]);

    // Once you get your data, compute the domains
    convert.x.domain(dataset.map(function(d) {
        return d.key;
    }));
    convert.y.domain([0, maxvalue]);

    // Setup the markup for your SVG
    var svg = d3.select(className)
        .attr({
            width: svgWidth,
            height: svgHeight
        });

    // The group node that will contain all the other nodes
    // that render your chart
    var chart = svg.append('g')
        .attr({
            transform: function(d, i) {
                return 'translate(' + padding.left + ',' + padding.top + ')';
            }
        });

    chart.append('g') // Container for the axis
        .attr({
            class: 'x axis',
            transform: 'translate(0,' + maxHeight + ')'
        })
        .call(axis.x); // Insert an axis inside this node

    chart.append('g') // Container for the axis
        .attr({
            class: 'y axis',
            height: maxHeight
        })
        .call(axis.y); // Insert an axis inside this node

    var bars = chart
        .selectAll('g.bar-group')
        .data(dataset)
        .enter()
        .append('g') // Container for the each bar
        .attr({
            transform: function(d, i) {
                return 'translate(' + convert.x(d.key) + ', 0)';
            },
            class: 'bar-group'
        });

    bars.append('rect')
        .attr({
            y: maxHeight,
            height: 0,
            width: function(d) {
                return convert.x.rangeBand(d) - 1;
            },
            class: 'bar'
        })
        .transition()
        .duration(1500)
        .attr({
            y: function(d, i) {
                return convert.y(d.value);
            },
            height: function(d, i) {
                return maxHeight - convert.y(d.value);
            }
        });

    return chart;
}
//periodic refresh
setInterval(repeat, 3000);
	