
# MMM-MplayerRadio #

This module plays .m3u playlists with the system `mplayer` instance. It is possible to use other players as well. There are several wrapper included (i.e. for `vlc`).  

Multiple stations are supported and can be switched either by notification or touch control. The currently played station is highlighted. If the radio station provides stream info (current song, studio hotline, etc.) the information will be displayed, too.  
Different stations can be used in different profiles (profile string in configuration).

**Currently `mplayer` has a lot of problems and is not able to play streams properly. Also there is a problem that there is no sound on some devices since Rasperry OS moved to PulsAudio instead auf ALSA (December 2020). To avoid this problems i strongly suggest to use the VLC player instaed. In consequence no stream information will be provided in versions 0.0.X of this module. In version 0.1.X and above stream information will be provided if the `vlcWrapper.bash` is used. There is an description in the configuration section on how to change to the VLC player!**

**If you want to use the volume buttons please make sure to install the <https://github.com/Anonym-tsk/MMM-Volume> module.**

Most of my stations are listed at <http://www.surfmusik.de>. This site provides mostly an m3u-file of the stations for external players. Simple choose the station you like, listen to it in the browser of your choice and right click on the "External Player" link. Copy the link and add it to your configuration.
The logos of the stations can be choosen by url (good resource <https://commons.wikimedia.org/wiki/Category:Radio_station_logos_of_Germany>). If no logo is specified an dummy is used.

Hint: It may be possible to play any songs you like by creating an .m3u file of them and adding the file to local public folder. But i did not test this.

## Screenshots ##

### In Action ###

![alt text](./examples/threeStationsOnePlaying.png "ThreeStations with one playing and volume controls")

![alt text](./examples/threeStationsStopped.png "ThreeStations with stopped state")

## Installation ##

### System ###

#### Mplayer ####

**I suggest to use the `vlcWrapper.bash` instead!**

Make sure you installed mplayer on your system. Simple type the following command

```bash
    mplayer
```

The output should look like

```bash
    MPlayer 1.3.0 (Debian), built with gcc-8 (C) 2000-2016 MPlayer Team
```

If there is something like

```bash
    -bash: mplayer: command not found
```

Install the player with

```bash
    sudo apt update && sudo apt install mplayer
```

#### Asound ####

**DEPRECATED! As of the release of Rasperry OS in December 2020 the audio system has been changed from ALSA to PulseAudio and this configuration is not needed anymore!**
I use an Hifiberry DAC device as audio output. You might need to add an asound.conf to get sound output on the mirror.
This is my file "/etc/asound.conf"

```text
    pcm.!default  {
        type hw card 0
    }
    ctl.!default {
        type hw card 0
    }
```

You can try it without an asound.conf. If you get no sound try adding this one and restart the pi.

### Module ###

```bash
    cd ~/MagicMirror/modules
    git clone https://github.com/Tom-Hirschberger/MMM-MplayerRadio.git
    cd MMM-MplayerRadio
    npm install
```

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
      title: "Bayern 3",
      url: "https://streams.br.de/bayern3_1.m3u",
      logo: "https://upload.wikimedia.org/wikipedia/de/thumb/d/d3/Bayern_3.svg/200px-Bayern_3.svg.png",
     },
     {
      title: "Rock Antenne",
      url: "http://play.rockantenne.de/rockantenne.m3u",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Rock_Antenne_Logo_2017.svg/200px-Rock_Antenne_Logo_2017.svg.png",
     }
    ],
   },
  },
```

### VLC Player instead of Mplayer ###

As mentioned above `mplayer` has a lot of problems to play streams currently. My personal suggestion is to switch to VLC player instead by setting a custom command in the configuration section.
First check if VLC is installed or install it if needed:

```bash
  sudo apt update && sudo apt install -y vlc
```

Basically you only need to add two lines to the configuration (CUSTOM_COMMAND, CUSTOM_COMMAND_ARGS). Make sure to set the path of the wrapper to the path of your installation. It is `./modules/MMM-MplayerRadio/scripts/vlcWrapper.bash` in usual installations but may be different in your case:

```js
  customCommand: "./modules/MMM-MplayerRadio/scripts/vlcWrapper.bash",
  customCommandArgs: ["###URL###"],
```

The example configuration from above then looks like:

```json5
    {
   module: "MMM-MplayerRadio",
   header: "Radio",
   position: "top_center",
   config: {
    customCommand: "./modules/MMM-MplayerRadio/scripts/vlcWrapper.bash",
    customCommandArgs: ["###URL###"],
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
     }
    ],
    displayStationsOnStartup: true
   },
  },
```

**Stream information is only provided if you use version 0.1.X and above of this module!**

If you do want to set the volume of vlc before a stream gets started you can use the `vlcPaWrapper.bash` wrapper do this.
You can set the wrapper either in the general configuration or for a single station.
To use the wrapper you first need to download and compile the `pa_volume` binary which can be found at [https://github.com/rhaas80/pa_volume](https://github.com/rhaas80/pa_volume).

```bash
cd ~/

sudo apt-get install -y make pkg-config libpulse-dev pandoc

git clone https://github.com/rhaas80/pa_volume.git
cd pa_volume/
make

sudo mv pa_volume /usr/local/sbin
sudo chmod a+x /usr/local/sbin/pa_volume
```

After this process should have the binary `pa_volume` in the directory `/usr/local/sbin`.
The first argument for the wrapper call will be the new volume, the second the stream to play.

This example will start the wrapper and plays the "Antenne Bayern" station with a volume of 50%:

```bash
./modules/MMM-MplayerRadio/scripts/vlcPaWrapper.bash 50 "http://play.antenne.de/antenne.m3u"
```

The custom commands configuration then will look something like:

```js
  customCommand: "./modules/MMM-MplayerRadio/scripts/vlcPaWrapper.bash",
  customCommandArgs: ["50", "###URL###"],
```

Both the `vlcWrapper.bash` and `vlcPaWrapper.bash` support adding additonal custom arguments that will be added to the vlc command line.
If you i.e. want vlc to ignore certificate errors while connecting to a https stream you can set the option `--http-no-ssl-verify` like in this example:

```js
  customCommand: "./modules/MMM-MplayerRadio/scripts/vlcWrapper.bash",
  customCommandArgs: ["###URL###","--http-no-ssl-verify"],
```

### XMMS2 ###

If you prefere xmms2 to play the radio streams instead of mplayer you will find an custom script "playRadio.bash" in the scripts folder. There is a example config in the examples directory, too.

### STREAMLINK ###

If you want to listen to a stream which does not send continously you may want to use the streamlinkWrapper.bash script in the scripts directory. It supports auto reconnects. An example config can be found in the examples directory. The first option is the time to wait for the stream to send data. The second option is the time to wait between to reconnect attempts. And the third is the url of the stream.

Make sure to install streamlink i.e. with these commands:

```bash
sudo apt -y update && sudo apt -y install streamlink
```

### HiFiBerryOS ###

There is included a wrapper to control a remote instance of HiFiBerryOS in the scripts directory now.  
Make sure to setup password-less ssh with key authentication to to the host running HiFiBerryOS first (i.e. with this tutorial [https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)).  
**Make sure to use mp3 streams instead of m3u!**

The proper module configuration will look something like (replace "hifiberry.local" with the hostname or ip of the HiFiBerryOS host):

```js
  {
     module: "MMM-MplayerRadio",
     header: "Radio",
     position: "top_center",
     config: {
       customCommand: "./modules/MMM-MplayerRadio/scripts/hifiberryOS.bash",
       customCommandArgs: ["###URL###", "root", "hifiberry.local", "2"],
       stations: [
          {
            title: "Rock Antenne",
            url: "https://stream.rockantenne.de/rockantenne/stream/mp3",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Rock_Antenne_Logo_2017.svg/200px-Rock_Antenne_Logo_2017.svg.png",
          },
       ],
     },
  },
```

In this setup the user `root` is used to connect to HiFiBerryOS (which is the default user of HiFiBerryOS) and the check if the station is still played will run all `2` seconds.

If you want to use the [MMM-Volume](https://github.com/Anonym-tsk/MMM-Volume) module to control the volume you can make use of the build in REST-API with the following configuration (and again replace "hifiberry.local" with the hostname or ip of the HiFiBerryOS host):

```js
  {
    module: "MMM-Volume",
    position: "top_left", // It is meaningless. but you should set.
    config: {
      setVolumeScript: `curl -X POST -H "Content-Type: application/json" -d '{"percent":"#VOLUME#"}' http://hifiberry.local:81/api/volume`,
      getVolumeScript: `curl -sX GET http://hifiberry.local:81/api/volume | grep -oE "[[:digit:]]+\.[[:digit:]]" | grep -oE "^[^\.]+"`,
      usePresetScript: null,
    }
  },
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
