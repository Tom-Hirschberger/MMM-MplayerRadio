Module.register('MMM-MplayerRadio', {

  /**
   * By default, we should try to make the configuration match the demo
   * implementation. This means 3 pages, and some default enabled styles.
   */
  defaults: {
    mplayerPath: "/usr/bin/mplayer",
    mplayerCache: 512,
    nowPlayingText: "Now playing: ",
    stoppedText: "Stopped"
  },

  /**
   * Apply any styles, if we have any.
   */
  getStyles() {
    return ['simple-radio.css'];
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
  },

  /**
   * Render the cicles for each page, and highlighting the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")
    const innerWrapper = document.createElement("span")
      innerWrapper.className="radioWrapper"
    wrapper.appendChild(innerWrapper)
    if(this.curStationIndex !== null){
      if(this.config.nowPlayingText){
        const title = document.createElement("div")
          title.className = "radioTitle playing"
        title.innerHTML = "Now Playing: "+this.config.stations[this.curStationIndex].title
        innerWrapper.appendChild(title)
      }

      if(typeof this.config.stations[this.curStationIndex].logo !== 'undefined'){
        const logoWrapper = document.createElement("span")
          logoWrapper.className=("radioLogoWrapper")

          const img = document.createElement("img")
              img.className = "radioLogo"
              img.alt = "No Image"
              img.src = this.config.stations[this.curStationIndex].logo
          logoWrapper.appendChild(img)
        innerWrapper.appendChild(logoWrapper)
      }
    } else {
      if(this.config.stoppedText !== null){
        const stopText = document.createElement("div")
          stopText.className = "radioTitle stopped"
          stopText.innerHTML = this.config.stoppedText
        innerWrapper.appendChild(stopText)
      }
      const title = document.createElement("span")
        title.className = "radioTitle stopped iconify"
        title.setAttribute("data-icon","noto:radio")
        title.setAttribute("data-inline","false")
      innerWrapper.appendChild(title)
    }
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
      this.curStationIndex = payload.id
      this.updateDom()
    } else if(notification === "RADIO_STOPPED"){
      this.curStationIndex = null
      this.updateDom()
    }
  },

});
