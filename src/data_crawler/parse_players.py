import sys
import os
import json
import urllib2
import time
import craw_players
import re

playerOutput = "../../dataset/players/"

nameRE = re.compile("<h1>(.+)</h1>")
playerBioInfoListRE = re.compile("id=\"playerBioInfoList\"");
ageRE = re.compile("<span>Age:</span>([^<]*)</li>")
birthplaceRE = re.compile("<span>Birthplace:</span>([^<]*)</li>")
residenceRE = re.compile("<span>Residence:</span>([^<]*)</li>")
heightRE = re.compile("<span>Height:</span>([^<]*)</li>")
weightRE = re.compile("<span>Weight:</span>([^<]*)</li>")
playsRE = re.compile("<span>Plays:</span>([^<]*)</li>")
turnedRE = re.compile("<span>Turned Pro:</span>([^<]*)</li>")
coachRE = re.compile("<span>Coach:</span>([^<]*)</li>")

#<ul id="playerBioInfoList">
#		    
#		    <li><span>Age:</span> 32 (08.08.1981)</li>
#		    
#		    <li><span>Birthplace:</span> Basel, Switzerland</li>
#		    <li><span>Residence:</span> Bottmingen, Switzerland</li>
#		    <li><span>Height:</span> 6'1" (185 cm)</li>
#		    <li><span>Weight:</span> 187 lbs (85 kg)</li>
#		    <li><span>Plays:</span> Right-handed</li>
#		    <li><span>Turned Pro:</span> 1998</li>
#		    <li><span>Coach:</span> Severin Luthi and Stefan Edberg</li>
#		    <li><span>Website:</span> <a href="http://www.rogerfederer.com" target="_blank">http://www.rogerfederer.com</a></li>
#</ul>

def parse_player_name(contents):
  m = nameRE.search(contents)
  if m == None:
    sys.stderr.write("Error: name h1 cannot be found")
  else:
    name = m.group(1)
    return name
  
def default_empty(m):
  if m is None:
    return ""
  else:
    return "\""+m.group(1).strip("\r\n\t ").replace('"','\\"')+"\"";

if __name__ == "__main__":
  print "playerID,name,age,birthplace,residence,height,weight,plays,turned,coach"
  for playerID in os.listdir(craw_players.playerOutput):
    with open(craw_players.playerOutput+"/"+playerID,"r") as f:
      contents = f.read().decode("utf8").encode("utf8")
      name = parse_player_name(contents)
      m = playerBioInfoListRE.search(contents)
      if m == None:
        sys.stderr.write("Error: no bio info found")
      else:
        age = default_empty(ageRE.search(contents, m.end()));
        birthplace = default_empty(birthplaceRE.search(contents,m.end()));
        residence = default_empty(residenceRE.search(contents,m.end()));
        height = default_empty(heightRE.search(contents,m.end()));
        weight = default_empty(weightRE.search(contents,m.end()));
        plays = default_empty(playsRE.search(contents,m.end()));
        turned = default_empty(turnedRE.search(contents,m.end()));
        coach = default_empty(coachRE.search(contents,m.end()));

        print playerID+","+"\""+name+"\""+","+age+","+birthplace+","+residence+","+height+","+weight+","+plays+","+turned+","+coach

