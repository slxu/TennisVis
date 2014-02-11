d3.mapgraph = function() {
  var mapgraph = {},
      toursData = [],
      playersData = [],
      linksData = [],
      idToPlayer = {},
      idToTour = {},
      selectPlayer = null,
      selectTour = null,
      svg = d3.select("svg");

  mapgraph.toursData = function(_) {
    if (!arguments.length) return toursData;
    toursData = _;
    selectTour = null;
    return mapgraph;
  };

  mapgraph.playersData = function(_) {
    if (!arguments.length) return playersData;
    playersData = _;
    selectPlayer = null;
    return mapgraph;
  };

  mapgraph.linksData = function(_) {
    if (!arguments.length) return linksData;
    linksData = _;
    return mapgraph;
  };

  mapgraph.update = function() {
    processTourData();
    processPlayerData();
    processLinkData();

    updateLink();
    updateTour();
    updatePlayer();
  };

  mapgraph.updateLink = function() {
    processLinkData();
    updateLink();
    updatePlayer();
  };

  function processTourData() {
    toursData.forEach(function(tour) {
      prj = latLngToXY(tour.lat, tour.lng);
      tour.cx = prj[0];
      tour.cy = prj[1];
      tour.r = tour.score / 250 * 3;
      idToTour[tour.id] = tour;
    });
  }

  function processPlayerData() {
    playersData.forEach(function(player) {
      idToPlayer[player.id] = player;
    });
  }

  function processLinkData() {
    toursData.forEach(function(tour) {
      tour.links = [];
    });

    playersData.forEach(function(player) {
      player.score = 0;
      player.links = [];
    });

    linksData.forEach(function(link) {
      tour = idToTour[link.source];
      player = idToPlayer[link.target];
      player.score += link.value;
      tour.links.push(link)
      player.links.push(link)
      link.source = tour;
      link.target = player;
      link.display = 'none';
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
  }

  function updateLink() {
    var links = svg.append('g').selectAll('.eventlink')
        .data(linksData);

    links.enter().append('path')
        .attr('class', function(d) { return 'eventlink source-' + d.source.id + ' target-' + d.target.id; })
        .attr('d', newPath)
        .style('stroke-width', function(d) { return d.value/10; });

    links.exit().remove();
  }

  function updateTour() {
    // add tournaments on the map
    var tours = svg.selectAll('.tour')
        .data(toursData);

    tours.enter().append('g')
        .attr('class', 'tour')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });

    tours.append('circle')
      .attr('class', function(d){ return 'tour ' + d.id; })
      .attr('r', function(d){ return d.r; })
      .attr('fill', function(d) {
        return d.color = color(d.type.replace(/ .*/, "")); 
      })
      .attr('stroke', 'none')
      .on('mouseover', tourMouseover)
      .on('mouseout', tourMouseout)
      .on('click', tourClick);

    tours.append('circle')
      .attr('r', 2)
      .attr('fill', 'white')
      .attr('stroke', '#222')
      .attr('stroke-width', 1);

    tours.append("text")
      .attr("x", function(d){ return d.r+5; })
      .attr("y", 5)
      .text(function(d){ return d.name; });

    tours.exit().remove();
  }

  function updatePlayer() {
    // add photos
    var photos = svg.append('defs').selectAll('pattern')
        .data(playersData);

    photos.enter().append('pattern')
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
        .data(playersData);

    players.enter().append('g')
        .attr('class', 'player')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });

    players.append('circle')
      .attr('class', function(d){ return 'player ' + d.id; })
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

    photos.exit().remove();
    players.exit().remove();
  }

  function newPath(d) {
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
  }

  function tourMouseover(d) {
    svg.selectAll('path.eventlink.source-' + d.id)
      .style('display', 'inline');
    svg.select('circle.tour.' + d.id)
      .style('stroke-width', 3);
  };

  function tourMouseout(d) {
    svg.selectAll('path.eventlink.source-' + d.id)
      .filter(function(d) { 
        return (d.source != selectTour && d.target != selectPlayer)
      })
      .style('display', 'none');
    if (selectTour != d)
      svg.select('circle.tour.' + d.id)
        .style('stroke-width', 0);
  };

  function playerMouseover(d) {
    svg.selectAll('path.eventlink.target-' + d.id)
      .style('display', 'inline');
    svg.selectAll('circle.player.'+d.id)
      .style('stroke-width', 3);
  };

  function playerMouseout(d) {
    svg.selectAll('path.eventlink.target-' + d.id)
      .filter(function(d) { 
        return (d.source != selectTour && d.target != selectPlayer)
      })
      .style('display', 'none');
    if (selectPlayer != d)
      svg.select('circle.player.' + d.id)
        .style('stroke-width', 0);
  };

  //TODO: select both player and tour
  function playerClick(d) {
    if (selectPlayer == null) {
      selectPlayer = d;
      svg.selectAll('path.eventlink.target-' + d.id)
        .style('display', 'inline');
    } else {
      svg.selectAll('path.eventlink.target-' + selectPlayer.id)
        .style('display', 'none');
      if (d != selectPlayer) {
        selectPlayer = d;
        svg.selectAll('path.eventlink.target-' + d.id)
          .style('display', 'inline');
      } else
        selectPlayer = null;
    }
  }

  function tourClick(d) {
    if (selectTour == null) {
      selectTour = d;
      svg.selectAll('path.eventlink.source-' + d.id)
        .style('display', 'inline');
    } else {
      svg.selectAll('path.eventlink.source-' + selectTour.id)
        .style('display', 'none');
      if (d != selectTour) {
        selectTour = d;
        svg.selectAll('path.eventlink.source-' + d.id)
          .style('display', 'inline');
      } else
        selectTour = null;
    }
  }
  
  return mapgraph;
};