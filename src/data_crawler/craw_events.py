import sys
import os
import json
import urllib2
import time
import craw_draws
import re


playerBaseURL = "http://www.atpworldtour.com/tennis/players/"
eventOutput = "../../dataset/events/"

tournamentTitleRE = re.compile("tournamentTitle\" href=\"([^>]+)\">([^<]+)</a>")

if __name__ == "__main__":
  for fname in os.listdir(craw_draws.drawOutput):
    with open(craw_draws.drawOutput+fname,"r") as f:
      contents = f.read().decode("utf8").encode("utf8")
      m = tournamentTitleRE.search(contents)
      if m == None:
        sys.stderr.write("Error cannot find tournametTitle in file: "+fname+"\n")
      else:
        url = m.group(1)
        title = m.group(2)
        print url+","+eventOutput+fname

