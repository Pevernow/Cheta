$("document").ready(function() {});
//打开文件时调用此函数
function openfile() {
  const reader = new FileReader();
  reader.readAsText(document.getElementById("open").files[0], "utf8"); // input.files[0]为第一个文件
  reader.onload = () => {
    data = JSON.parse(reader.result); // reader.result为获取结果
    loadmenu(data.menu, document.getElementById("menu"));
  };
}
//当点击目录中的可编辑项目时调用此函数
//作用：调用savearea保存旧数据，并把对应的docs刷新到编辑器主页
//入参： t this 是当前目录项的指针，用于添加id以标记编辑项
function flushdoc(t) {
  savearea();
  var data = JSON.parse($(t).attr("docs"));
  $("#texts").empty();
  for (var i = 0, size = data.length; i < size; i++) {
    $("#texts").append('<li class="text uk-text-break textarea" id="input" contenteditable="true">' + data[i] + "</li>");
  }
  try {
    $("#editing").removeAttr("id");
  } catch {}
  $(t).attr("id", "editing");
}
//当按下回车时执行换行编辑操作
//Buging!!!
$(document).keyup(function(e) {
  //捕获文档对象的按键弹起事件
  if (e.keyCode == 13) {
    //按键信息对象以参数的形式传递进来了
    //此处编写用户敲回车后的代码
    if (
      $("#input")
        .text()
        .indexOf(" ") >= 0 ||
      $("#input").text() == ""
    ) {
      $("#editor")
        .children(":last-child")
        .append(
          '<li class="text uk-text-break textarea" id="input" contenteditable="true"></li>'
        );
      $("#input")[0].focus();
    }
  }
});
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
  var out = [];
  $("#editor")
    .children(".uk-list")
    .children()
    .each(function() {
      out.push(this.innerText);
    });
  $("#editing").attr("docs", JSON.stringify(out));
  $("#editing").attr("onclick", "flushdoc(this)");
}
//保存文件
//（暂未实现）
function eachmenu(docs, out) {
  $(docs)
    .children()
    .each(function(i, dom) {
      if ($(dom).children("a").length == 0) {
        var childout = [dom.innerText.split(/[\s\n]/)[0]];
        eachmenu($(dom).children()[0], childout);
        out.push(childout);
      } else {
        var tmptexts = $(dom).attr("docs");
        var tmpname = $(dom)
          .children("a")
          .text();
        out.push({ name: tmpname, data: tmptexts });
      }
    });
}
function savefile() {
  var out = { menu: ["main"] };
  eachmenu($("#menu")[0], out.menu);
  downFile(JSON.stringify(out), "New.che");
}
//加载目录（递归按层级加载)
//入参： menu 当前层对象
//      doc 当前层对应dom对象
function loadmenu(menu, doc) {
  for (var i = 1, l = menu.length; i < l; i++) {
    if (Object.prototype.toString.call(menu[i]) == "[object Array]") {
      if (menu[i][0] != "main") {
        $(doc).append(
          $("<li>" + menu[i][0] + "</li>").append(
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
          "' onclick=flushdoc(this)><a href='#'>" +
          menu[i]["name"] +
          "</a></li>"
      );
    }
  }
  $(doc)
    .children()
    .addClass("uk-margin-remove-top");
  return doc;
}
