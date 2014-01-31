import sys
import os
import json
import urllib2
import time
import craw

eventMap = {}
for year in craw.get_year_list():
  events = craw.get_events(year)
  for event in events:
    eventID = event["id"]
    eventName = event["lbl"].encode('utf-8')
    compound = str(year)+","+str(eventID)+","+str(eventName)
    eventMap[compound]=compound

for compound in eventMap:
  print compound
