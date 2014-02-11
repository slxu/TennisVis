var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1600 - 1060,
    height = 600;//960 - margin.top - margin.bottom;
 
var formatNumber = d3.format(",.0f"),    // zero decimal places
  format = function(d) { return formatNumber(d) + " " + units; },
  color = d3.scale.category20();

var svg = d3.select("svg");
var mapgraph = d3.mapgraph();

var city2Geo=new Map;
d3.csv("data/geodata.csv", function(error,cities){
  cities.forEach(function(d, i) {
    d.index = i;
    d.x = +d.x;
    d.y = +d.y;
    city2Geo.put(d.city,d);
  });
});

var eventID2Info =new Map;
d3.csv("data/event_list.csv", function(error,events){
  events.forEach(function(d, i) {
    d.draws = +d.draws;
    d.index = i;
    eventID2Info.put(d.eventID,d);
  });
});

var playerID2Info =new Map;
d3.csv("data/players_info.csv", function(error,players){
  players.forEach(function(d, i) {
    d.age = +d.age;
    d.index = i;
    playerID2Info.put(d.playerID,d);
  });
});

d3.json("data/data1.json", function(error, graph) {

  var toursData = graph.tournaments;
  var playersData = graph.players;
  var linksData = graph.links;

  mapgraph.toursData(toursData)
    .playersData(playersData)
    .linksData(linksData);

  mapgraph.update();
}); 

d3.json("data/data2.json", function(error, graph) {

  var toursData = graph.tournaments;
  var playersData = graph.players;
  var linksData = graph.links;

  mapgraph.toursData(toursData)
    .playersData(playersData)
    .linksData(linksData);

  mapgraph.update();
});

// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
d3.csv("data/points.json", function(error, points) {

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");

  // A nest operator, for grouping the event list.
  var nestByEvent = d3.nest()
      .key(function(d) { return d.eventID; });

  var nestByPlayer = d3.nest()
      .key(function(d) { return d.playerID; });


  // A little coercion, since the CSV is untyped.
  points.forEach(function(d, i) {
    d.index = i;
    d.beginDate = parseDate(d.beginDate);
    d.endDate = parseDate(d.endDate);
    d.point = +d.point;
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var eventPoints = crossfilter(points),
      all = eventPoints.groupAll(),
      date = eventPoints .dimension(function(d) { return d.endDate; }),
      dates = date.group(d3.time.day);
      eventID = eventPoints.dimension(function(d) {return d.eventID;}),
      playerID = eventPoints.dimension(function(d) {return d.playerID;});
  var eventIDs = eventID.group();
  var playerIDs = playerID.group();


//      hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
//      hours = hour.group(Math.floor),
//      delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
//      delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
//      distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
//      distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });

  var charts = [

//    barChart()
 //       .dimension(hour)
//        .group(hours)
//      .x(d3.scale.linear()
//        .domain([0, 24])
//        .rangeRound([0, 10 * 24])),

//    barChart()
//        .dimension(delay)
//        .group(delays)
//      .x(d3.scale.linear()
//        .domain([-60, 150])
//        .rangeRound([0, 10 * 21])),
//
//    barChart()
//        .dimension(distance)
//        .group(distances)
//      .x(d3.scale.linear()
//        .domain([0, 2000])
//        .rangeRound([0, 10 * 40])),

    barChart()
        .dimension(date)
        .group(dates)
        .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2009, 0, 1), new Date(2013, 11, 31)])
        .rangeRound([0, 10 * 90]))
        .filter([new Date(2013, 0, 1), new Date(2013, 11, 31)])

  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the initial lists.
  var list = d3.selectAll(".list")
      .data([eventList]);

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(eventPoints .size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    list.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }

  // Like d3.time.format, but faster.
  function parseDate(d) {
    return new Date(d.substring(6,10),
                    d.substring(3,5)-1,
                    d.substring(0,2));
  }

  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  function eventList(div) {
    //console.log("my object: %o", eventID.top(2));
    //var eventsByEvent = nestByEvent.entries(eventID.top(40000));
    var allGroupedPlayers = playerIDs.all();
    var allPlayers=[]
    allGroupedPlayers.forEach (function(p)
      {
        if (p.value+0>0)
          allPlayers.push(p);
      }
    );

    var allGroupedEvents = eventIDs.all();

    console.log("players: %o", allPlayers );
    var allEvents=[]
    allGroupedEvents.forEach ( function(p)
      {
        if (p.value+0>0)
          allEvents.push(p);
      }
    );
    console.log("events: %o", allEvents);
  }

  function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
      var width = x.range()[1],
          height = y.range()[0];

      y.domain([0, group.top(1)[0].value]);

      div.each(function() {
        var div = d3.select(this),
            g = div.select("g");

        // Create the skeletal chart.
        if (g.empty()) {
//          div.select(".title").append("a")
//              .attr("href", "javascript:reset(" + id + ")")
//              .attr("class", "reset")
//              .text("reset")
//              .style("display", "none");

          g = div.append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          g.append("clipPath")
              .attr("id", "clip-" + id)
            .append("rect")
              .attr("width", width)
              .attr("height", height);

          g.selectAll(".bar")
              .data(["background", "foreground"])
            .enter().append("path")
              .attr("class", function(d) { return d + " bar"; })
              .datum(group.all());

          g.selectAll(".foreground.bar")
              .attr("clip-path", "url(#clip-" + id + ")");

          g.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(axis);

          // Initialize the brush component with pretty resize handles.
          var gBrush = g.append("g").attr("class", "brush").call(brush);
          gBrush.selectAll("rect").attr("height", height);
          gBrush.selectAll(".resize").append("path").attr("d", resizePath);
        }

        // Only redraw the brush if set externally.
        if (brushDirty) {
          brushDirty = false;
          g.selectAll(".brush").call(brush);
          div.select(".title a").style("display", brush.empty() ? "none" : null);
          if (brush.empty()) {
            g.selectAll("#clip-" + id + " rect")
                .attr("x", 0)
                .attr("width", width);
          } else {
            var extent = brush.extent();
            g.selectAll("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
          }
        }

        g.selectAll(".bar").attr("d", barPath);
      });

      function barPath(groups) {
        var path = [],
            i = -1,
            n = groups.length,
            d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
      }
    }

    brush.on("brushstart.chart", function() {
      var div = d3.select(this.parentNode.parentNode.parentNode);
      div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function() {
      var g = d3.select(this.parentNode),
          extent = brush.extent();
      if (round) g.select(".brush")
          .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
          .style("display", null);
      g.select("#clip-" + id + " rect")
          .attr("x", x(extent[0]))
          .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function() {
      if (brush.empty()) {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return chart;
    };

    chart.dimension = function(_) {
      if (!arguments.length) return dimension;
      dimension = _;
      return chart;
    };

    chart.filter = function(_) {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
      } else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return chart;
    };

    chart.group = function(_) {
      if (!arguments.length) return group;
      group = _;
      return chart;
    };

    chart.round = function(_) {
      if (!arguments.length) return round;
      round = _;
      return chart;
    };

    return d3.rebind(chart, brush, "on");
  }
});

