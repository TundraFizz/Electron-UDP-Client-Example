var ipc         = require("electron").ipcRenderer;
var EmitMessage = require("electron").remote.app.emit;

function SendMessage(func, data = null){
  EmitMessage("message", {
    "f": func,
    "d": data
  });
}

$("body").on("click", ".join-room", function(){
  SendMessage("JoinRoom", {
    "name": $("#name").val(),
    "room": $(this).text()
  });
});

var qwe = {};

ipc.on("message", (event, data) => {
  console.log(data.f);
  console.log(data.d);

  try{
    qwe[data.f](data.d);
  }catch(err){
    console.log(`ERROR: The function "${data.f}" doesn't exist`);
  }
});

qwe.UpdateRooms = (data) => {
  var template = `
  <% for(var i in data){ %>
    <div>
      <span class="join-room"><%= i %></span>: <%= data[i].length %> users in this room
    </div>
  <% } %>
  `;

  var html = ejs.render(template, {"data": data});
 $("#room-list").html(html);
}
