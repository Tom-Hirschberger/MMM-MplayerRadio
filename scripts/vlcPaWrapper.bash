#!/bin/bash
#You need https://github.com/rhaas80/pa_volume compiled and moved to the same directory as this script to get this running:
#sudo apt-get install -y make pkg-config libpulse-dev pandoc
#git clone https://github.com/rhaas80/pa_volume.git
#cd pa_volume/
#make
#mv pa_volume/pa_volume .
#
if [ $# -lt 2 ]
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

NEW_VOLUME=$1
STREAM=$2
IDENTIFIER="video"
FILE_PATH=`readlink -f $0`
CUR_DIR=`dirname $FILE_PATH`
PA_VOLUME="$CUR_DIR/pa_volume"

"$PA_VOLUME" "$IDENTIFIER" "$NEW_VOLUME"
/usr/bin/vlc -I dummy "$STREAM" &
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
