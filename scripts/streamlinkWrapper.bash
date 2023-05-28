#!/bin/bash
STREAM_TIMEOUT=$1
SLEEP_TIME=$2
LINK=$3

if [ $# -lt 3 ]
then
	echo "Not enough arguments"
	exit 1
fi

ADD_ARG_CNT=$(($#-3))
if [ ${ADD_ARG_CNT} -gt 0 ]
then
	ADD_OPTS=${@:4:$ADD_ARG_CNT}
else
	ADD_OPTS=""
fi

STOP=0

exit_script() {
	STOP=1
	killall streamlink
	exit 0
}

trap exit_script exit


while [ $STOP == 0 ] ; do 
	streamlink "httpstream://${LINK}" live -p cvlc --retry-streams $STREAM_TIMEOUT ${ADD_OPTS}
	sleep $SLEEP_TIME
done
