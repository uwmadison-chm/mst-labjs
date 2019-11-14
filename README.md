# Mnemonic Similarity Task for lab.js

A simple online continuous MST implementation in lab.js,
based on [this PsychoPy repository](https://github.com/celstark/MST) from the Stark lab.

*PLEASE NOTE*, if you are going to use this task you will need to host the 
stimuli images (found in the Stark repository) or use a different CDN. The 
image location can be changed in the "Set up image" script on the Sequence in 
the experiment.

Pseudorandom lag order is based on ppt and session IDs, passed as "PPT" and 
"session" in the querystring.

Stimulus set defaults to 1, but you can pick others by passing "stimulusSet" 
in the querystring.

Lag orders have been built with Nate Vack's `make_lags.py` script, included,
and altered to output JSON. To use your own orderings, load `mst.js` in the 
[lab.js Builder](https://labjs.felixhenninger.com/) and change the 
embedded `orderN.txt` files on the Trial Loop.


## Hosting in Qualtrics

See the [Lab.js documentation on working with Qualtrics](https://labjs.readthedocs.io/en/latest/learn/deploy/3a-qualtrics.html).

Then, when pasting the embed source, change the iframe src to pass participant 
id and session variables like this:

    <iframe
      src="//some-location?PPT=${e://Field/PPTID}&session=${e://Field/session}"
      style="width: 100%; min-height: 600px; border: none;"
    ></iframe>


### Image size

The image stimulus is on two separate "canvas" screens, because of the 
keypress detection and needing to show user feedback after keypress.

To resize how the image displays, change it on both the "Stimulus" and 
"Stimulus after keypress" screens in the [lab.js Builder](https://labjs.felixhenninger.com/).


## Analysis

See the [analysis](analysis/) directory.

It should be as simple as running `unpack.py` on your results.

    cd REPO/analysis
    mv ~/Downloads/qualtrics_results.tsv .
    python3 unpack.py qualtrics_results.tsv

Files will get dumped to `analysis/output`.


## Development

### OrderFiller

order.js has tests in tests/

I had a hard time getting order.js to load in lab.js land,
so I made a variant, order-labjs.js, which is included in the
"static" section of the mst.js template for lab.js

### Tests

To run the javascript tests, do

    npm install
    npm test

### Debugging

To debug, put `debugger;` in the code and then

    npm b

Open Chrome and go to chrome://inspect to connect.

