d3.mapgraph = function() {
  var mapgraph = {},
      toursData = [],
      playersData = [],
      linksData = [],
      idToPlayer = {},
      idToTour = {},
      globalIDToPlayer = {},
      globalIDToTour = {},      
      cityToGeo = {},
      focusPlayer = null,
      focusTour = null,
      svg = d3.select("svg"),
      color = d3.scale.category20();
  var tours;

  mapgraph.toursData = function(_) {
    if (!arguments.length) return toursData;
    toursData = _;
    focusTour = null;
    return mapgraph;
  };

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

  mapgraph.playersData = function(_) {
    if (!arguments.length) return playersData;
    playersData = _;
    focusPlayer = null;
    return mapgraph;
  };

  mapgraph.linksData = function(_) {
    if (!arguments.length) return linksData;
    linksData = _;
    return mapgraph;
  };

  mapgraph.init = function() {
    processTourData();
    processPlayerData();
    processLinkData();

    drawLink();
    drawTour();
    drawPlayer();
  }

  mapgraph.update = function() {
    processTourData();
    updateTour();
  };

  mapgraph.updateLink = function() {
    processLinkData();
    updateLink();
    updatePlayer();
  };

  function processTourData() {
    var newToursData=[];
    toursData.forEach(function(tourID) {
      var tour = jQuery.extend(true, {}, globalIDToTour[tourID]); 
      newToursData.push(tour);
      idToTour[tourID] = tour;
      console.log(tour);
      console.log(tour.city);
      geo = cityToGeo.get(tour.city);
      prj = latLngToXY(geo.lat, geo.lng);
      tour.cx = prj[0];
      tour.cy = prj[1];
      tour.r = Math.sqrt(tour.score / 250.0) * 8;
    });
    toursData = newToursData;
    //console.log("toursData: %o", toursData );
  }

  function processPlayerData() {

    var newPlayersData = [];

    playersData.forEach(function(playerID) {
      var player = jQuery.extend(true, {}, globalIDToPlayer[playerID]); 
      //console.log("id: %s, obj: %o",playerID,globalIDToPlayer[playerID]);
      idToPlayer[playerID] = player;
      newPlayersData.push(player);
    });
    playersData = newPlayersData;
    //console.log("playersData: %o", playersData );
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
      if (tour == null || tour == undefined)
        alert(link);
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
      player.r = Math.max(15, Math.sqrt(player.score) * 2);
      if (index == 0) {
        player.cx = 10 + player.r;
        player.cy = 100;//10 + player.r;
      } else {
        player.cx = playersData[index-1].cx + playersData[index-1].r + 20 + player.r;
        player.cy = 100; //10 + player.r;
      }
    });
  }

  function drawLink() {
    var links = svg.append('g').selectAll('.eventlink')
        .data(linksData);

    links.enter().append('path')
        .attr('class', function(d) { return 'eventlink source-' + d.source.id + ' target-' + d.target.id; })
        .attr('d', newPath)
        .style('stroke-width', function(d) { return d.value/10; });

    links.exit().remove();
  }

  function drawTour() {
    // add tournaments on the map
    tours = svg.selectAll('.tour')
        .data(toursData);

    tours.enter().append('g')
        .attr('class', 'tour')
        .attr('transform', function(d) {
          //console.log(d);
          return 'translate(' + d.cx + ',' + d.cy + ')';
        })


    tours.append('circle')
      //.append('circle')
        //.data(function(d){ return [d]; })
      .attr('class', function(d){ return d.id; })
      .attr('r', function(d){ console.log(d); return d.r; })
      .attr('fill', function(d) {
        return d.color = color(d.type.replace(/ .*/, "")); 
      })
      .attr('stroke', 'none')
      .on('mouseover', tourMouseover)
      .on('mouseout', tourMouseout)
      .on('click', tourClick);

    /*tours.append('circle')
      .attr('r', 2)
      .attr('fill', 'white')
      .attr('stroke', '#222')
      .attr('stroke-width', 1);*/

    tours.append("text")
      .attr("x", function(d){ return d.r+5; })
      .attr("y", 5)
      .text(function(d){ return d.name; });

    tours.exit().remove();
  }

  function updateTour() {
    console.log('updateTour');
    tour.data([]).exit().remove();
    return;

    console.log(toursData);
    tours
      .data(toursData)
      .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        });
    
    console.log(tours);
    //console.log(tours.selectAll('g'));
    console.log(tours.selectAll('circle'));

    var sel = tours.selectAll('circle')
        .data(function(d) { return [d]; });
    console.log(sel);
    sel.enter().append('circle')
        //.data(toursData)
        .attr('r', function(d){ 
          console.log(d); return d.r; });
  }

  function drawPlayer() {
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
          .attr("xlink:href", function(d){ return "photos/"+d.id+".jpg"; });

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
    svg.select('circle.g.' + d.id)
      .style('stroke-width', 3);
  };

  function tourMouseout(d) {
    svg.selectAll('path.eventlink.source-' + d.id)
      .filter(function(d) { 
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusTour != d)
      svg.select('circle.g.' + d.id)
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
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusPlayer != d)
      svg.select('circle.player.' + d.id)
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
