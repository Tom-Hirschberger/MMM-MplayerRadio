/* Magic Mirror
 * Module: MplayerRadio
 *
 * By Tom Hirschberger
 * MIT Licensed.
 */
const NodeHelper = require('node_helper')
const spawn = require('child_process').spawn
module.exports = NodeHelper.create({

  start: function () {
    this.started = false
    this.curStationIndex = 0;
    this.curStationProcess = null
    this.inStreamInfo = false
    this.curStreamInfo = "&nbsp;"
    this.playing = false
	this.breakOffFirstLine = /\r?\n/
  },

  filterStdoutDataDumpsToTextLines: function (callback){ //returns a function that takes chunks of stdin data, aggregates it, and passes lines one by one through to callback, all as soon as it gets them.
	const self = this
    var acc = ''
    return function(data){
        var splitted = data.toString().split(self.breakOffFirstLine)
        var inTactLines = splitted.slice(0, splitted.length-1)
        inTactLines[0] = acc+inTactLines[0] //if there was a partial, unended line in the previous dump, it is completed by the first section.
        acc = splitted[splitted.length-1] //if there is a partial, unended line in this dump, store it to be completed by the next (we assume there will be a terminating newline at some point. This is, generally, a safe assumption.)
        for(var i=0; i<inTactLines.length; ++i){
            callback(inTactLines[i])
        }
    }
  },

  playStation: async function(stationId = null){
    const self = this
    self.inStreamInfo = false
    self.curStreamInfo = "&nbsp;"

    if(stationId !== null){
      await self.stopStation(false)
	  self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
		curStationIndex: self.curStationIndex,
		curStreamInfo: self.curStreamInfo
	  })
      self.curStationIndex = stationId

      if((self.config.customCommand) || (self.config.stations[self.curStationIndex].customCommand)){
        let curCmd = self.config.customCommand
        if(typeof self.config.stations[self.curStationIndex].customCommand !== "undefined"){
          curCmd = self.config.stations[self.curStationIndex].customCommand
        }
        let curArgs = []
        let curConfigArgs = self.config.customCommandArgs
        if(typeof self.config.stations[self.curStationIndex].customCommandArgs !== "undefined"){
          curConfigArgs = self.config.stations[self.curStationIndex].customCommandArgs
        }

        for(let curIdx = 0; curIdx < curConfigArgs.length; curIdx++){
          console.log("Checking arg: "+curIdx+" "+curConfigArgs[curIdx])
          if(curConfigArgs[curIdx] === "###URL###"){
            curArgs[curIdx] = self.config.stations[self.curStationIndex].url
          } else {
            curArgs[curIdx] = curConfigArgs[curIdx]
          }
        }

        console.log("Running "+curCmd+ " with args: "+JSON.stringify(curArgs))

        self.curStationProcess = spawn(curCmd,
          args = curArgs,
          options = {
              shell: false,
              windowsHide: true
            }
          )

        self.playing = true

        self.curStationProcess.stdout.on('data', self.filterStdoutDataDumpsToTextLines(function(dataString){
			if(dataString.indexOf("New Icy-Title=") > -1){
				self.curStreamInfo = dataString.substring(dataString.indexOf("New Icy-Title=")+14)
				self.inStreamInfo = false
				self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
					curStationIndex: self.curStationIndex,
					curStreamInfo: self.curStreamInfo
				})
			}
		}) )

        self.curStationProcess.on("close", (err) =>{
          if(err !== 1){
            self.sendSocketNotification("RADIO_STOPPED", {
              curStationIndex: self.curStationIndex,
            })
          }
        })

        self.sendSocketNotification("RADIO_PLAYING",{
          curStationIndex: self.curStationIndex,
          curStreamInfo: self.curStreamInfo
        })
      } else {
        var mplayerCache = self.config.mplayerCache

        if(self.config.stations[self.curStationIndex].mplayerCache){
          mplayerCache = self.config.stations[self.curStationIndex].mplayerCache
        }

        if(self.config.stations[self.curStationIndex].url.endsWith(".mp3")) {
          self.curStationProcess = spawn(self.config.mplayerPath,
            args = [self.config.stations[self.curStationIndex].url,
                    "-msglevel", "all=4",
            ],
            options = {
                shell: false,
                windowsHide: true
              }
          )
        } else {
          self.curStationProcess = spawn(self.config.mplayerPath,
                args = ["-playlist", self.config.stations[self.curStationIndex].url,
                        "-msglevel", "all=4",
                        "-cache", mplayerCache
                ],
                options = {
                    shell: false,
                    windowsHide: true
                  }
                )
        }

        self.playing = true
        self.curStationProcess.on("close", (err) =>{
          if(err !== 1){
            self.sendSocketNotification("RADIO_STOPPED", {
              curStationIndex: self.curStationIndex,
            })
          }
        })

        self.sendSocketNotification("RADIO_PLAYING",{
          curStationIndex: self.curStationIndex,
          curStreamInfo: self.curStreamInfo
        })

        self.curStationProcess.stdout.on("data", (data) =>{
          var dataString = data.toString()
          if(self.inStreamInfo){
            if(data.indexOf("'") > -1){
              self.curStreamInfo += data.substring(0, data.indexOf("'"))
              self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
                curStationIndex: self.curStationIndex,
                curStreamInfo: self.curStreamInfo
              })
            } else {
              self.curStreamInfo = "&nbsp;"
              self.inStreamInfo = false
              self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
                curStationIndex: self.curStationIndex,
                curStreamInfo: self.curStreamInfo
              })
            }
          } else {
            if(dataString.indexOf("StreamTitle='") > -1){
              self.curStreamInfo = dataString.substring(dataString.indexOf("StreamTitle='")+13)
              if(self.curStreamInfo.indexOf("'") > -1){
                self.inStreamInfo = false
                self.curStreamInfo = self.curStreamInfo.substring(0, self.curStreamInfo.indexOf("'"))
                self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
                  curStationIndex: self.curStationIndex,
                  curStreamInfo: self.curStreamInfo
                })
              } else {
                self.inStreamInfo = true
              }
            }
          }
        })
      }
    } else {
      self.stopStation(true)
    }
  },

  sleep: function (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  stopStation: async function(sendStatus=true){
    const self = this
    self.playing = false
    self.inStreamInfo = false
    self.curStreamInfo = "&nbsp;"
    if(self.curStationProcess){
      console.log("Killing old station process")
      let maxWait = 5000
      let interval = 500
      let stillWait = true

      if(!sendStatus){
        self.curStationProcess.removeAllListeners("close")
      }

      self.curStationProcess.on("exit", (err) =>{
        stillWait = false
      })


      self.curStationProcess.kill()

      console.log("Waiting for old process to stop")
      while ((stillWait) && (maxWait > 0)){
        maxWait -= interval
        await self.sleep(interval)
        console.log("Still waiting")
      }
      console.log("Finished waiting with "+maxWait+"ms left to the maximum.")

      self.curStationProcess = null
    }

    if(sendStatus){
      self.sendSocketNotification("RADIO_STOPPED",{
        curStationIndex: self.curStationIndex,
        curStreamInfo: self.curStreamInfo
      })
    }
  },

  stop: function () {
    const self = this
    self.stopStation(false)
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
    console.log(self.name + ': Received notification '+notification)
    if (notification === 'CONFIG' && self.started === false) {
      self.config = payload
      self.started = true
    } else if (notification === 'RADIO_PLAY'){
      console.log(self.name+": Received Play with payload: "+JSON.stringify(payload))
      if(typeof payload.id !== 'undefined'){
        if((payload.id >= 0) && (payload.id < self.config.stations.length)){
          self.playStation(payload.id)
        }
      } else if (typeof payload.title !== 'undefined'){
        for(var id in self.config.stations){
          if(payload.title === self.config.stations[id].title){
            self.playStation(id)
          }
        }
      } else if (self.curStationIndex != null){
        self.playStation(self.curStationIndex, 0)
      }
    } else if (notification === 'RADIO_STOP'){
      self.stopStation(true)
    }
  }
})
