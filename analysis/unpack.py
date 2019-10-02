import logging
import sys
import csv
import json

csv.field_size_limit(sys.maxsize)

with open(sys.argv[1], newline='', encoding='utf16') as tsvfile:
    reader = csv.DictReader(tsvfile, dialect=csv.excel_tab)
    # First two rows out of Qualtrics are header-y stuff
    next(reader)
    next(reader)
    for row in reader:
        stuff = row['labjs-data']
        if not stuff:
            stuff = "{}"
        data = json.loads(stuff)
        if len(data) == 0:
            logging.warning(f'Got row with no data')
        else:
            first = data[0]
            ppt = first['ppt']

            with open(f'output/{ppt}.txt', mode='w') as out:
                out.write(f"PPT: {ppt}")
                out.write(f"Session: {first['session']}")
                out.write(f"Stimulus set: {first['stimulusSet']}")
                out.write(f"Ordering file number: {first['orderNum']}")
                out.write(f"User agent: {first['meta']['userAgent']}")

                for comp in data[1:]:
                    if comp['sender'] == 'Stimulus':
                        if 'correct_answer' in comp:
                            correctWas = comp['correct_answer']
                        else:
                            correctWas = comp['correctResponse']

                        if 'response' in comp:
                            response = comp['response']
                            duration = comp['duration']
                        else:
                            response = "NO RESPONSE"
                            duration = ""

                        print(f"Trial {comp['trial_number']}: {comp['trial_type']}, {comp['stimulus_number']} {comp['repetition']} with lag {comp['lag']}: correct was {correctWas}, ppt entered {response} in {duration}")

