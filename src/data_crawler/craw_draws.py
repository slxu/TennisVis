import sys
import os
import json
import urllib2
import time

drawJsonURL = "http://www.atpworldtour.com/handlers/GetDrawFilter.ajax"
drawURL = "http://www.atpworldtour.com/Share/Event-Draws.aspx"
drawOutput = "../../dataset/draws/"

def insure_output(outputDir):
  if not os.path.exists(outputDir):
    os.makedirs(outputDir)

def read_json(url):
  return json.loads(urllib2.urlopen(url).read())

def get_year_list():
  jsonObj=read_json(drawJsonURL)
  return map(lambda x:x["id"], jsonObj["yrlst"])

def get_events(year):
  jsonObj=read_json(drawJsonURL + "?Year=" + str(year) + "&Draw=ms")
  return jsonObj["evlst"]



if __name__ == "__main__":
  insure_output(drawOutput)
  for year in get_year_list():
    events = get_events(year)
    for event in events:
      eventID = event["id"]
      eventName = event["lbl"].encode('utf-8')
      filename = str(year)+"_"+str(eventID)
      filePath = drawOutput+filename
      url=drawURL + "?Year=" + str(year) + "&EventId=" + str(eventID) + "&Draw=ms"
      print url+","+filePath

