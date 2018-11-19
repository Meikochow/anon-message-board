$("document").ready(function() {
 $.ajax({
          type: "GET",
          url: '/boards',
          success: function(data)
          {
            let boardsArray=["<div style='display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center; '>"];
            data.forEach(function(ele) {
               if(ele.name!=='system.indexes'&&ele.name!=='testing'){
            boardsArray.push(`<a href="/b/${ele.name}/"><div class="board"><p class="boardText">${ele.name}</p></div></a>`)
               }
            })
            boardsArray.push("</div>")
            $('#result').html(boardsArray.join(""));
          }
        });
});