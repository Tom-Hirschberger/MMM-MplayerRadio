
# MMM-MplayerRadio #
This module plays .m3u playlists with the system mplayer instance. Multiple stations are supported and can be switched either by notification or touch control. The currently played station is highlighted. If the radio station provides stream info (current song, studio hotline, etc.) the information will be displayed, too.
Different stations can be used in different profiles (profile string in configuration).

**⚠️Currently mplayer has a lot of problems and is not able to play streams properly. Also there is a problem that there is no sound on some devices since Rasperry OS moved to PulsAudio instead auf ALSA (December 2020). To avoid this problems i strongly suggest to use the VLC player instaed. In consequence no stream information will be provided. There is an description in the configuration section on how to change to the VLC player!⚠️**

**If you want to use the volume buttons please make sure to install the https://github.com/Anonym-tsk/MMM-Volume module.**

Most of my stations are listed at http://www.surfmusik.de. This site provides mostly an m3u-file of the stations for external players. Simple choose the station you like, listen to it in the browser of your choice and right click on the "External Player" link. Copy the link and add it to your configuration.
The logos of the stations can be choosen by url (good resource https://commons.wikimedia.org/wiki/Category:Radio_station_logos_of_Germany). If no logo is specified an dummy is used.

Hint: It may be possible to play any songs you like by creating an .m3u file of them and adding the file to local public folder. But i did not test this.

## Screenshots ##
### In Action ###
![alt text](https://github.com/Tom-Hirschberger/MMM-MplayerRadio/raw/master/examples/threeStationsOnePlaying.png "ThreeStations with one playing and volume controls")

![alt text](https://github.com/Tom-Hirschberger/MMM-MplayerRadio/raw/master/examples/threeStationsStopped.png "ThreeStations with stopped state")

## Installation

### System ###
#### Mplayer ####
Make sure you installed mplayer on your system. Simple type the following command
```
    mplayer
```
The output should look like
```
    MPlayer 1.3.0 (Debian), built with gcc-8 (C) 2000-2016 MPlayer Team
```
If there is something like
```
    -bash: mplayer: command not found
```

Install the player with
```
    sudo apt update && sudo apt install mplayer
```

#### Asound ####
**DEPRECATED! As of the release of Rasperry OS in December 2020 the audio system has been changed from ALSA to PulseAudio and this configuration is not needed anymore!**
I use an Hifiberry DAC device as audio output. You might need to add an asound.conf to get sound output on the mirror.
This is my file "/etc/asound.conf"
```
    pcm.!default  {
        type hw card 0
    }
    ctl.!default {
        type hw card 0
    }
```
You can try it without an asound.conf. If you get no sound try adding this one and restart the pi.


### Module ###
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-MplayerRadio.git
    cd MMM-MplayerRadio
    npm install


## Configuration ##
```json5
    {
			module: "MMM-MplayerRadio",
			header: "Radio",
			position: "top_center",
			config: {
				//autoplay: 0,
				stations: [
					{
						title: "Antenne.de",
						url: "http://play.antenne.de/antenne.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Antenne-bayern-logo.png",
					},
					{
						title: "Rock Antenne",
						url: "http://play.rockantenne.de/rockantenne.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Rock_Antenne_Logo_2017.svg/200px-Rock_Antenne_Logo_2017.svg.png",
					},
					{
						title: "Radio Gong",
						url: "http://www.surfmusik.de/m3u/gong-96-3-muenchen,2021.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Radio_Gong_96.3_Logo.png",
					}
				],
			},
		},
```

### VLC Player instead of Mplayer ###
As mention above Mplayer has a lot of problems to play streams currently. My personal suggestion is to switch to VLC player instead by setting a custom command in the configuration section.
First check if VLC is installed or install it if needed:
```
  sudo apt update && sudo apt install -y vlc
```

Basically you only need to add two lines to the configuration (CUSTOM_COMMAND, CUSTOM_COMMAND_ARGS):
```
  customCommand: "/usr/bin/vlc",
  customCommandArgs: ["-I","dummy","###URL###"],
```

The example configuration from above then looks like:
```json5
    {
			module: "MMM-MplayerRadio",
			header: "Radio",
			position: "top_center",
			config: {
				customCommand: "/usr/bin/vlc",
  				customCommandArgs: ["-I","dummy","###URL###"],
				//autoplay: 0,
				stations: [
					{
						title: "Antenne.de",
						url: "http://play.antenne.de/antenne.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Antenne-bayern-logo.png",
					},
					{
						title: "Bayern 3",
						url: "https://streams.br.de/bayern3_1.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/de/thumb/d/d3/Bayern_3.svg/200px-Bayern_3.svg.png",
					},
					{
						title: "Rock Antenne",
						url: "http://play.rockantenne.de/rockantenne.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Rock_Antenne_Logo_2017.svg/200px-Rock_Antenne_Logo_2017.svg.png",
					},
					{
						title: "Radio Gong",
						url: "http://www.surfmusik.de/m3u/gong-96-3-muenchen,2021.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/7/78/Radio_Gong_96.3_Logo.png",
					}
				],
				displayStationsOnStartup: true
			},
		},
```

**In consequence no stream information is provided because VLC does not evaluate the information send by the stations!**

### XMMS2 ###
If you prefere xmms2 to play the radio streams instead of mplayer you will find an custom script "playRadio.bash" in the scripts folder. There is a example config in the examples directory, too.

### STREAMLINK ###
If you want to listen to a stream which does not send continously you may want to use the streamlinkWrapper.bash script in the scripts directory. It supports auto reconnects. An example config can be found in the examples directory. The first option is the time to wait for the stream to send data. The second option is the time to wait between to reconnect attempts. And the third is the url of the stream.

Make sure to install streamlink i.e. with these commands:
```
sudo apt -y update && sudo apt -y install streamlink
```

### General ###
| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| autoplay | If you like to play a station automatically after the module starts simply specify its index (starting with 0) here | Integer | null |
| initStation | If this value is provided instead of the station with index 1 the station with this index will be selected at the start (but not played as with autplay) | Integer | null |
| stations | An array containing station opjects; Each one needs to have an title and an url; | Array | [] |
| showStations | If you do not want to see your stations but only the initial screen with the controls set this option to false | boolean | true |
| showStreamInfo | If you do not want to see the information about the current running stream (if provided) you can change this option to false | boolean | true |
| showControls | If you do not want the control bar (prev, play, stop, next) you can hide it by setting this value to false | boolean | true |
| showVolControls | If you do not want the volume up/down buttons to be visible in the control bar you can hide them by setting this value to false | boolean | true |
| showLogos | Should the logos of the stations be displayed? | boolean | true |
| showTitles | Should the titles of the stations be displayed? | boolean | true |
| stationsBeforeAndAfter | How many stations should be displayed before and after the current active one. This value is only used if "scrollableStations" is set to false. | Integer | 1 |
| scrollableStations | Should the list of stations be scrollable. If not the count of stations before and after will be displayed. | boolean | false |
| scrollToActiveStation | Should the position of the station list be adjusted to be the current active station be the first element after a station change | true |
| missingLogoUrl | If you do not provide a logo for an station this one is used | String | "./MMM-MplayerRadio/radio-freepnglogos.png" |
| stopOnSuspend | Should the player be stopped if the module gets hidden (i.e. because the page changes)? | boolean | false |
| changeStationOnProfileChange | Should the station be changed if the profile changes and this station is not suitable for the new profile | boolean | true |
| noInfoIcon | This icon will displayed in the inital screen and if you change to a profile that has no sations assosiated. You can use any iconify icon. | String | "noto:radio" |
| previousIcon | This icon is used in the control section to switch to the previous station. It is an iconify icon, too. | String | "ic-round-skip-previous" |
| nextIcon | This icon is used in the control section to switch to the next station. It is an iconify icon, too. | String | "ic-round-skip-next" |
| stopIcon | This icon is used in the control section if the player is stopped. It is an iconify icon, too. | String | "ic-round-stop" |
| playIcon | This icon is used in the control section if the player is currently playing. It is an iconify icon, too. | String | "ic-round-play-arrow" |
| volDownIcon | This icon is used in the control section to decrease the volume. It is an iconify icon, too. | String | "bi-volume-down-fill" |
| volUpIcon | This icon is used in the control section to increase the volume. It is an iconify icon, too. | String | "bi-volume-down-fill" |
| mplayerPath | To path to the mplayer binary. If you do not know use the "which mplayer" command to find out | String | /usr/bin/mplayer |
| mplayerCache | The mplayer (can) use an cache for web based stations | Integer | 512 |
| animationSpeed | If the station changes or the stream info will be updated the change will be animated within this speed (ms) | Integer | 500 |
| customCommand | If you do not want to use mplayer you can run any other script you like. Only condition is that the scripts needs to run as long as the station is active | String | null |
| customCommandArgs | You can pass as many arguments to the customCommand as you like. "###URL###" will be replaced with the url of the station | Array | [] |

The custom commands either can be configured in the global module configuration and then will be used for all stations or it can be configured for each station individually!

### Stations ###
| Option  | Description | Mandatory |
| ------- | --- | --- |
| title | The title of the station which will be displayed beside the logo | true |
| url | The url of the .m3u file. If you want to use an local one put it inside the public folder and use an url like "./MMM-MplayerRadio/YOUR_FILE.m3u". | true |
| logo | The url of the logo which should be displayed for this station. If you want to use an local one use an url like "./MMM-MplayerRadio/YOUR_LOGO_FILE". If no logo is specified the configured default logo is used instead | false |
| mplayerCache | If you like you can provide an different cache size for specific stations. i.e. because the stream is very slow or buggy | false |
| profiles | If you want this station only be visible/playable in specific profiles add the profiles to this string (i.e. "pageOne pageTwo"). If the string is missing/not set the station can be used in every profile | false |
| customCommand | If you like to run an different command special for this station you can pass it with this variable. The only condition is that the command needs to run as long as the station is active. | false |
| customCommandArgs | If you use the customCommand for this station you can pass as many argument to it as you like in this array. "###URL###" will be replaced with the url of the station | false |


## Supported Notifications ##
| Notification | Payload | Description |
| ------------ | ------- | ----------- |
| RADIO_PLAY | Either "id" or "title" or nothing | If an "id" or "name" attribute is provied the specific station is played. If nothing is specified a (for the current profile) suitable is been choosen |
| RADIO_STOP | | Stop the current station played |
| RADIO_TOGGLE | | If the radio is currently playing it stops if it is stopped it plays the current seleced station |
| RADIO_NEXT | | Switch to the next station |
| RADIO_PREVIOUS | Switch to the previous station |
