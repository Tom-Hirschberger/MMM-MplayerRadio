#!/bin/bash
STREAM_TIMEOUT=$1
SLEEP_TIME=$2
LINK=$3

STOP=0

exit_script() {
	STOP=1
	killall streamlink
	exit 0
}

trap exit_script exit


while [ $STOP == 0 ] ; do 
	streamlink "httpstream://${LINK}" live -p cvlc --retry-streams $STREAM_TIMEOUT
	CUR_PID=$PID
	sleep $SLEEP_TIME
done
