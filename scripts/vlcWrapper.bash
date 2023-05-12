#!/bin/bash
if [ $# -lt 1 ]
then
	echo "Not enough arguments"
	exit 1
fi

exit_script() {
	if [ "$VLC_PID" != "" ]
	then
		echo "Kill vlc process with pid $VLC_PID"
		kill $VLC_PID
	else
		echo "VLC is stopped already"
	fi
	exit 0
}

trap exit_script exit

STREAM=$1

/usr/bin/vlc -vvv -I dummy "$STREAM" 2>&1 &
sleep 1
VLC_PID=$!
echo "PID is $VLC_PID"

while true; do
	ps -p $VLC_PID > /dev/null
	RUNNING=$?
	if [ $RUNNING -lt 1 ]
	then
		echo "Still playing"
		sleep 1
	else
		echo "VLC stopped"
		VLC_PID=""
		exit 0
	fi
done
