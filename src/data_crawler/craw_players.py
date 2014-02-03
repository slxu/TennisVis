import sys
import os
import json
import urllib2
import time

playerBaseURL = "http://www.atpworldtour.com/tennis/players/"
playerIDFile = "../../dataset/player_id_list"
playerOutput = "../../dataset/players/"

def load_player_ids():
  result=[]
  with open(playerIDFile,"r") as f:
    for line in f:
      result.append(line.rstrip("\r\n").decode("utf8").encode("utf8"))
  return result

if __name__ == "__main__":
  for player in load_player_ids():
    url = playerBaseURL+player+".aspx"
    filename = str(player)
    print url+","+ playerOutput+filename

