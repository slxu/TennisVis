# TennisVis Project

###### Haichen Shen and Shengliang Xu

Course Assignment for CSE512 Data Visualization

## 1. Data domain 

We choose ATP Tennis World Tour as the data domain of this assignment.
We would like to visualize several things about the data. 

 * The rankings of the players during a selected time period. An order
   of the players is a good fit. 
 * The points earned by the players and from which tournament events
   are they earned during a selected time period.
 * The time period should be selectable by the users.
 * The players should be represented by their photos, together with a
   short bio for each of them
 * The tournament events are held all over the world. Therefore, the
   placement of them on a world map is a good fit.
 * The short info of each of the tournament events
 * The points from a tournament event to each player should be
   represented visually, rather than by a number.
 * Each tournament event uses one of the three types of courts, i.e.
   clay, grass and hard. This information should be displayed both in
   the representations of tournament events and the representations of
   the points.

## 2. The visualization techniques 

To implement the visualizations, we want to combine the following
techniques:

 * A world map for tournament events placement
 * A flow map to represent the flow of points from a tournament event
   to the players
 * A timeline filter for the users to do filtering of dates

We find the D3.js a good fit to our requirements. The D3.js itself
provides a clear and easy way to construct svg based visualizations.
Moreover, there have been a lot of extensions or plugins developed by
third parties for implementing a lot of standard and fancy
functionalities. For example, for our needs, the D3 ecosystem already
has:

 * Datamap (http://datamaps.github.io/) and the Worldmap template
   (http://techslides.com/demos/d3/worldmap-template.html) based on
   TopoJSON both provide excellent world map visualization support.
 * Sankey Diagram (http://bost.ocks.org/mike/sankey/) provides
   visualization of flows
 * Crossfilter (http://square.github.io/crossfilter/) supports not
   only timeline filtering, but also filtering based data processing
   methods such as map-reduce.

## 3. The data preparation

The whole ATP World Tour dataset is freely available on line in the
format of webpages. We have to write a crawler to get the data we
need. A set of python scripts, which are under src/data_crawler are
written to do the crawling job.

All the crawled data are placed under dataset, including the
tournament match draws, the tournament types, the player photos, etc.

The crawled dataset includes match records as old as 1960s.
Considering that we are not familar with the ATP point policy in the
old days, we choose a subset of the whole dataset for visualization.
The subset is the data from 2009 to present, because ATP changed its
poing policy at the end of 2008. 

Finally, we aggregate all the required data into 3 files and a folder:

* data/players_info.csv. Each line is the info of a player, including
  the playerID, name, age, birthplace, residence, height, weight,
  plays, turned, and coach.
* data/event_list.csv. Each line is the info of a tournament event,
  including eventID, place, city, geo coordinates (obsolete),
  start and end dates, name, draws, type, and total prize money.
* data/points.csv. Each line is a record of how many points a player
  (playerID) gained from an tournament event (eventID).
* data/geodata.csv. Each line is the coordinates of a city
* photos: all the photos of the players named after the player IDs.

## 4. The final visualization

The final visualization consists of several components:

* The time line has a list of bars, one bar per day. The height of a bar is the number
  of tournament events on that day.

* There's a slider on the timeline. It can both be slided and also be
  expanded and shrinked. The width of the slider represents the
  time span. The position of the slider represents the start/end
  dates.

* After a time span is selected from the timeline, a new set of data
  will be generated.
  
 * The points of each player earned during the selected time span are
  summed. 

   * The top 15 players's photos ordered by the earned points are
     shown on the top of the page. 
  
   * Each photo is rounded by a circle, of which the radius also
     reveal the points of the owner player.

 * The tournament events held during the selected time span are placed
   on the world map by circles.

   * There are several types of tournaments in ATP World Tour Series
     in terms of importance (i.e. number of points of the final
     winners): Grand Slam, ATP World Tour Finals, ATP World Tour 1000
     Series, Olympics, ATP World Tour 500 Series, and ATP World Tour 250
     Series. The radius of each circle reflects the different types.
     The larger the radius, the more important a tournament event is.

   * In addition, as aforementioned, there are three types of
     tournament events in terms of court type, i.e. clay, grass and
     hard. This type information is reflected by the color of the
     tournament event circles. Yellow denotes clay; green denotes
     grass; and blue denotes hard.

 * The number of points earned by a player in a tournament event is
   illustrated by a path from the tournament event circle to the
   player cirlce. 

   * The width of a path at the player circle side reflects the number
     of points

   * The color of a path is the same as the color of the source
     tournament event circle, i.e. reflects the court type of the
     tournament event.

   * Intially only the paths of a tournament event, which is the one
     contributes the maximum points to the top 15 players, are shown.
     We do not show all the paths because if the selected time span is
     very large, there may be hundreds of paths. All the paths will
     overlap to each other such that no usefull information can be
     shown.

   * Users can move mouse to a player circle to show all the paths to the
     player. Mouse move out will hide the paths again. A click on the
     circle will make the paths visible when mouse move out.

   * Users can move mouse to a tournament event circle to show all the
     paths from the tournament event cirlce. Mouse move out will hide
     the paths again. A click on the circle will make the paths
     visible when mouse move out.


## History

   We tried a lot of different techniques during the development of
   the current final submission. The whole history is captured by git
   and also by the differnt versions of the experimental html files
   under src/html. Here are the list:
   
   * index.html: experiment the sankey diagram. We initially planed to
     use sankey diagram to illustrate the points flow from the
     tournament events to the players. But finally we abandoned this
     idea because it cannot be easily and elagantly extended to our needs
     that the tournament events are placed by their city coordinates
     on the world map.  But we learned how to draw flow-like paths
     in D3. In the final visualization, the paths are drawn by the
     simlar way in sankey diagram.
   
   * map.html, test.html: experiment the Datamap world map and the geo
     coordinates on the map.

   * map_sankey.html, and map_sankey2.html:  experiment combining the
     world map and sankey diagram. 

   * map_sankey3.html: implemented a simple combination of sankey
     diagram and world map. A test data set is displayed on the map.

   * mouse-pos.html: together with console, it's the initial way we
     record the positions of the cities on the map, i.e. move mouse to
     the position of a city, recording the mouse x,y as the
     coordinates of the city on the map. Later we find out that the
     Datamap itself actually provides the projection of (lat,log) pair
     to coordinates.

   * crossfilter.html: experiment the crossfilter 

   * map4.html: the current submitted version

## Future work

This is a fun small project (assignment). We are going to work on this project
further. Currently we are planing on the following:

 * Implement zoomable world map. Sometimes there may be a lot of near
   by tournament events happen in the same time period. In this
   situation, current version of visualization may place a lot of
   overlapped circles on a small map area, making it very hard to
   distinguish each other. It may be much better if the map can be
   zoomed.  map5.html is a very first step. But currently it's not yet
   done.
 
 * Add transition to the web page. In such way, we can show how then
   ranks of players change over the time.

 * Implement multi filter. For example, we want to support filtering
   by the types of the court.

 * Support head to head comparison of players. A user can select two
   players and we want to show the various comparisons of the two
   players.


## Work split among the members

  * Data preparation: Mainly Shengliang Xu
  * World map: Mainly Haichen Shen
  * Flow map: Mainly Haichen Shen
  * Timeline: Mainly Shengliang Xu

## Questionare

### Roughly how much time did you spend developing your application?

    Shengliang Xu: two weeks.
	Haichen Shen: 1.5 weeks.

### What aspects took the most time?

    Shengliang Xu: Learning D3.js and the plugins, including
  understanding how D3 works, the SVG, and the plugin APIs

	Haichen Shen: Learning D3.js. It took me the most time
	to figure how selection works in D3 when we have the nested
	group and classes.

