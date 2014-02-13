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

    An explanation of changes between the storyboard and the final implementation.
    The development process–include a breakdown of how the work was split among the group members. Include a commentary on the development process, including answers to the following questions: Roughly how much time did you spend developing your application? What aspects took the most time?
    The source code for your application. Please ensure that the software submitted is in working order. If any special instructions are needed for building or running your software, please include them in the writeup too.


