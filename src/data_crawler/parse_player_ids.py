import sys
import os
import json
import urllib2
import time
import craw_draws
import re


playerRE = re.compile("http://www.atpworldtour.com/tennis/players/([a-zA-Z0-9]+).aspx")

if __name__ == "__main__":
  for fname in os.listdir(craw_draws.webpageDir):
    pos=0
    with open(craw_draws.webpageDir+"/"+fname,"r") as f:
      contents = f.read().decode("utf8").encode("utf8")
      m = playerRE.search(contents)
      while m != None:
        print m.group(1)
        pos=m.end()+1
        m = playerRE.search(contents,pos)

