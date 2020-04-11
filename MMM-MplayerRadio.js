Module.register('MMM-MplayerRadio', {

  /**
   * By default, we should try to make the configuration match the demo
   * implementation. This means 3 pages, and some default enabled styles.
   */
  defaults: {
    mplayerPath: "/usr/bin/mplayer",
    mplayerCache: 512,
    changeStationOnProfileChange: true,
    showControls: true
  },

  /**
   * Apply any styles, if we have any.
   */
  getStyles() {
    return ['mplayer-radio.css'];
  },

  getScripts: function() {
    return ['//code.iconify.design/1/1.0.5/iconify.min.js']
  },

  /**
   * Pseudo-constructor for our module. Sets the default current page to 0.
   */
  start() {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification('CONFIG', this.config);
    this.curStationIndex = null;
    this.previousStationIndex = null;
    this.nextStationIndex = null;
    this.playing = false;
    this.curStreamInfo = null;
  },

  /**
   * Render the cicles for each page, and highlighting the page we're on.
   */
  getDom() {
    const self = this
    const wrapper = document.createElement("div")
    const innerWrapper = document.createElement("table")
      innerWrapper.className = "mradio"
    if(this.curStationIndex != null){
      const wrapperPrevious = document.createElement("tr")
      wrapperPrevious.className=("previousWrapper")
      if((this.previousStationIndex != null) && (this.curStationIndex !== this.previousStationIndex)){
        const previousStationLogoWrapper = document.createElement("td")
          previousStationLogoWrapper.className = "logoWrapper"
          const previousStationLogo = document.createElement("img")
            previousStationLogo.className = "logo"
            previousStationLogo.alt = "No Image"
            if(typeof this.config.stations[this.previousStationIndex].logo !== "undefined"){
              previousStationLogo.src = this.config.stations[this.previousStationIndex].logo
            } else {
              previousStationLogo.src = "./MMM-MplayerRadio/radio-freepnglogos.png"
            }
          previousStationLogoWrapper.appendChild(previousStationLogo)
        wrapperPrevious.appendChild(previousStationLogoWrapper)

        const previousStationTitleWrapper = document.createElement("td")
          previousStationTitleWrapper.className = "titleWrapper"
          const previousStationTitle = document.createElement("span")
            previousStationTitle.className = "title"
            previousStationTitle.innerHTML = this.config.stations[this.previousStationIndex].title
          previousStationTitleWrapper.appendChild(previousStationTitle)
        wrapperPrevious.appendChild(previousStationTitleWrapper)
      }
      innerWrapper.appendChild(wrapperPrevious)

      const wrapperCurrent = document.createElement("tr")
        if(this.playing){
          wrapperCurrent.className=("currentWrapper playing")
        } else {
          wrapperCurrent.className=("currentWrapper stopped")
        }
        
        if(this.curStationIndex != null){
          const curStationLogoWrapper = document.createElement("td")
            curStationLogoWrapper.className = "logoWrapper"
            const curStationLogo = document.createElement("img")
              curStationLogo.className = "logo"
              curStationLogo.alt = "No Image"
              if(typeof this.config.stations[this.curStationIndex].logo !== "undefined"){
                curStationLogo.src = this.config.stations[this.curStationIndex].logo
              } else {
                curStationLogo.src = "./MMM-MplayerRadio/radio-freepnglogos.png"
              }
            curStationLogoWrapper.appendChild(curStationLogo)
          wrapperCurrent.appendChild(curStationLogoWrapper)

          const currentStationTitleWrapper = document.createElement("td")
              currentStationTitleWrapper.className = "titleWrapper"
            const currentStationTitle = document.createElement("span")
              currentStationTitle.className = "title"
              currentStationTitle.innerHTML = this.config.stations[this.curStationIndex].title
            currentStationTitleWrapper.appendChild(currentStationTitle)
          wrapperCurrent.appendChild(currentStationTitleWrapper)
        }
        innerWrapper.appendChild(wrapperCurrent)

      const wrapperNext = document.createElement("tr")
        wrapperNext.className=("nextWrapper")
        if((this.nextStationIndex != null) && (this.curStationIndex !== this.nextStationIndex) && (this.previousStationIndex !== this.nextStationIndex)){
          const nextStationLogoWrapper = document.createElement("td")
            nextStationLogoWrapper.className = "logoWrapper"
            const nextStationLogo = document.createElement("img")
              nextStationLogo.className = "logo"
              nextStationLogo.alt = "No Image"
              if(typeof this.config.stations[this.nextStationIndex].logo !== "undefined"){
                nextStationLogo.src = this.config.stations[this.nextStationIndex].logo
              } else {
                nextStationLogo.src = "./MMM-MplayerRadio/radio-freepnglogos.png"
              }
            nextStationLogoWrapper.appendChild(nextStationLogo)
          wrapperNext.appendChild(nextStationLogoWrapper)

          const nextStationTitleWrapper = document.createElement("td")
              nextStationTitleWrapper.className = "titleWrapper"
            const nextStationTitle = document.createElement("span")
              nextStationTitle.className = "title"
              nextStationTitle.innerHTML = this.config.stations[this.nextStationIndex].title
            nextStationTitleWrapper.appendChild(nextStationTitle)
          wrapperNext.appendChild(nextStationTitleWrapper)
        }
        innerWrapper.appendChild(wrapperNext)

        const streamInfoWrapper = document.createElement("tr")
          streamInfoWrapper.className = "streamInfoWrapper"
        if(this.curStreamInfo != null ){
          const streamInfo = document.createElement("td")
            streamInfo.setAttribute("colspan", "2")
            streamInfo.className = "streamInfo"
            streamInfo.innerHTML = this.curStreamInfo
          streamInfoWrapper.appendChild(streamInfo)
        }
        innerWrapper.appendChild(streamInfoWrapper)
    } else {
      const noInfoWrapper = document.createElement("tr")
        noInfoWrapper.className = "noInfoWrapper"
        const noInfo = document.createElement("td")
          noInfo.setAttribute("colspan", "2")
          noInfo.className = "noInfoWrapper iconify"
          noInfo.setAttribute("data-icon","noto:radio")
          noInfo.setAttribute("data-inline","false")
        noInfoWrapper.appendChild(noInfo)
      innerWrapper.appendChild(noInfoWrapper)
    }

    

    if(this.config.showControls){
      const controlWrapper = document.createElement("tr")
        controlWrapper.className = "controlWrapper"

        const controlInnerWrapper = document.createElement("td")
          controlInnerWrapper.className = "controlInnerWrapper"
          controlInnerWrapper.setAttribute("colspan", "2")

        const prevButtonWrapper = document.createElement("span")
          prevButtonWrapper.className = "button previousButtonWrapper"
          prevButtonWrapper.addEventListener("click", ()=>{self.sendSocketNotification("RADIO_PREVIOUS")})

          const prevButton = document.createElement("span")
            prevButton.className = "button previousButton iconify"
            prevButton.setAttribute("data-icon", "ic-round-skip-previous")
            prevButton.setAttribute("data-inline", "false")
          prevButtonWrapper.appendChild(prevButton)
          controlInnerWrapper.appendChild(prevButtonWrapper)
        
        if(this.playing){
          const stopButtonWrapper = document.createElement("span")
            stopButtonWrapper.className = "button stopButtonWrapper"
            stopButtonWrapper.addEventListener("click", ()=>{self.sendSocketNotification("RADIO_STOP")})

            const stopButton = document.createElement("span")
              stopButton.className = "button stopButton iconify"
              stopButton.setAttribute("data-icon", "ic-round-stop")
              stopButton.setAttribute("data-inline", "false")
            stopButtonWrapper.appendChild(stopButton)
            controlInnerWrapper.appendChild(stopButtonWrapper)
        } else {
          const playButtonWrapper = document.createElement("span")
            playButtonWrapper.className = "button playButtonWrapper"
            playButtonWrapper.addEventListener("click", ()=>{self.sendSocketNotification("RADIO_PLAY")})

            const playButton = document.createElement("span")
              playButton.className = "button playButton iconify"
              playButton.setAttribute("data-icon", "ic-round-play-arrow")
              playButton.setAttribute("data-inline", "false")
            playButtonWrapper.appendChild(playButton)
            controlInnerWrapper.appendChild(playButtonWrapper)
        }

        const nextButtonWrapper = document.createElement("span")
            nextButtonWrapper.className = "button nextButtonWrapper"
            nextButtonWrapper.addEventListener("click", ()=>{self.sendSocketNotification("RADIO_NEXT")})

          const nextButton = document.createElement("span")
            nextButton.className = "button nextButton iconify"
            nextButton.addEventListener("click", ()=>{self.sendSocketNotification("RADIO_NEXT")})
            nextButton.setAttribute("data-icon", "ic-round-skip-next")
            nextButton.setAttribute("data-inline", "false")
          nextButtonWrapper.appendChild(nextButton)
        controlInnerWrapper.appendChild(nextButtonWrapper)
        
        controlWrapper.appendChild(controlInnerWrapper)
        innerWrapper.appendChild(controlWrapper)
    }

    wrapper.appendChild(innerWrapper)
    return wrapper;
  },

  notificationReceived: function(notification,payload) {
    if((notification === "CHANGED_PROFILE") ||
       (notification === "RADIO_NEXT") ||
       (notification === "RADIO_PREVIOUS") ||
       (notification === "RADIO_PLAY") ||
       (notification === "RADIO_STOP") ||
       (notification === "RADIO_TOGGLE")                     
    ){
      this.sendSocketNotification(notification,payload)
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if(notification === "RADIO_PLAYING"){
      this.curStationIndex = payload.curStationIndex
      this.previousStationIndex = payload.previousStationIndex
      this.nextStationIndex = payload.nextStationIndex
      this.curStreamInfo = payload.curStreamInfo
      this.playing = true
      this.updateDom()
    } else if(notification === "RADIO_STOPPED"){
      this.curStationIndex = payload.curStationIndex
      this.previousStationIndex = payload.previousStationIndex
      this.nextStationIndex = payload.nextStationIndex
      this.curStreamInfo = payload.curStreamInfo
      this.playing = false
      this.updateDom()
    } else if(notification === "RADIO_CURRENT_STREAM_INFO"){
      this.curStationIndex = payload.curStationIndex
      this.previousStationIndex = payload.previousStationIndex
      this.nextStationIndex = payload.nextStationIndex
      this.curStreamInfo = payload.curStreamInfo
      this.playing = true
      this.updateDom()
    } else if(notification === "RADIO_UPDATE_AFTER_PROFILE_CHANGE"){
      this.curStationIndex = payload.curStationIndex
      this.previousStationIndex = payload.previousStationIndex
      this.nextStationIndex = payload.nextStationIndex
      this.curStreamInfo = payload.curStreamInfo
      this.updateDom()
    }
  },

});