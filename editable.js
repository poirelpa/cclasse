(function($){
  $.fn.editable = function(){
    if(this.next().hasClass('ui-icon-pencil')) return
    $('<span class="ui-icon ui-icon-pencil">')
      .insertAfter(this)
      .on('click',function(){
        let $editable = $(this).prev()
        $editable.data('oldText',$editable.text())
        $('<span class="ui-icon ui-icon-check">')
          .insertAfter($editable)
          .on('click',function(){
            $(this).prev().prev().attr('contentEditable',false).editable().trigger('change')
            $(this).prev().remove()
            $(this).remove()
          })
        $('<span class="ui-icon ui-icon-close">')
          .insertAfter($editable)
          .on('click',function(){
            $(this).prev().attr('contentEditable',false).editable()
            $editable.text($editable.data('oldText'))
            $(this).next().remove()
            $(this).remove()
          })
        $editable.attr('contentEditable',true)
          .focus()
          let range = document.createRange();
          range.selectNodeContents($editable.get(0));
          let sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        $(this).remove()
      })
      this.on('keydown',function(e){
        if(e.key=='Enter'){
          $(this).nextAll('.ui-icon-check').trigger('click',e)
          return false
        } else if(e.key=='Escape'){
          $(this).nextAll('.ui-icon-close').trigger('click')
          return false
        }
      })
      return this
  }
})(jQuery)
