import sys
import os
import json
import urllib2
import time
import craw_draws
import parse_player_ids
import csv

points={"2000":[2000,1200,720,360,180,90,45,10,25],
"1000":[1000,600,360,180,90,45,25,10],
"500":[500,300,180,90,45,20,10],
"250":[250,150,90,45,20,12],
"1500":[],
"Olympics":[750,450,340,135,70,35,5]}

types={1536:"1000",
1720:"250",
2276:"250",
301:"250",
306:"250",
308:"250",
311:"250",
314:"250",
315:"250",
316:"250",
319:"250",
321:"250",
328:"500",
329:"500",
3348:"250",
337:"250",
338:"250",
339:"250",
341:"250",
352:"1000",
360:"250",
375:"250",
402:"500",
403:"1000",
404:"1000",
407:"500",
410:"1000",
414:"500",
416:"1000",
418:"500",
419:"250",
421:"1000",
422:"1000",
423:"250",
424:"250",
425:"500",
429:"250",
438:"250",
439:"250",
440:"250",
451:"250",
468:"250",
495:"500",
496:"250",
499:"250",
500:"250",
5012:"250",
5014:"1000",
505:"250",
5053:"250",
506:"250",
520:"2000",
533:"250",
540:"2000",
560:"2000",
568:"250",
573:"500",
580:"2000",
6003:"250",
605:"1500",
6116:"250",
6120:"250",
615:"250",
6242:"250",
6710:"250",
6718:"250",
717:"250",
741:"250",
747:"500",
773:"250",
807:"500",
891:"250",
96:"Olympics",
6967:"250",
6932:"250"}

if __name__ == "__main__":
  eventDates = {}
  events = csv.reader(open("../../dataset/event_list_since_2009","rb")) 
  for row in events:
    dates = row[4].strip(" \t\r\n").split("-")
    eID = row[0].strip(" \t\r\n")
    try:
      eventDates[eID] = (dates[0].strip(" \t\r\n"), dates[1].strip(" \t\r\n"))
    except:
      print dates
      sys.exit(0)
  for fname in os.listdir(craw_draws.drawOutput):
    playerRound={}
    tmp=fname.split("_")
    year = (int)(tmp[0])
    eType = (int)(tmp[1])
    title=""
    if year >= 2009:
      pointList = points[types[eType]]
      with open(craw_draws.drawOutput+fname,"r") as f:
        contents = f.read().decode("utf8").encode("utf8")
        m = parse_player_ids.playerRE.search(contents)
        maxRound=0;
        while m != None:
          playerID = m.group(1)
          if playerRound.get(playerID) is None:
            playerRound[playerID] = 1
          else:
            playerRound[playerID]+=1
          if (maxRound<playerRound[playerID]):
            maxRound = playerRound[playerID]

          pos=m.end()+1
          m = parse_player_ids.playerRE.search(contents,pos)
        #sys.stdout.write( ",\""+fname+"\":[")
        #first=True
        #for k in playerRound:
        #  pointIdx = maxRound-playerRound[k]
        #  if pointIdx < len(pointList):
        #    if first:
        #      print "\""+str(k)+"\":"+str(pointList[pointIdx]),
        #      first=False
        #    else:
        #      print ",\""+str(k)+"\":"+str(pointList[pointIdx]),
        #sys.stdout.write( "]\n")

        for player in playerRound:
          pointIdx = maxRound-playerRound[player]
          if pointIdx < len(pointList):
            sys.stdout.write(eventDates[fname][0])
            sys.stdout.write(',')
            sys.stdout.write(eventDates[fname][1])
            sys.stdout.write(',')
            sys.stdout.write(fname)
            sys.stdout.write(',')
            sys.stdout.write(player)
            sys.stdout.write(',')
            sys.stdout.write(str(pointList[pointIdx]))
            sys.stdout.write('\n')

          
