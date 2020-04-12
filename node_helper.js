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
    this.initialState = true
    this.curStationIndex = 0;
    this.curStationProcess = null
    this.currentProfile = ''
    this.currentProfilePattern = new RegExp('.*')
    this.inStreamInfo = false
    this.curStreamInfo = "&nbsp;"
    this.playing = false
  },

  playStation: function(stationId = null){
    const self = this
    self.stopStation()
    self.inStreamInfo = false
    self.curStreamInfo = "&nbsp;"

    if(stationId !== null){
      self.curStationIndex = stationId

      var mplayerCache = self.config.mplayerCache

      if(self.config.stations[self.curStationIndex].mplayerCache){
        mplayerCache = self.config.stations[self.curStationIndex].mplayerCache
      }
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

      self.playing = true
      self.curStationProcess.on("close", (err) =>{
        self.sendSocketNotification("RADIO_STOPPED", {
          curStationIndex: self.curStationIndex,
          previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
          nextStationIndex: self.getNextStationId(self.curStationIndex, -1)
        })
      })

      self.curStationProcess.stdout.on("data", (data) =>{
        var dataString = data.toString()
        if(self.inStreamInfo){
          if(data.indexOf("'") > -1){
            self.curStreamInfo += data.substring(0, data.indexOf("'"))
            self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
              curStationIndex: self.curStationIndex,
              previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
              nextStationIndex: self.getNextStationId(self.curStationIndex, -1),
              curStreamInfo: self.curStreamInfo
            })
          } else {
            self.curStreamInfo = "&nbsp;"
            self.inStreamInfo = false
            self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
              curStationIndex: self.curStationIndex,
              previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
              nextStationIndex: self.getNextStationId(self.curStationIndex, -1),
              curStreamInfo: self.curStreamInfo
            })
          }
        } else {
          if(dataString.indexOf("StreamTitle='") > -1){
            self.curStreamInfo = dataString.substring(dataString.indexOf("StreamTitle='")+13)
            if(self.curStreamInfo.indexOf("'") > -1){
              self.curStreamInfo = self.curStreamInfo.substring(0, self.curStreamInfo.indexOf("'"))
              self.sendSocketNotification("RADIO_CURRENT_STREAM_INFO", {
                curStationIndex: self.curStationIndex,
                previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
                nextStationIndex: self.getNextStationId(self.curStationIndex, -1),
                curStreamInfo: self.curStreamInfo
              })
            } else {
              self.inStreamInfo = true
            }
          }
        }
      })

      setTimeout(()=>{
        self.sendSocketNotification("RADIO_PLAYING",{
          curStationIndex: self.curStationIndex,
          previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
          nextStationIndex: self.getNextStationId(self.curStationIndex, -1),
          curStreamInfo: self.curStreamInfo
        })
      }, 500)
    }
  },

  stopStation: function(){
    const self = this
    self.playing = false
    self.inStreamInfo = false
    self.curStreamInfo = "&nbsp;"
    if(self.curStationProcess){
      console.log("Killing old station process")
      self.curStationProcess.kill()
      self.curStationProcess = null
      self.sendSocketNotification("RADIO_STOPPED",{
        curStationIndex: self.curStationIndex,
        previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
        nextStationIndex: self.getNextStationId(self.curStationIndex, -1),
        curStreamInfo: self.curStreamInfo
      })
    }
  },

  getNextStationId: function(curId, type=1){
    const self = this
    var retId = null
    if(curId !== null){
      if(type > 0){
        var newId = curId
        for(var i = 0; i < self.config.stations.length; i++){
          newId -= 1
          if(newId < 0){
            newId = self.config.stations.length - 1
          }
  
          if(
            (typeof self.config.stations[newId].profiles === 'undefined') || 
            (self.currentProfilePattern.test(self.config.stations[newId].profiles))
          ){
            retId = newId
            break
          }
        }
      } else if(type < 0){
        var newId = curId
        for(var i = 0; i < self.config.stations.length; i++){
          newId += 1
          if(newId > self.config.stations.length - 1){
            newId = 0
          }
  
          if(
            (typeof self.config.stations[newId].profiles === 'undefined') || 
            (self.currentProfilePattern.test(self.config.stations[newId].profiles))
          ){
            retId = newId
            break
          }
        }
      } else if(type === 0){
        if(
          (typeof self.config.stations[curId].profiles === 'undefined') || 
          (self.currentProfilePattern.test(self.config.stations[curId].profiles))
        ){
          return curId
        } else {
          return self.getNextStationId(curId, 1)
        }
      }
    } else {
      return self.getNextStationId(0,1)
    }
    return retId
  },

  socketNotificationReceived: function (notification, payload) {
    const self = this
    console.log(self.name + ': Received notification '+notification)
    if (notification === 'CONFIG' && self.started === false) {
      self.config = payload
      self.started = true
    } else if (notification === 'RADIO_NEXT'){
      self.initialState = false
      self.playStation(self.getNextStationId(self.curStationIndex, -1))
    } else if (notification === 'RADIO_PREVIOUS'){
      self.initialState = false
      self.playStation(self.getNextStationId(self.curStationIndex, 1))
    } else if (notification === 'RADIO_PLAY'){
      self.initialState = false
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
        self.playStation(self.getNextStationId(self.curStationIndex, 0))
      }
    } else if (notification === 'RADIO_STOP'){
      self.stopStation()
    } else if (notification === 'RADIO_TOGGLE'){
      self.initialState = false
      if(self.curStationProcess !== null){
        self.stopStation()
      } else {
        self.playStation(self.getNextStationId(self.curStationIndex, 0))
      }
    } else if (notification === 'CHANGED_PROFILE'){
      if(typeof payload.to !== 'undefined'){
        self.currentProfile = payload.to
        self.currentProfilePattern = new RegExp('\\b'+payload.to+'\\b')

        if(self.initialState){
          self.curStationIndex = self.getNextStationId(self.curStationIndex, 0)
        } else {
          if(self.config.changeStationOnProfileChange){
            var newId = self.getNextStationId(self.curStationIndex, 0)
  
            if(newId !== self.curStationIndex){
              self.curStationIndex = newId
              if(!self.initialState){
                if(self.playing){
                  self.playStation(newId)
                } else {
                  self.stopStation()
                  self.sendSocketNotification("RADIO_UPDATE_AFTER_PROFILE_CHANGE",{
                    curStationIndex: self.curStationIndex,
                    previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
                    nextStationIndex: self.getNextStationId(self.curStationIndex, - 1),
                    curStreamInfo: self.curStreamInfo
                  })
                }
              }
            } else {
              self.sendSocketNotification("RADIO_UPDATE_AFTER_PROFILE_CHANGE",{
                curStationIndex: self.curStationIndex,
                previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
                nextStationIndex: self.getNextStationId(self.curStationIndex, - 1),
                curStreamInfo: self.curStreamInfo
              })
            }
          } else {
            if(!self.initialState){
              self.sendSocketNotification("RADIO_UPDATE_AFTER_PROFILE_CHANGE",{
                curStationIndex: self.curStationIndex,
                previousStationIndex: self.getNextStationId(self.curStationIndex, 1),
                nextStationIndex: self.getNextStationId(self.curStationIndex, - 1),
                curStreamInfo: self.curStreamInfo
              })
            }
          }
        }
      }
    }
  }
})
