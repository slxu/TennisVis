import sys
import os
import json
import urllib2
import time
import craw
import craw_players
import re

playerOutput = "../../dataset/players/"
playerPhotoOutput = "../../dataset/player_photos/"

photoStartRE = re.compile("playerBioHeadShot")
photoRE = re.compile("src=\"([^ ]+)\"")
nameRE = re.compile("<h1>(.+)</h1>")

def parse_photo_url(contents):
  m = photoStartRE.search(contents)
  if m == None:
    sys.stderr.write("Error: playerBioHeadShot cannot be found")
  else:
    m = photoRE.search(contents,m.end())
    if m == None:
      sys.stderr.write("Error: image src cannot be found")
    else:
      url = "http://www.atpworldtour.com"+m.group(1)
      return url

def parse_player_name(contents):
  m = nameRE.search(contents)
  if m == None:
    sys.stderr.write("Error: name h1 cannot be found")
  else:
    name = m.group(1)
    return name
  
if __name__ == "__main__":
  craw.insure_output(playerPhotoOutput)
  for fname in os.listdir(craw_players.playerOutput):
    with open(craw_players.playerOutput+"/"+fname,"r") as f:
      contents = f.read().decode("utf8").encode("utf8")
      photoURL = parse_photo_url(contents)
      name = parse_player_name(contents)
      #print fname+","+name+","+photoURL
      print photoURL+","+playerPhotoOutput+fname+".jpg"

