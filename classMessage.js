


function Message (args) {

  var args = args || {};
  this.text = args.text || "Test message " + Math.round(Math.random() * 10000);
  this.duration = args.duration || 10000;
  this.containerID = "message-container";
  this.id = "message-" + Math.round(Math.random() * 1000000);
  this.timeout = false;


  this.show = function () {

    var myThis = this;
    var containerEl = document.getElementById(this.containerID);

    if (!containerEl) {
       var containerEl = document.createElement("div");
       containerEl.id = this.containerID;
       containerEl.style.setProperty("position", "fixed");
       containerEl.style.setProperty("right", "0px");
       containerEl.style.setProperty("bottom", "0px");
       containerEl.style.setProperty("width", "300px");
       containerEl.style.setProperty("z-index", "9999");
       document.body.appendChild(containerEl);
    }

    // add message element
    var messageEl = document.createElement("div");
    messageEl.id = this.id;
    messageEl.innerHTML = this.text;
    messageEl.style.setProperty("padding", "10px");
    messageEl.style.setProperty("background-color", "rgba(255, 255, 2455, 0.5)");
    messageEl.style.setProperty("color", "#666666");
    messageEl.style.setProperty("font-size", "12px");
    messageEl.style.setProperty("margin", "10px");
    messageEl.style.setProperty("cursor", "pointer");
    messageEl.onclick = function () { myThis.remove(); };
    containerEl.appendChild(messageEl);

    this.timeout = setTimeout(function () { myThis.remove(); }, this.duration);

  }


  this.remove = function () {

    clearTimeout(this.timeout);

    var containerEl = document.getElementById(this.containerID);
    var messageEl = document.getElementById(this.id);

    containerEl.removeChild(messageEl);

    if (containerEl.innerHTML == "") {
      document.body.removeChild(containerEl);
    }

  }

  this.show();

}
