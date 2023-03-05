#!/bin/bash
PLAYLIST_URL=$1
REMOTE_USER=$2
REMOTE_HOST=$3
CHECK_INTERVAL=$4

ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}"@"${REMOTE_HOST}" "mpc clear; mpc add ${PLAYLIST_URL}; mpc play"

exit_script() {
        echo "Stopping playback"
	ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}"@"${REMOTE_HOST}" "mpc stop"
	exit 0
}

trap exit_script SIGINT SIGTERM

while true; do
	CURRENT=$(ssh -o StrictHostKeyChecking=accept-new "${REMOTE_USER}"@"${REMOTE_HOST}" "mpc current")
        if [ "$CURRENT"	!= "" ]
	then
		sleep "${CHECK_INTERVAL}"
	else
		exit 0
	fi
done
