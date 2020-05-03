$(document).ready(function () {
  name = "新书";
});

//打开文件时调用此函数
function openfile() {
  const reader = new FileReader();
  reader.readAsText(document.getElementById("open").files[0], "utf8"); // input.files[0]为第一个文件
  name = document.getElementById("open").files[0].name.substr(0,document.getElementById("open").files[0].name.indexOf("."));
  reader.onload = () => {
    data = JSON.parse(reader.result); // reader.result为获取结果
    loadmenu(data.menu, document.getElementById("menu"));
    Rcontextmenu();
  };
}
//当点击目录中的可编辑项目时调用此函数
//作用：调用savearea保存旧数据，并把对应的docs刷新到编辑器主页
//入参： t this 是当前目录项的指针，用于添加id以标记编辑项
function flushdoc(t) {
  stopPropagation()
  savearea();
  if($(t).attr("chetype")=="folder"){
    var data = "";
    $(t).children("li").each(function(){
      data+=$(this).attr("docs");
    });
  }else{
    var data = $(t).attr("docs");
  }
  $("#editor").empty();
  $("#editor").append(
    '<textarea style="overflow:hidden; resize:none;max-height: 100%" rows="18" class="textarea" type="text" name="name">' +
      data +
      "</textarea>"
  );
  try {
    $("#editing").removeClass("uk-active");
    $("#editing").removeAttr("id");
  } catch {}
  $(t).attr("id", "editing");
  $(t).addClass("uk-active");
  $("#title").text($(t).text());
  $("title").text($(t).text());
  $("#editor").keyup()
}
//下载json文件
//入参: content json文件
//      fileName 文件名
function downFile(content, fileName) {
  const dom = document.createElement("a"); // 隐藏的a标签，href为输出流
  const blob = new Blob([content], { type: "application/json" }); // 创建一个类文件对象：Blob对象表示一个不可变的、原始数据的类文件对象
  const url = window.URL.createObjectURL(blob); // 生成一个Blob对象
  dom.style.display = "none";
  dom.href = url;
  document.body.appendChild(dom);
  dom.setAttribute("download", fileName); // 指示浏览器下载url,而不是导航到它
  dom.click();
  document.body.removeChild(dom);
  // 手动释放创建的URL对象所占内存
  URL.revokeObjectURL(url);
}
//保存当前编辑器部分数据到当前目录索引的位置
function savearea() {
  /*
  $("#editor")
    .children()
    .each(function() {
      out+=this.innerText;
    });
  */
  var out = $("#editor").children().val();
  $("#editing").attr("docs", out);
  $("#editing").attr("onclick", "flushdoc(this)");
  console.log(out);
}
//保存文件
function eachmenu(docs, out) {
  $(docs)
    .children()
    .each(function (i, dom) {
      if ($(dom).children("a").length == 0) {
        var childout = [dom.innerText.split(/[\s\n]/)[0]];
        eachmenu($(dom).children()[0], childout);
        out.push(childout);
      } else {
        var tmptexts = $(dom).attr("docs");
        var tmpname = $(dom).children("a").text();
        out.push({ name: tmpname, data: tmptexts });
      }
    });
}
function savefile() {
  var out = { menu: ["main"] };
  savearea();
  eachmenu($("#menu")[0], out.menu);
  out.menu.splice(1,1);
  downFile(JSON.stringify(out), name+".che");
}
//加载目录（递归按层级加载)
//入参： menu 当前层对象
//      doc 当前层对应dom对象
function loadmenu(menu, doc) {
  for (var i = 1, l = menu.length; i < l; i++) {
    if (Object.prototype.toString.call(menu[i]) == "[object Array]") {
      if (menu[i][0] != "main") {
        $(doc).append(
          $("<li contenteditable='false'>" + menu[i][0] + "</li>").append(
            loadmenu(menu[i], document.createElement("ul"))
          )
        );
      } else {
        $(doc).append(loadmenu(menu[i], document.createElement("ul")));
      }
    } else {
      $(doc).append(
        "<li docs='" +
          menu[i]["data"] +
          "' onclick=flushdoc(this)><a contenteditable='false'>" +
          menu[i]["name"] +
          "</a></li>"
      );
    }
  }
  $(doc).children().addClass("uk-margin-remove-top");
  return doc;
}
function appendPart(t) {
  if (t == undefined) {
    t = document.getElementById("menu");
    $(t).attr("chetype","folder");
  }
  if ($(t).attr("chetype") == "folder") {
    $(t).append(
      "<li docs='' onclick=flushdoc(this)><a contenteditable='true'>新章节</a></li>"
    );
  } else {
    $(t).after(
      "<li docs='' onclick=flushdoc(this)><a contenteditable='true'>新章节</a></li>"
    );
  }
}
function appendFolder(t) {
  if (t == undefined) {
    t = document.getElementById("menu");
    $(t).attr("chetype","folder");
  }
  if ($(t).attr("chetype") == "folder") {
    $(t).append(
      "<li><ui class=\"uk-list uk-list-bullet\" chetype='folder' onclick=\"flushdoc(this)\"><a contenteditable='true'>新分卷</a></ui></li>"
    );
  } else {
    $(t).after(
      "<li><ui class=\"uk-list uk-list-bullet\" chetype='folder' onclick=\"flushdoc(this)\"><a contenteditable='true'>新分卷</a></ui></li>"
    );
  }
}
function stopPropagation(){
  var e=(event)?event:window.event;
  if (window.event) {
    e.cancelBubble=true;// ie下阻止冒泡
   } else {
    //e.preventDefault();
    e.stopPropagation();// 其它浏览器下阻止冒泡
   }
}