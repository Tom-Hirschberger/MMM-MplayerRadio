#!/bin/bash
URL=$1
RUN=1
exit_script() {
        echo "Stopping playback"
        xmms2 stop
        xmms2 clear
        RUN=0
}

trap exit_script SIGINT SIGTERM

xmms2 stop
xmms2 clear
xmms2 add $URL
xmms2 play

while [ $RUN -gt 0 ]; do
        echo "Still running"
        sleep 1
done