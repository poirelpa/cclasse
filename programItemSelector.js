(function($){
  $.fn.programItemSelector = function(options){
    this.addClass('ui-icon ui-icon-note')
    this.on('click',function(){
      let o = options
      if(typeof o == "function"){
        o = options()
      }
      let $this = $(this)
      o=Object.assign({
        uuid:$this.data('item')?.uuid,
        program:$this.data('item')?.program,
        select:1
      },o)

      let item = window.selectProgramItem(o||{})
      if(item){
          $this.data('item',item)
          $this.trigger('programItemSelected',item)
      }
    })
    return this
  }
})(jQuery)
