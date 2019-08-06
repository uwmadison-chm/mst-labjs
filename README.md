# Mnemonic Similarity Task for lab.js

A simple online MST implementation in lab.js,
based on [this PsychoPy repository](https://github.com/celstark/MST) from the Stark lab.

Pseudorandom lag order is based on ppt and session IDs.


## Hosting in Qualtrics

See the [Lab.js documentation on working with Qualtrics](https://labjs.readthedocs.io/en/latest/learn/deploy/3a-qualtrics.html).


## Image size

The image stimulus is on two separate "canvas" screens, because of the 
keypress detection and needing to show user feedback after keypress.

To resize the image, change it on both the "Stimulus" and "Stimulus after 
keypress" screens in the [lab.js Builder](https://labjs.felixhenninger.com/).


## TODO

- document how to pass in PPT id and session ID
- Confirm we store:
    trial #, stim info, type_code (based on python), condition, lag, LBin (??), time, start time, correct, response time
- Embed 1000 (or whatever) lag sets
- Figure out what all the "bin" stuff is for

