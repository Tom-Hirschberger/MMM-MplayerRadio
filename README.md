
# MMM-MplayerRadio #
This module plays .m3u playlists with the system mplayer instance. Multiple stations are supported and can be switched either by notification or touch control. The privious and next station will be displayed and also the currently playing. If the radio station provides stream info (current song, studio hotline, etc.) the information will be displayed, too.
Different stations can be used in different profiles (profile string in configuration).

Most of my stations are listed at http://www.surfmusik.de. This site provides mostly an m3u-file of the stations for external players. Simple choose the station you like, listen to it in the browser of your choice and right click on the "External Player" link. Copy the link and add it to your configuration.
The logos of the stations can be choosen by url (good resource https://commons.wikimedia.org/wiki/Category:Radio_station_logos_of_Germany). If no logo is specified an dummy is used.

## Screenshots ##


## Installation
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-MplayerRadio.git
    cd MMM-MplayerRadio
    npm install


## Configuration ##


| Option  | Description | Type | Default |
| ------- | --- | --- | --- |


## Supported Notifications ##
| Notification | Payload | Description |
| ------------ | ------- | ----------- |
