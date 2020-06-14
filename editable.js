(function($){
  $.fn.editable = function(){
    this.append('<span class="ui-icon ui-icon-pencil">')
      .on('click','.ui-icon-pencil',function(){
        let $editable = $(this).parent()
        let children = $editable.children()
        let text = $editable.text()
        $editable.data('oldText', text)
        $editable.empty().append(`<input value="${text}"/><span class="ui-icon ui-icon-check"></span><span class="ui-icon ui-icon-close"></span>`)
        $('input',$editable).focus().select()
      })
      .on('click','.ui-icon-close',function(){
          let $editable = $(this).parent()
          $editable.text($editable.data('oldText')).append('<span class="ui-icon ui-icon-pencil">')
      })
      .on('click','.ui-icon-check',function(e){
          let $editable = $(this).parent()
          $editable.text($('input',$editable).val())
            .append('<span class="ui-icon ui-icon-pencil">')
            .trigger('editableChange',e)
      })
      .on('keydown','input',function(e){
        if(e.key=='Enter'){
          $(this).nextAll('.ui-icon-check').trigger('click',e)
        } else if(e.key=='Escape'){
          $(this).nextAll('.ui-icon-close').trigger('click')
        }
      })
  }
})(jQuery)
