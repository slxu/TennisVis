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

d3.json("data1.json", function(error, graph) {

  var tours = graph.tournaments;
  var players = graph.players;
  var links = graph.links;
  var nameToTour = {}
  var nameToPlayer = {}

  tours.forEach(function(tour) {
    tour.cx = tour.mapX;
    tour.cy = tour.mapY;
    tour.r = tour.score / 250 * 3;
    nameToTour[tour.name] = tour;
  });

  players.forEach(function(player) {
    player.score = 0;
    nameToPlayer[player.name] = player;
  });

  links.forEach(function(link) {
    nameToPlayer[link.target].score += link.value;
  });

  players.sort(function(a, b) { return b.score - a.score; });

  players.forEach(function(player, index) {
    player.r = Math.max(15, player.score / 8);
    if (index == 0) {
      player.cx = 10 + player.r;
      player.cy = 100;//10 + player.r;
    } else {
      player.cx = players[index-1].cx + players[index-1].r + 10 + player.r;
      player.cy = 100; //10 + player.r;
    }
  });

  links.forEach(function(link) {
    tour = nameToTour[link.source];
    player = nameToPlayer[link.target];
    link.source = tour;
    link.target = player;
  });

  // add tournaments on the map
  svg.append('g')
      .selectAll('.tour')
      .data(tours)
    .enter().append('circle')
      .attr('class', 'tour')
      .attr('cx', function(d) { return d.cx; })
      .attr('cy', function(d) { return d.cy; })
      .attr('r', function(d) { return d.r; })
      .attr('fill', function (d) {
        return d.color = color(d.name.replace(/ .*/, "")); })
      //.attr('fill', 'steelblue')
      .attr('stroke', 'none');

  // include photos
  svg.append('defs')
      .selectAll('pattern')
      .data(players)
    .enter().append('pattern')
      .attr("id", function(d){ return d.id; })
      .attr("patternUnits", "userSpaceOnUse")
      .attr("x", function(d){ return d.cx - d.r; })
      .attr("y", function(d){ return d.cy - d.r; })
      .attr("width", function(d){ return d.r*2; })
      .attr("height", function(d){ return d.r*2/148*198; })
      .append('image')
        //.attr("x", function(d){ return d.cx - d.r; })
        //.attr("y", function(d){ return d.cy - d.r; })
        .attr("width", function(d){ return d.r*2; })
        .attr("height", function(d){ return d.r*2/148*198; })
        .attr("xlink:href", function(d){ return d.photo; });

  // add players
  svg.append('g')
      .selectAll('.player')
      .data(players)
    .enter().append('circle')
      .attr('class', 'player')
      .attr('cx', function(d) { return d.cx; })
      .attr('cy', function(d) { return d.cy; })
      .attr('r', function(d) { return d.r; })
      //.attr('fill', function (d) {
      //  return d.color = color(d.name.replace(/ .*/, "")); })
      .attr('fill', function(d) { photo = "url(#" + d.id + ")"; console.log(photo); return photo;})
      .attr('stroke', 'none');


  // add links
  svg.append('g')
      .selectAll('.eventlink')
      .data(links)
    .enter().append('path')
      .attr('class', 'eventlink')
      .attr('d', newPath)
      .style('stroke-width', function(d) { return d.value/10; });

});