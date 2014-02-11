var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1600 - 1060,
    height = 600;//960 - margin.top - margin.bottom;
 
var formatNumber = d3.format(",.0f"),    // zero decimal places
  format = function(d) { return formatNumber(d) + " " + units; },
  color = d3.scale.category20();

var svg = d3.select("svg");

var newPath = function(d) {
  var curvature = .5;
  var x0 = d.source.cx,
      x1 = d.target.cx,
      y0 = d.source.cy,
      y1 = d.target.cy,
      yi = d3.interpolateNumber(y0, y1),
      y2 = yi(curvature),
      y3 = yi(1 - curvature);
  return "M" + x0 + "," + y0
       + "C" + x0 + "," + y2
       + " " + x1 + "," + y3
       + " " + x1 + "," + y1;
};

//function wrap(text, width) {
function wrap(d) {
  text = d.name;
  width = d.r*2;
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

var selectPlayer = null,
    selectTour = null;

var tours = [];

function tourMouseover(d) {
  console.log(d.id);
  svg.selectAll('path.eventlink.source-' + d.id)
    .style('display', 'inline');
  tours
    .selectAll(d.id)
    .style('stroke-width', 3);
};

function tourMouseout(d) {
  svg.selectAll('path.eventlink.source-' + d.id)
    .filter(function(d) { 
      return (d.source != selectTour && d.target != selectPlayer)
    })
    .style('display', 'none');
  if (selectTour != d)
    svg.select('#' + d.id)
      .style('stroke-width', 0);
};

function playerMouseover(d) {
  svg.selectAll('path.eventlink.target-' + d.id)
    .style('display', 'inline');
  svg.select('#' + d.id)
    .style('stroke-width', 3);
};

function playerMouseout(d) {
  svg.selectAll('path.eventlink.target-' + d.id)
    .filter(function(d) { 
      return (d.source != selectTour && d.target != selectPlayer)
    })
    .style('display', 'none');
  if (selectPlayer != d)
    svg.select('#' + d.id)
      .style('stroke-width', 0);
};

//TODO: select both player and tour
function playerClick(d) {
  if (selectPlayer == null) {
    selectPlayer = d;
    svg.selectAll('path.eventlink.target-' + d.id)
      .style('display', 'inline');
    svg.select('#' + d.id)
      .style('stroke-width', 3);
  } else {
    svg.selectAll('path.eventlink.target-' + selectPlayer.id)
      .style('display', 'none');
    svg.select('#' + selectPlayer.id)
      .style('stroke-width', 0);
    if (d != selectPlayer) {
      selectPlayer = d;
      svg.selectAll('path.eventlink.target-' + d.id)
        .style('display', 'inline');
      svg.select('#' + d.id)
        .style('stroke-width', 3);
    } else
      selectPlayer = null;
  }
}

function tourClick(d) {
  if (selectTour == null) {
    selectTour = d;
    svg.selectAll('path.eventlink.source-' + d.id)
      .style('display', 'inline');
    svg.select('#' + d.id)
      .style('stroke-width', 3);
  } else {
    svg.selectAll('path.eventlink.source-' + selectTour.id)
      .style('display', 'none');
    svg.select('#' + selectTour.id)
      .style('stroke-width', 0);
    if (d != selectTour) {
      selectTour = d;
      svg.selectAll('path.eventlink.source-' + d.id)
        .style('display', 'inline');
      svg.select('#' + d.id)
        .style('stroke-width', 3);
    } else
      selectTour = null;
  }
}

d3.json("data1.json", function(error, graph) {

  var toursData = graph.tournaments;
  var playersData = graph.players;
  var linksData = graph.links;
  
  var nameToTour = {}
  var nameToPlayer = {}

  toursData.forEach(function(tour) {
    prj = latLngToXY(tour.lat, tour.lng);
    tour.cx = prj[0];
    tour.cy = prj[1];
    tour.r = tour.score / 250 * 3;
    tour.links = []
    nameToTour[tour.name] = tour;
  });

  playersData.forEach(function(player) {
    player.score = 0;
    player.links = []
    nameToPlayer[player.name] = player;
  });

  linksData.forEach(function(link) {
    nameToPlayer[link.target].score += link.value;
    tour = nameToTour[link.source];
    player = nameToPlayer[link.target];
    link.source = tour;
    link.target = player;
    link.display = 'none';

    tour.links.push(link)
    player.links.push(link)
  });

  playersData.sort(function(a, b) { return b.score - a.score; });

  playersData.forEach(function(player, index) {
    player.r = Math.max(15, player.score / 8);
    if (index == 0) {
      player.cx = 10 + player.r;
      player.cy = 100;//10 + player.r;
    } else {
      player.cx = playersData[index-1].cx + playersData[index-1].r + 20 + player.r;
      player.cy = 100; //10 + player.r;
    }
  });


  svg.append('g').selectAll('.eventlink')
      .data(linksData)
    .enter().append('path')
      .attr('class', function(d) { return 'eventlink source-' + d.source.id + ' target-' + d.target.id; })
      .attr('d', newPath)
      .style('stroke-width', function(d) { return d.value/10; });

  // add tournaments on the map
  tours = svg.selectAll('.tour')
      .data(toursData)
    .enter().append('g')
      .attr('class', 'tour')
      .attr('transform', function(d) {
        return 'translate(' + d.cx + ',' + d.cy + ')';
      });

  tours.append('circle')
    .attr('class', function(d){ return d.id; })
    .attr('r', function(d){ return d.r; })
    .attr('fill', function(d) {
      return d.color = color(d.type.replace(/ .*/, "")); 
    })
    //.attr('fill', 'steelblue')
    .attr('stroke', 'none')
    .on('mouseover', tourMouseover)
    .on('mouseout', tourMouseout)
    .on('click', tourClick);
  
  
  // add photos
  svg.append('defs').selectAll('pattern')
      .data(playersData)
    .enter().append('pattern')
      .attr("id", function(d){ return 'photo-' + d.id; })
      .attr("patternUnits", "userSpaceOnUse")
      .attr("x", function(d){ return -d.r; })
      .attr("y", function(d){ return -d.r; })
      .attr("width", function(d){ return d.r*2; })
      .attr("height", function(d){ return d.r*2/148*198; })
      .append('image')
        //.attr("x", function(d){ return d.cx - d.r; })
        //.attr("y", function(d){ return d.cy - d.r; })
        .attr("width", function(d){ return d.r*2; })
        .attr("height", function(d){ return d.r*2/148*198; })
        .attr("xlink:href", function(d){ return d.photo; });

  // add players
  var players = svg.append('g').selectAll('.player')
      .data(playersData)
    .enter().append('g')
      .attr('class', 'player')
      .attr('transform', function(d) {
        return 'translate(' + d.cx + ',' + d.cy + ')';
      });

  players.append('circle')
    .attr('id', function(d){ return d.id; })
    .attr('r', function(d){ return d.r; })
    .attr('fill', function(d){ return "url(#photo-" + d.id + ")"; })
    .attr('stroke', 'none')
    .on('mouseover', playerMouseover)
    .on('mouseout', playerMouseout)
    .on('click', playerClick);

  players.append("text")
    .attr("x", function(d){ return 0; })
    .attr("y", function(d, i) { 
      offset = (i % 2 == 0) ? 0 : 20;
      return -d.r-25-offset; 
    })
    .attr("text-anchor", "middle")
    .text(function(d) { 
      str = d.name.split(' ');
      return str[0]; 
    });
  players.append("text")
    .attr("y", function(d, i){ 
      offset = (i % 2 == 0) ? 0 : 20;
      return -d.r-10-offset; 
    })
    .attr("text-anchor", "middle")
    .text(function(d) { 
      str = d.name.split(' ');
      return str[1]; 
    });

  players.append("text")
    .attr("y", function(d){ return d.r+25; })
    .attr("text-anchor", "middle")
    .text(function(d){ return Math.floor(d.score); });

  tours.append("text")
    .attr("x", function(d){ return d.r+5; })
    .attr("y", 5)
    .text(function(d){ return d.name; });
}); 