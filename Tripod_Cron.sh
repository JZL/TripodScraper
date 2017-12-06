#!/bin/bash
#For Heron, need nodejs path bc need recent version
timeout 3m ~/bin/node index.js >/dev/null

grep -v "!!Nothing To Do!!" cron.output
#if grep --quiet "Nothing To Do" cron.output; then
#    echo exists
#    cat cron.output
#fi
