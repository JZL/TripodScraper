#!/bin/bash
timeout 3m node index.js >/dev/null

grep -v "!!Nothing To Do!!" cron.output
#if grep --quiet "Nothing To Do" cron.output; then
#    echo exists
#    cat cron.output
#fi
