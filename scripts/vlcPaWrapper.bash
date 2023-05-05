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
	killall /usr/bin/vlc
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
/usr/bin/cvlc -I dummy "$STREAM"