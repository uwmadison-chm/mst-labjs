#!/usr/bin/env python

from __future__ import print_function, unicode_literals

import sys
import random
import csv
import json

import logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger()

def convert(in_file, out_file):
    with open(in_file) as csvfile:
        # reader = csv.DictReader(csvfile, dialect="excel-tab")
        # data = dict(reader)
        data = dict(filter(None, csv.reader(csvfile, dialect="excel-tab")))
        with open(out_file, 'w') as jsonfile:
            json.dump(data, jsonfile)

if __name__ == '__main__':
    in_file = sys.argv[1]
    out_file = sys.argv[2]
    convert(in_file, out_file)
