# Mnemonic Similarity Task for lab.js

A simple online MST implementation in lab.js,
based on [this PsychoPy repository](https://github.com/celstark/MST) from the Stark lab.

Pseudorandom lag order is based on ppt and session IDs, passed as "PPT" and 
"Session" in the querystring.

Lag orders have been built with Nate Vack's `make_lags.py` script, included,
and altered to output JSON. To use your own orderings, load `mst.js` in the 
[lab.js Builder](https://labjs.felixhenninger.com/) and change the 
embedded `orderN.txt` files on the Trial Loop.


## Hosting in Qualtrics

See the [Lab.js documentation on working with Qualtrics](https://labjs.readthedocs.io/en/latest/learn/deploy/3a-qualtrics.html).

Then, when pasting the embed source, change the iframe src to pass PPT and 
session variables like this:

    <iframe
      src="//some-location?PPT=${e://Field/PPT}&session=${e://Field/Session}"
      style="width: 100%; min-height: 600px; border: none;"
    ></iframe>


## Image size

The image stimulus is on two separate "canvas" screens, because of the 
keypress detection and needing to show user feedback after keypress.

To resize how the image displays, change it on both the "Stimulus" and 
"Stimulus after keypress" screens in the [lab.js Builder](https://labjs.felixhenninger.com/).


## TODO

- Confirm we store:
    PPT, session #, trial #, stim info, type_code (based on python), condition, lag, LBin (??), time, start time, correct, response time
- Embed 1000 (or whatever) lag sets
- Figure out what all the "bin" stuff is for

