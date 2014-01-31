import sys
import os
import json
import urllib2
import time

baseURL = "http://www.atpworldtour.com/handlers/GetDrawFilter.ajax"
drawURL = "http://www.atpworldtour.com/Share/Event-Draws.aspx"
outputFolder = "../../dataset"

def insure_output(outputDir):
  if not os.path.exists(outputDir):
    os.makedirs(outputDir)

def download(url, outDir, filename):
  contents=urllib2.urlopen(url).read();
  with open(outDir+"/"+filename, "wb") as outFile:
    outFile.write(contents)

def read_json(url):
  return json.loads(urllib2.urlopen(url).read())

def get_year_list():
  jsonObj=read_json(baseURL)
  return map(lambda x:x["id"], jsonObj["yrlst"])

def get_events(year):
  jsonObj=read_json(baseURL + "?Year=" + str(year) + "&Draw=ms")
  return jsonObj["evlst"]



insure_output(outputFolder)
for year in get_year_list():
  events = get_events(year)
  for event in events:
    eventID = event["id"]
    eventName = event["lbl"].encode('utf-8')
    filename = str(year)+"_"+str(eventID)
    if os.path.exists(outputFolder+"/"+filename):
      print year,eventID,eventName,"exists"
    else:
      print "Downloading",year,eventName
      try:
        url=drawURL + "?Year=" + str(year) + "&EventId=" + str(eventID) + "&Draw=ms"
        download(url, outputFolder, filename)
      except:
        sys.stderr.write("Error occured: "+str(year)+","+str(eventID)+","+str(eventName))
      time.sleep(1)

print "Finish all downloads"
