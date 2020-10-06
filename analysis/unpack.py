import logging
import sys
import csv
import json
import os
import numpy as np

import argparse

csv.field_size_limit(sys.maxsize)

# Some of this is mirrored from the Stark lab's psychopy implementation
# Sorry it's kinda monolithic and ugly, as usual I was in a hurry
global trial_counter

parser = argparse.ArgumentParser()
parser.add_argument("input")
parser.add_argument("--studytest",
        help="Run study/test version instead of continuous",
        action="store_true")
args = parser.parse_args()

with open(args.input, newline='', encoding='utf16') as tsvfile:
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
            stim_set = first['stimulusSet']
            ppt_dir = os.path.join("output", ppt)

            os.makedirs(ppt_dir, exist_ok=True)
            with open(os.path.join(ppt_dir, "metadata.txt"), mode='w') as out:
                out.write(f"PPT: {ppt}\n")
                out.write(f"Session: {first['session']}\n")
                out.write(f"Stimulus set: {stim_set}\n")
                if not args.studytest:
                    out.write(f"Ordering file number: {first['orderNum']}\n")
                out.write(f"User agent: {first['meta']['userAgent']}\n")
                out.write('\n')

            # Stark analysis stuff
            ncorrect = 0
            trial_counter = 0
            TLF_trials = np.zeros(3)
            TLF_response_matrix = np.zeros((3,3))  # Rows = O,(S),N  Cols = T,L,R
            lure_bin_matrix = np.zeros((4,5)) # Rows: O,S,N,NR  Cols=Lure bins
            
            # Load the bin file from json
            with open(f"../lag_difficulty_for_sets/set{stim_set}.json") as set_file:
                set_bins = json.load(set_file)

            with open(os.path.join(ppt_dir, "trials.txt"), mode='w') as out:
                writer = csv.writer(out, delimiter='\t')
                header = [
                    'Trial Number', 'Trial Type', 'Stimulus Number',
                    'Repetition', 'Lag', 'Lure Bin',
                    'Correct Was', 'Participant Response',
                    'Response Time']
                if args.studytest:
                    header.remove('Lag')
                            
                writer.writerow(header)

                for comp in data[1:]:
                    component_name = 'Stimulus'
                    if args.studytest:
                        component_name = 'Trial stimulus'
                    if comp['sender'] == component_name:
                        trial_counter += 1

                        if 'correct_answer' in comp:
                            correctWas = comp['correct_answer']
                        else:
                            correctWas = comp['correctResponse']

                        if 'response' in comp:
                            response = comp['response']
                            try:
                                duration = int(comp['duration'])
                            except:
                                duration = "NA"
                                
                        else:
                            response = "NA"
                            duration = "NA"

                        if response == correctWas:
                            ncorrect += 1

                        # Find the lure bin for difficulty.
                        # Kind of wacky coercion because set_bins is a hash of string -> string
                        lure_bin_index = int(set_bins[str(comp['stimulus_number'])])

                        # Calculating totals for Stark analysis
                        if response == 'old':
                            response_index = 0
                        elif response == 'similar':
                            response_index = 1
                        elif response == 'new':
                            response_index = 2
                        elif response == 'NA':
                            response_index = 3
                        else:
                            raise f"Unknown response: {response}"

                        if comp['trial_type'] == 'repeat' and comp['repetition'] == 'b':
                            trial_type = 0
                        elif comp['trial_type'] == 'lure' and comp['repetition'] == 'b':
                            trial_type = 1
                            # Need to do add one to this response and lure bin
                            lure_bin_matrix[response_index,int(lure_bin_index-1)] += 1
                        else:
                            trial_type = 2
                        if response != 'NA':
                            TLF_trials[trial_type] += 1
                            TLF_response_matrix[response_index,trial_type] += 1

                        output = [
                            comp['trial_number'],
                            comp['trial_type'],
                            comp['stimulus_number'],
                            comp['repetition'],
                            lure_bin_index,
                            correctWas,
                            response,
                            duration]
                        if not args.studytest:
                            output.splice(4, comp['lag'])
                        writer.writerow(output)


            # Again, all this is from the Stark analysis
            with open(os.path.join(ppt_dir, "stats.txt"), mode='w') as log:
                log.write('\nValid responses:\nTargets, {0:.0f}\nlures, {1:.0f}\nfoils, {2:.0f}'.format(
                    TLF_trials[0], TLF_trials[1], TLF_trials[2]))
                log.write('\nCorrected rates\n')
                log.write('\nRateMatrix,Targ,Lure,Foil\n')
                # Fix up any no-response cell here so we don't divide by zero
                TLF_trials[TLF_trials==0.0]=0.00001
                log.write('Old,{0:.2f},{1:.2f},{2:.2f}\n'.format(
                    TLF_response_matrix[0,0] / TLF_trials[0], 
                    TLF_response_matrix[0,1] / TLF_trials[1],
                    TLF_response_matrix[0,2] / TLF_trials[2]))
                log.write('Similar,{0:.2f},{1:.2f},{2:.2f}\n'.format(
                    TLF_response_matrix[1,0] / TLF_trials[0], 
                    TLF_response_matrix[1,1] / TLF_trials[1],
                    TLF_response_matrix[1,2] / TLF_trials[2]))
                log.write('New,{0:.2f},{1:.2f},{2:.2f}\n'.format(
                    TLF_response_matrix[2,0] / TLF_trials[0], 
                    TLF_response_matrix[2,1] / TLF_trials[1],
                    TLF_response_matrix[2,2] / TLF_trials[2]))

                log.write('\nRaw counts')
                log.write('\nRawRespMatrix,Targ,Lure,Foil\n')
                log.write('Old,{0:.0f},{1:.0f},{2:.0f}\n'.format(
                    TLF_response_matrix[0,0], TLF_response_matrix[0,1],TLF_response_matrix[0,2]))
                log.write('Similar,{0:.0f},{1:.0f},{2:.0f}\n'.format(
                    TLF_response_matrix[1,0], TLF_response_matrix[1,1],TLF_response_matrix[1,2]))
                log.write('New,{0:.0f},{1:.0f},{2:.0f}\n'.format(
                    TLF_response_matrix[2,0], TLF_response_matrix[2,1],TLF_response_matrix[2,2]))
                
                log.write('\n\nLureRawRespMatrix,Bin1,Bin2,Bin3,Bin4,Bin5\n')
                log.write('Old,{0:.0f},{1:.0f},{2:.0f},{3:.0f},{4:.0f}\n'.format(
                    lure_bin_matrix[0,0], lure_bin_matrix[0,1], lure_bin_matrix[0,2], lure_bin_matrix[0,3], lure_bin_matrix[0,4]))
                log.write('Similar,{0:.0f},{1:.0f},{2:.0f},{3:.0f},{4:.0f}\n'.format(
                    lure_bin_matrix[1,0], lure_bin_matrix[1,1], lure_bin_matrix[1,2], lure_bin_matrix[1,3], lure_bin_matrix[1,4]))
                log.write('New,{0:.0f},{1:.0f},{2:.0f},{3:.0f},{4:.0f}\n'.format(
                    lure_bin_matrix[2,0], lure_bin_matrix[2,1], lure_bin_matrix[2,2], lure_bin_matrix[2,3], lure_bin_matrix[2,4]))
                log.write('NR,{0:.0f},{1:.0f},{2:.0f},{3:.0f},{4:.0f}\n'.format(
                    lure_bin_matrix[3,0], lure_bin_matrix[3,1], lure_bin_matrix[3,2], lure_bin_matrix[3,3], lure_bin_matrix[3,4]))

                log.write('\nCorrect: {0} Trials sum {1} Trial counter {2}\n'.format(ncorrect, TLF_trials.sum(), trial_counter))

                log.write('\nPercent-correct (corrected),{0:.2}\n'.format(ncorrect / TLF_trials.sum()))
                log.write('Percent-correct (raw),{0:.2}\n'.format(ncorrect / trial_counter))

                hit_rate = TLF_response_matrix[0,0] / TLF_trials[0]
                false_rate = TLF_response_matrix[0,2] / TLF_trials[2]
                log.write('\nCorrected recognition (p(Old|Target)-p(Old|Foil)), {0:.2f}\n'.format(hit_rate - false_rate))

                sim_lure_rate = TLF_response_matrix[1,1] / TLF_trials[1]
                sim_foil_rate = TLF_response_matrix[1,2] / TLF_trials[2]
                log.write('\nLDI,{0:.2f}\n'.format(sim_lure_rate - sim_foil_rate))

