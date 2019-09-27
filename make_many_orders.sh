# zero padded
#for i in $(seq -f "%05g" 1 1000)
for i in $(seq 1 1000)
do
  python3 make_lags.py orders/order$i.json
done
