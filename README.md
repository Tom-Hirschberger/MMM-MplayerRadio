
# MMM-MplayerRadio #
This module plays .m3u playlists with the system mplayer instance. Multiple stations are supported and can be switched either by notification or touch control. The privious and next station will be displayed and also the currently playing. If the radio station provides stream info (current song, studio hotline, etc.) the information will be displayed, too.
Different stations can be used in different profiles (profile string in configuration).

Most of my stations are listed at http://www.surfmusik.de. This site provides mostly an m3u-file of the stations for external players. Simple choose the station you like, listen to it in the browser of your choice and right click on the "External Player" link. Copy the link and add it to your configuration.
The logos of the stations can be choosen by url (good resource https://commons.wikimedia.org/wiki/Category:Radio_station_logos_of_Germany). If no logo is specified an dummy is used.

## Screenshots ##
### In Action ###
![alt text](https://github.com/Tom-Hirschberger/MMM-MplayerRadio/raw/master/examples/threeStationsOnePlaying.png "ThreeStations with one playing")
![alt text](https://github.com/Tom-Hirschberger/MMM-MplayerRadio/raw/master/examples/threeStationsStopped.png "ThreeStations with stopped state")
### After Startup ###
![alt text](https://github.com/Tom-Hirschberger/MMM-MplayerRadio/raw/master/examples/initialScreen.png "InitialScreen")


## Installation

### System ###
#### Mplayer ####
Make sure you installed mplayer on your system. Simple type the following command
    mplayer

The output should look like
    MPlayer 1.3.0 (Debian), built with gcc-8 (C) 2000-2016 MPlayer Team

If there is something like
    -bash: mplayer: command not found

Install the player with
    sudo apt update && sudo apt install mplayer

#### Asound ####
I use an Hifiberry DAC device as audio output. You might need to add an asound.conf to get sound output on the mirror.
This is my file "/etc/asound.conf"
    pcm.!default  {
        type hw card 0
    }
    ctl.!default {
        type hw card 0
    }

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
				stations: [
					{
						title: "Antenne.de",
						url: "http://www.surfmusik.de/m3u/antenne-bayern,922.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Antenne-bayern-logo.png",
					},
					{
						title: "Bayern 3",
						url: "http://www.surfmusik.de/m3u/bayern-3,925.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/de/thumb/d/d3/Bayern_3.svg/200px-Bayern_3.svg.png",
					},
					{
						title: "Rock Antenne",
						url: "http://www.surfmusik.de/m3u/rock-antenne,950.m3u",
						logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Rock_Antenne_Logo_2017.svg/200px-Rock_Antenne_Logo_2017.svg.png",
						mplayerCache: 2048,
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

### General ###
| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| stations | An array containing station opjects; Each one needs to have an title and an url; | Array | [] |
| showControls | If you do not want the control bar (prev, play, stop, next) you can hide it by setting this value to false | boolean | true |
| showStations | If you do not want to see your stations but only the initial screen with the controls set this option to false | boolean | true |
| missingLogoUrl | If you do not provide a logo for an station this one is used | String | "./MMM-MplayerRadio/radio-freepnglogos.png" |
| displayStationsOnStartup | If you do not want to see the inital screen (screenshots) but the directly the stations set this option to true | boolean | false |
| changeStationOnProfileChange | Should the station be changed if the profile changes and this station is not suitable for the new profile | boolean | true |
| noInfoIcon | This icon will displayed in the inital screen and if you change to a profile that has no sations assosiated. You can use any iconify icon. | String | "noto:radio" |
| previousIcon | This icon is used in the control section to switch to the previous station. It is an iconify icon, too. | String | "ic-round-skip-previous" |
| nextIcon | This icon is used in the control section to switch to the next station. It is an iconify icon, too. | String | "ic-round-skip-next" |
| stopIcon | This icon is used in the control section if the player is stopped. It is an iconify icon, too. | String | "ic-round-stop" |
| playIcon | This icon is used in the control section if the player is currently playing. It is an iconify icon, too. | String | "ic-round-play-arrow" |
| mplayerPath | To path to the mplayer binary. If you do not know use the "which mplayer" command to find out | String | /usr/bin/mplayer |
| mplayerCache | The mplayer (can) use an cache for web based stations | Integer | 512 |

### Stations ###
| Option  | Description | Mandatory |
| ------- | --- | --- |
| title | The title of the station which will be displayed beside the logo | true |
| url | The url of the .m3u file. If you want to use an local one put it inside the public folder and use an url like "./MMM-MplayerRadio/YOUR_FILE.m3u". | true |
| logo | The url of the logo which should be displayed for this station. If you want to use an local one use an url like "./MMM-MplayerRadio/YOUR_LOGO_FILE". If no logo is specified the configured default logo is used instead | false |
| profiles | If you want this station only be visible/playable in specific profiles add the profiles to this string (i.e. "pageOne pageTwo"). If the string is missing/not set the station can be used in every profile | false |


## Supported Notifications ##
| Notification | Payload | Description |
| ------------ | ------- | ----------- |
| RADIO_PLAY | Either "id" or "title" or nothing | If an "id" or "name" attribute is provied the specific station is played. If nothing is specified a (for the current profile) suitable is been choosen |
| RADIO_STOP | | Stop the current station played |
| RADIO_TOGGLE | | If the radio is currently playing it stops if it is stopped it plays the current seleced station |
| RADIO_NEXT | | Switch to the next station |
| RADIO_PREVIOUS | Switch to the previous station |

    if((notification === "CHANG| D_PROFILE") ||
       (notification === "RADIO_NEXT") ||
       (notification === "RADIO_PREVIOUS") ||
       (notification === "RADIO_PLAY") ||
       (notification === "RADIO_STOP") ||
       (notification === "RADIO_TOGGLE")   