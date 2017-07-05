var img = $('#image');
var pos_label = $('#pos-label');

var download_btn = $('#download-btn');
var download_a = $('#download-a');
var upload_btn = $('#upload-btn');
var upload_fc = $('#upload-fc');
var no_ball_btn = $('#no-ball-btn');

var progress_bar = $('#progress-bar');

var current_row = 1; // 1-based
var n_complete = 0;

var info = {
    'w': 1920,
    'h': 1080,
    'n': 100
};

function get_xy(e) {
    var cx = e.pageX - img.offset().left;
    var cy = e.pageY - img.offset().top;
    var sw = img.width();
    var sh = img.height();

    var x = Math.round(cx * info['w'] / sw);
    var y = Math.round(cy * info['h'] / sh);
    x = Math.max(Math.min(x, info['w']), 0);
    y = Math.max(Math.min(y, info['h']), 0);

    return [x, y];
}

function get_labels() {
    var rows = $('#label-table tbody tr').get();
    var names = [];
    var xs = [];
    var ys = [];
    if (rows.length == 0) { // no labels
        return;
    }

    $.each(rows, function (idx, row) {
        names.push($(row).children('td').eq(0).text());
        xs.push(parseInt($(row).children('td').eq(1).text()));
        ys.push(parseInt($(row).children('td').eq(2).text()));
    });

    return [names, xs, ys];
}

function update_label(x, y) {
    var elem = $('#label-table tbody tr:nth-child(' + current_row + ')');
    var labeled = elem.children('td:nth-child(2)').text() != '';

    elem.children('td:nth-child(2)').html('' + x);
    elem.children('td:nth-child(3)').html('' + y);

    update_label_color(current_row, current_row + 1);
    current_row += 1;

    if (!labeled) {
        n_complete += 1;
        var percent = Math.round(n_complete / info['n'] * 100);
        progress_bar.css('width', '' + percent + '%');
        progress_bar.html('' + percent + '%');
    }        
}

function update_label_color(prev, now) {
    $('#label-table tbody tr:nth-child(' + prev + ')').css('color', 'black');
    $('#label-table tbody tr:nth-child(' + now + ')').css('color', 'cornflowerblue');
}

function init_img() {
    img.mouseup(function (e) {
        xy = get_xy(e);
        x = xy[0];
        y = xy[1];

        update_label(x, y);
    });

    img.mousemove(function (e) {
        xy = get_xy(e);
        x = xy[0];
        y = xy[1];

        pos_label.attr('placeholder', '(' + x + ',' + y + ')');
    });
}

function init_btn() {
    download_a.click(function (e) {
        var labels = get_labels();
        console.log(labels);
        var data = JSON.stringify({
            'names': labels[0],
            'xs': labels[1],
            'ys': labels[2]
        });

        var d = new Date();
        var date = d.toISOString().substring(0, 10);
        var time = d.toTimeString().substring(0, 8);

        download_a.attr('href', 'data:text/plain;charset=UTF-8,' + data);
        download_a.attr('download', '[ball]' + (date + ' ' + time) + '.json');
    });

    download_btn.click(function (e) {
        download_a[0].click();
    });

    upload_fc.change(function (e) {
        var files = upload_fc.prop('files');
        if (files.length == 1 && files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                var b64 = e.target.result.split(',', 2)[1];
                var data = JSON.parse(window.atob(b64));

                var tbody = $('#label-table tbody');
                tbody.children('tr').remove();

                var names = data['names'];
                var xs = data['xs'];
                var ys = data['ys'];
                for (var idx in names) {
                    var template = 
                        '<tr>' +
                        '<td>' + names[idx] + '</td>' + 
                        '<td>' + xs[idx] + '</td>' + 
                        '<td>' + ys[idx] + '</td>' + 
                        '</tr>';
                    tbody.append(template);
                }
            }
            reader.readAsDataURL(files[0]);
        }
    });

    upload_btn.click(function (e) {
        upload_fc[0].click();
    });

    no_ball_btn.click(function(e) {
        update_label(-1, -1);
    });
}

function init_table() {
    var rows = $('#label-table tbody tr').get();

    $.each(rows, function(idx, row) {
        var elem = $(row);
        elem.click(function() {
            update_label_color(current_row, idx + 1);
            current_row = idx + 1;
            // switch image
        });
    });

    update_label_color(1, 1);
}

$(function () {
    init_img();
    init_btn();
    init_table();

    key('n', function(e) {
        update_label(-1, -1);
    });
});