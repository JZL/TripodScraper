#!/bin/bash
#For Heron, need nodejs path bc need recent version
cd ~/CRON/TripodScraper/
# TODO: If really fails, doesn't kill browser
#ps aux|grep jzl|grep chrom|less -S|awk '{print $2}'|xargs kill

timeout 3m ~/bin/node index.js >/dev/null

if [ $? -ge 124 ]; then 
        echo "HAD TO KILL CHECK `hostname` for zombie chrome processes"
fi



ps aux|grep chrom|grep TripodScraper
grep -v "!!Nothing To Do!!" cron.output

# Clear cron output after done because is misleading when debugging but want to
# keep around

echo "INVALID" > cron.output

#if grep --quiet "Nothing To Do" cron.output; then
#    echo exists
#    cat cron.output
#fi

#For testing `watch` to verify is running
date >> cron.test
