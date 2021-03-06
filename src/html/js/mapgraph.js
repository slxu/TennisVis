var courtType2Color = {'Hard': 'steelblue', 'Clay': '#ff7f0e', 'Grass': '#2ca02c'}
      color = d3.scale.category20();


d3.mapgraph = function() {
  var mapgraph = {},
      toursData = [],
      playersData = [],
      linksData = [],
      idToTour = {},
      idToPlayer = {},
      initialTour = null,
      globalIDToPlayer = {},
      globalIDToTour = {},      
      cityToGeo = {},
      focusPlayer = null,
      focusTour = null,
      playerShown = 15;

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

  mapgraph.initialTour = function(_) {
    if (!arguments.length) return initialTour;
    initialTour = _;
    return mapgraph;
  };

  mapgraph.update = function() {
    mapG.selectAll('.tour_group')
      .data([]).exit().remove();
    mapG.selectAll('.player_group')
      .data([]).exit().remove();
    mapG.selectAll('.link_group')
      .data([]).exit().remove();

    drawLink();
    drawTour();
    drawPlayer();
    tourClick(idToTour[initialTour]);
    return mapgraph;
  }


  function processLinkData() {

    idToTour = {};
    idToPlayer = {};
    var totalPlayersData = [];

    toursData = [];
    playersData = [];

    linksData.forEach(function(link) {
      var tourID = link.tourID;
      var playerID = link.playerID;
      link.point = parseInt(link.point);
      link.targetWidth = Math.max(6, link.point/25);
      link.sourceWidth = Math.min(6, link.targetWidth);

      var tour;
      var player;
      if (tourID in idToTour) {
        tour = idToTour[tourID];
        tour.links.push(link);
      } else {
        tour = jQuery.extend(true, {}, globalIDToTour[tourID]);
        var geo = cityToGeo.get(tour.city);
        prj = latLngToXY(geo.lat, geo.lng);
        tour.cx = prj[0];
        tour.cy = prj[1];
        // tour.r = Math.sqrt(tour.score / 250.0) * 8;
        tour.r = Math.sqrt(tour.score/250)*5;
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
    console.log("%o",playersData);
  }

  var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " points"; };

  function newPath(d) {
    var curvature = .5;
    var xs1 = d.source.cx - d.sourceWidth/2,
        xs2 = d.source.cx + d.sourceWidth/2,
        ys = d.source.cy,
        xt1 = d.target.cx - d.targetWidth/2,
        xt2 = d.target.cx + d.targetWidth/2,
        yt = d.target.cy,
        yi = d3.interpolateNumber(ys, yt),
        y1 = yi(curvature),
        y2 = yi(1 - curvature);
    return "M" + xs2 + "," + ys
         + "L" + xs1 + "," + ys
         + "C" + xs1 + "," + y1
         + " " + xt1 + "," + y2
         + " " + xt1 + "," + yt
         + "L" + xt2 + "," + yt
         + "C" + xt2 + "," + y2
         + " " + xs2 + "," + y1
         + " " + xs2 + "," + ys;
  }

  function drawLink() {
    var links = mapG.append('g')
        .attr('class', 'link_group')
      .selectAll('.eventlink')
        .data(linksData);

    links.enter().append('path')
        .attr('fill', function(d){ return courtType2Color[d.source.type]; })
        .attr('class', function(d) { return 'eventlink source-' + d.source.id + ' target-' + d.target.id;  })
        .attr('d', newPath)
        //.style('stroke-width', function(d) { return Math.max(3, d.point/50); })
        .append("title")
        .text(function(d) {
      	return d.source.name + " → " + 
                d.target.name + "\n" + format(d.point); });
  }

  function getType(t){
    if (t == "2000")
      return "Grand Slam";
    if (t == "1000")
      return "ATP World Tour 1000 Series";
    if (t == "500")
      return "ATP World Tour 500 Series";
    if (t == "250")
      return "ATP World Tour 250 Series";
    if (t == "1500")
      return "ATP World Tour Final";
    if (t == "750")
      return "Olympics";
    return "Unknown match type";
  }

  function drawTour() {
    // add tournaments on the map
    var tours = mapG.append('g')
        .attr('class', 'tour_group')
      .selectAll('.tour')
        .data(toursData);

    tours.enter().append('g')
        .attr('class', function(d){ return 'tour ' + d.id; })
        .attr('transform', function(d) {
          return 'translate(' + d.cx + ',' + d.cy + ')';
        })

    tours.append('circle')
      .attr('r', function(d){return d.r;})
      .attr('fill', function(d) { 
        return d.color = courtType2Color[d.type];
      })
      .attr('stroke', 'white')
      .attr('stroke-width', .5)
      .on('mouseover', tourMouseover)
      .on('mouseout', tourMouseout)
      .on('click', tourClick)
      .append("title")
      .text(function(d) {
      return d.name + ":\n"
             + getType(d.score)+"\n"
             + "City: "+d.city + "\n"
             + "Duration: "+d.startEndDates+"\n"
             + "Draws: "+d.draws + "\n"
             + "Total prize money: "+ d.prizeMoney;});

    tours.append('circle')
      .attr('r', 1)
      .attr('fill', 'white');

    tours.append("text")
      .attr("x", function(d){ return d.r+5; })
      .attr("y", 5)
      .attr("display", "none")
      .text(function(d){ return d.name; });

    tours.exit().remove();
  }

  function drawPlayer() {
    // add photos
    var group = mapG.append('g')
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
      .on('click', playerClick)
      .append("title")
      .text(function(d) {
      return d.name + ":\n"
             + "Age: " + d.age+"\n"
             + "Birthday place: "+d.birthplace+"\n"
             + "Residence: "+d.residence + "\n"
             + "Height: "+d.height + "\n"
             + "Weight: "+d.weight + "\n"
             + "Plays: "+d.plays + "\n"
             + "Turned professional: "+d.turned + "\n"
             + "Coach: "+ d.coach;});

    players.append("text")
      .attr("x", function(d){ return 0; })
      .attr("y", function(d, i) { 
        return -d.r-25; 
      })
      .attr("text-anchor", "middle")
      .text(function(d) { 
        str = d.name.split(' ');
        return str[0]; 
      });
    players.append("text")
      .attr("y", function(d, i){ 
        return -d.r-10; 
      })
      .attr("text-anchor", "middle")
      .text(function(d) { 
        str = d.name.split(' ');
        return str[1]; 
      });

    players.append("text")
      .attr("y", function(d){ return d.r+35; })
      .attr("text-anchor", "middle")
      .text(function(d){ return Math.floor(d.score); });
  }

  function tourMouseover(d) {
    mapG.selectAll('path.eventlink.source-' + d.id)
      .style('display', 'inline');

    mapG.selectAll('.'+d.id).select('circle')
      .attr('r', d.r)
      .style('stroke-width', 2);

    mapG.selectAll('.'+d.id).select('text')
      .attr('display', 'inline');
  };

  function tourMouseout(d) {
    mapG.selectAll('path.eventlink.source-' + d.id)
      .filter(function(d) { 
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusTour != d) {
      mapG.selectAll('.'+d.id).select('circle')
        .attr('r', d.r)
        .style('stroke-width', .5);
      mapG.selectAll('.'+d.id).select('text')
       .attr('display', 'none');
    }
  };

  function tourClick(d) {
    if (focusTour == null) {
      focusTour = d;
      mapG.selectAll('path.eventlink.source-' + d.id)
        .style('display', 'inline');
    } else {
      mapG.selectAll('path.eventlink.source-' + focusTour.id)
        .style('display', 'none');
      mapG.selectAll('.'+focusTour.id).select('circle')
        .attr('r', d.r)
        .style('stroke-width', .5);
      mapG.selectAll('.'+focusTour.id).select('text')
       .attr('display', 'none');

      if (d != focusTour) {
        focusTour = d;
        mapG.selectAll('path.eventlink.source-' + d.id)
          .style('display', 'inline');
      } else
        focusTour = null;
    }
  }

  function playerMouseover(d) {
    mapG.selectAll('path.eventlink.target-' + d.id)
      .style('display', 'inline');
    mapG.selectAll('circle.'+d.id)
      .style('stroke-width', 3);
  };

  function playerMouseout(d) {
    mapG.selectAll('path.eventlink.target-' + d.id)
      .filter(function(d) { 
        return (d.source != focusTour && d.target != focusPlayer)
      })
      .style('display', 'none');
    if (focusPlayer != d)
      mapG.select('circle.' + d.id)
        .style('stroke-width', 0);
  };

  //TODO: select both player and tour
  function playerClick(d) {
    if (focusPlayer == null) {
      focusPlayer = d;
      mapG.selectAll('path.eventlink.target-' + d.id)
        .style('display', 'inline');
    } else {
      mapG.selectAll('path.eventlink.target-' + focusPlayer.id)
        .style('display', 'none');
      if (d != focusPlayer) {
        focusPlayer = d;
        mapG.selectAll('path.eventlink.target-' + d.id)
          .style('display', 'inline');
      } else
        focusPlayer = null;
    }
  }

  
  return mapgraph;
};
