import sys
import os
import json
import urllib2
import time
import craw_draws
import re


playerBaseURL = "http://www.atpworldtour.com/tennis/players/"
eventOutput = "../../dataset/events/"

tournamentSubTitleRE = re.compile("tournamentSubTitle\">([^-]+)([^<]+)<")
tournamentTitleRE = re.compile("tournamentTitle\"[^>]*>(.+)")
htmlTagRE = re.compile("<[^>]+>")
drawsRE = re.compile("Draw: (.+)")
surfaceRE = re.compile("Surface: (.+)")
prizeMoneyRE = re.compile("Prize Money: (.+)")
#            <p><span>Draw: </span>64</p>
#        
#        <p><span>Surface: </span>Grass</p>
#        <p><span>Prize Money: </span>608,000</p>

# <h3><a class="tournamentTitle" href="/Tennis/Tournaments/London-Queens-Club.aspx">Aegon Championships</a></h3>
#    <p class="tournamentSubTitle">Austria - 01.08.2011-07.08.2011</p>
#    <span class="inlineWrapper">
#        
#            <p><span>Draw: </span>32</p>
#        
#        <p><span>Surface: </span>Clay</p>
#        <p><span>Prize Money: </span>398,250</p>


if __name__ == "__main__":
  for fname in os.listdir(craw_draws.drawOutput):
    year = (int)(fname.split("_")[0])
    title=""
    if year >= 2009:
      with open(craw_draws.drawOutput+fname,"r") as f:
        contents = f.read().decode("utf8").encode("utf8")
        m = tournamentTitleRE.search(contents)
        if m == None:
          sys.stderr.write("Error cannot find tournamentTitle in file: "+fname+"\n")
        else:
          title = m.group(1)
          title = re.sub(htmlTagRE, "", title).strip(" \r\n")

        m = tournamentSubTitleRE.search(contents)
        if m == None:
          sys.stderr.write("Error cannot find tournametSubTitle in file: "+fname+"\n")
        else:
          name = m.group(1).strip(" ")
          dates = m.group(2).strip(" -")
          try:
            draws = re.sub(htmlTagRE,"",drawsRE.search(contents,m.end()).group(1)).strip("\r\n")
          except:
            draws=""
          try:
            surface = re.sub(htmlTagRE,"",surfaceRE.search(contents,m.end()).group(1)).strip("\r\n")
          except:
            surface=""
          try:
            prizeMoney = re.sub(htmlTagRE,"",prizeMoneyRE.search(contents,m.end()).group(1)).strip("\r\n")
          except:
            prizeMoney=""
          print "T"+fname+","+name+","+dates+","+title+","+draws+","+surface+","+prizeMoney

