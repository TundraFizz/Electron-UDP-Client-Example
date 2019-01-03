var {app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, clipboard, shell, dialog} = require("electron");
var path = require("path");
var url  = require("url");
var $    = require("jquery");

require("electron-reload")(__dirname + "/app/index.html", {
  electron: path.join(__dirname, "node_modules", ".bin", "electron")
});

// Keep a global reference of the window object, if you don't, the window will be closed automatically when the JavaScript object is garbage collected
var win;

// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs
app.on("ready", () => {
  // Create the browser window and load the index.html of the app
  win = new BrowserWindow({width: 800, height: 600, webPreferences: {nodeIntegration: true}});
  win.loadURL(url.format({
    "pathname": path.join(__dirname, "index.html"),
    "protocol": "file:",
    "slashes" : true
  }));

  win.webContents.openDevTools(); // Open DevTools

  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store windows in an array if your app supports multi windows, this is the time when you should delete the corresponding element.
    win = null;
  });
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
  if(process.platform !== "darwin")
    app.quit();
})

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if(win === null)
    createWindow();
})

////////////////////////////////////////////////////////////////////////////////////////////////////

var in_  = {}; // In the future, have a module create the object?
var out_ = {}; // In the future, have a module create the object?

////////////////////////////////////////////////////////////////////////////////////////////////////
// RECEIVING MESSAGES: window

app.on("message", (data) => {
  try{
    UDP(data.f, data.d);
    // out_[data.f](data.d);
  }catch(err){
    console.log(`ERROR: The function "${data.f}" doesn't exist`);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// RECEIVING MESSAGES: server

var client = require("dgram").createSocket("udp4").bind(process.env.port);

client.on("listening", () => {
  console.log(`Listening on port ${client.address().port}`);
});

client.on("message", async(message) => {
  var data = JSON.parse(message.toString("utf-8"));
  console.log("=============================");
  console.log(data);
  try{
    in_[data.f](data.d);
  }catch(err){
    console.log(err);
    console.log(`ERROR: The function "${data.f}" doesn't exist`);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// SENDING MESSAGES: window

function SendMessage(func, data = null){
  win.webContents.send("message", {
    "f": func,
    "d": data
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// SENDING MESSAGES: server

function UDP(func, data = null){
  var message = Buffer.from(JSON.stringify({
    "f": func,
    "d": data
  }));

  client.send(message, 0, message.length, 9000, "localhost");
}

////////////////////////////////////////////////////////////////////////////////////////////////////

in_.UpdateRooms = (data) => {
  console.log(data);
  SendMessage("UpdateRooms", data);
}

out_.JoinRoom = (data) => {
  console.log("JOIN A ROOM!");
  console.log(data);
}

out_.ChatMessage = (data) => {
  UDP("ChatMessage", data);
}
