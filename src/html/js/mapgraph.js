d3.mapgraph = function() {
  var mapgraph = {},
      toursData = [],
      playersData = [],
      linksData = [],
      globalIDToPlayer = {},
      globalIDToTour = {},      
      cityToGeo = {},
      focusPlayer = null,
      focusTour = null,
      playerShown = 15;

  var svg = d3.select("svg"),
      colorMap = {'Hard': 'steelblue', 'Clay': 'orange', 'Grass': 'green'}
      color = d3.scale.category20();

  mapgraph.globalIDToPlayer = function(_) {
    if (!arguments.length) return globalIDToPlayer;
    globalIDToPlayer = _;
    return mapgraph;
  };

  mapgraph.globalIDToTour = function(_) {
    if (!arguments.length) return globalIDToTour;
    globalIDToTour = _;
    return mapgraph;
  };

  mapgraph.cityToGeo = function(_) {
    if (!arguments.length) return cityToGeo;
    cityToGeo = _;
    return mapgraph;
  };

  mapgraph.linksData = function(_) {
    if (!arguments.length) return linksData;
    linksData = _;
    processLinkData();
    return mapgraph;
  };

  mapgraph.update = function() {
    svg.selectAll('.tour_group')
      .data([]).exit().remove();
    svg.selectAll('.player_group')
      .data([]).exit().remove();
    svg.selectAll('.link_group')
      .data([]).exit().remove();

    drawLink();
    drawTour();
    drawPlayer();
    return mapgraph;
  }

  function processLinkData() {

    var idToTour = {};
    var idToPlayer = {};
    var totalPlayersData = [];

    toursData = [];
    playersData = [];

    linksData.forEach(function(link) {
      var tourID = link.tourID;
      var playerID = link.playerID;
      link.point = parseInt(link.point);

      var tour;
      var player;
      if (tourID in idToTour) {
        tour = idToTour[tourID];
        tour.links.push(link);
      } else {
        // console.log(tourID);
        tour = jQuery.extend(true, {}, globalIDToTour[tourID]);
        // console.log(tour.city);
        var geo = cityToGeo.get(tour.city);
        prj = latLngToXY(geo.lat, geo.lng);
        tour.cx = prj[0];
        tour.cy = prj[1];
        tour.r = Math.sqrt(tour.score / 250.0) * 8;
        tour.links = [link];

        toursData.push(tour);
        idToTour[tourID] = tour;
      }

      if (playerID in idToPlayer) {
        player = idToPlayer[playerID];
        player.score = player.score + link.point;
        player.links.push(link);
      } else {
        player = jQuery.extend(true, {}, globalIDToPlayer[playerID]);
        player.score = link.point;
        player.links = [link];

        totalPlayersData.push(player);
        idToPlayer[playerID] = player;
      }

      link.source = tour;
      link.target = player;
    });

    totalPlayersData.sort(function(a, b) { return b.score - a.score; });
    var scale = 50.0 / Math.sqrt(totalPlayersData[0].score);
    totalPlayersData.forEach(function(player, index) {
      if (index < playerShown) {
        player.r = Math.max(15, Math.sqrt(player.score) * scale);
        if (index == 0) {
          player.cx = 10 + player.r;
          player.cy = 100;//10 + player.r;
        } else {
          player.cx = playersData[index-1].cx + playersData[index-1].r + 20 + player.r;
          player.cy = 100; //10 + player.r;
        }
        playersData.push(player);
      } else {
        player.links.forEach(function(link) {
          var index = linksData.indexOf(link);
          linksData.splice(index, 1);
        });
      }
    });
    console.log(playersData);
  }

  function drawLink() {
    var links = svg.append('g')
        .attr('class', 'link_group')
      .selectAll('.eventlink')
        .data(linksData);

    links.enter().append('path')
        .attr('class', function(d) { return 'eventlink source-' + d.source.id + ' target-' + d.target.id; })
        .attr('d', newPath)
        .style('stroke-width', function(d) { return Math.max(3, d.point/50); });
  }

  function drawTour() {
    // add tournaments on the map
    var tours = svg.append('g')
        .attr('class', 'tour_group')
      .selectAll('.tour')
        .data(toursData);

    tours.enter().append('g')
        .attr('class', 'tour')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        })

    tours.append('circle')
      .attr('class', function(d){ return d.id; })
      .attr('r', function(d){ /*console.log(d);*/ return d.r; })
      .attr('fill', function(d) { 
        //return d.color = color(d.type.replace(/ .*/, "")); 
        return d.color = colorMap[d.type];
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

    /*tours.append("text")
      .attr("x", function(d){ return d.r+5; })
      .attr("y", 5)
      .text(function(d){ return d.name; });*/
  }

  function drawPlayer() {
    // add photos
    var group = svg.append('g')
        .attr('class', 'player_group');

    var photos = group.append('defs')
      .selectAll('pattern')
        .data(playersData);

    photos.enter().append('pattern')
        .attr("id", function(d){ return 'photo-' + d.id; })
        .attr("patternUnits", "userSpaceOnUse")
        .attr("x", function(d){ return -d.r; })
        .attr("y", function(d){ return -d.r; })
        .attr("width", function(d){ return d.r*2; })
        .attr("height", function(d){ return d.r*2/148*198; })
        .append('image')
          .attr("width", function(d){ return d.r*2; })
          .attr("height", function(d){ return d.r*2/148*198; })
          .attr("xlink:href", function(d){ return "photos/"+d.id+".jpg"; });

    // add players
    var players = group.selectAll('.player')
        .data(playersData);

    players.enter().append('g')
        .attr('class', 'player')
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });

    players.append('circle')
      .attr('class', function(d){ return d.id; })
      .attr('r', function(d){ return d.r; })
      .attr("cy", function(d){ return d.r*0.3; })
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
        if (d.name==null || d.name == undefined)
          console.log("null d: %o", d );
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

    svg.selectAll('circle.'+d.id)
      .style('stroke-width', 3);
  };

  function tourMouseout(d) {
    svg.selectAll('path.eventlink.source-' + d.id)
      .filter(function(d) { 
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusTour != d)
      svg.selectAll('circle.'+d.id)
        .style('stroke-width', 0);
  };

  function playerMouseover(d) {
    svg.selectAll('path.eventlink.target-' + d.id)
      .style('display', 'inline');
    svg.selectAll('circle.'+d.id)
      .style('stroke-width', 3);
  };

  function playerMouseout(d) {
    svg.selectAll('path.eventlink.target-' + d.id)
      .filter(function(d) { 
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusPlayer != d)
      svg.select('circle.' + d.id)
        .style('stroke-width', 0);
  };

  //TODO: select both player and tour
  function playerClick(d) {
    if (focusPlayer == null) {
      focusPlayer = d;
      svg.selectAll('path.eventlink.target-' + d.id)
        .style('display', 'inline');
    } else {
      svg.selectAll('path.eventlink.target-' + focusPlayer.id)
        .style('display', 'none');
      if (d != focusPlayer) {
        focusPlayer = d;
        svg.selectAll('path.eventlink.target-' + d.id)
          .style('display', 'inline');
      } else
        focusPlayer = null;
    }
  }

  function tourClick(d) {
    if (focusTour == null) {
      focusTour = d;
      svg.selectAll('path.eventlink.source-' + d.id)
        .style('display', 'inline');
    } else {
      svg.selectAll('path.eventlink.source-' + focusTour.id)
        .style('display', 'none');
      if (d != focusTour) {
        focusTour = d;
        svg.selectAll('path.eventlink.source-' + d.id)
          .style('display', 'inline');
      } else
        focusTour = null;
    }
  }
  
  return mapgraph;
};
