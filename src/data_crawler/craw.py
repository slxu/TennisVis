import sys
import os
import json
import urllib2

baseURL = "http://www.atpworldtour.com/handlers/GetDrawFilter.ajax"

def read_json(url):
  return json.loads(urllib2.urlopen(url).read())

def get_year_list():
  jsonObj=read_json(baseURL)
  return map(lambda x:x["id"], jsonObj["yrlst"])


print get_year_list()
