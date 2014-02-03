import sys
import os
import json
import urllib2
import time
import csv

def insure_output(outputDir):
  if not os.path.exists(outputDir):
    os.makedirs(outputDir)

def download(url, outputFile):
  contents=urllib2.urlopen(url).read();
  with open(outputFile, "wb") as outFile:
    outFile.write(contents)

if __name__ == "__main__":
  reader = csv.reader(sys.stdin)
  for row in reader:
    if len(row) !=2:
      sys.stdout.write("Usage: download.py, input is a list of (url,output filename) pairs")
    else:
      insure_output(os.path.dirname(row[1]))
      if not os.path.exists(row[1]):
        download(row[0], row[1])
      else:
        print "File",row[1],"exists. Pass."

  print "Finish all downloads"
