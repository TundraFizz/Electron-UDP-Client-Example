var ipc         = require("electron").ipcRenderer;
var EmitMessage = require("electron").remote.app.emit;

function SendMessage(func, data = null){
  EmitMessage("message", {
    "function": func,
    "data"    : JSON.stringify(data)
  });
}

$("#testing").click(function(){
  SendMessage("Testing", {"yolo": "swag"});
});

$("#testing2").click(function(){
  SendMessage("Testing2", {"qqqqqqqq": "wwwwwwww"});
});

function REEEEEE(data){
  console.log(data);
  $("#messages").append(`<div>${JSON.stringify(data)}</div>`);
}

ipc.on("message", (event, msg) => {
  try{
    eval(`${msg.function}(${msg.data});`);
  }catch(err){
    console.log(`ERROR: The function "${msg.function}" doesn't exist`);
    REEEEEE(msg.data)
  }
});
