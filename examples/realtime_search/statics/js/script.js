function watch(tags) {
    $.ajax({
        url: '/watch',
        data: {tags: tags},
        type: 'POST',
        dataType: 'text',
        success: function(item, status) {
            watch(tags);
            if(item != '') {
                $('#itemsList').prepend($('<li></li>').text(item));
            }
        }
    });
}

