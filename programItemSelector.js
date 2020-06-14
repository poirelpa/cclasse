(function($){
  $.fr.programItemSelector = function(options){
    this.on('click',function(){
      let item = window.selectProgramItem(options)
      this.trigger('programItemSelected',{
        data:item
      })
    })
  }
})(jQuery)
