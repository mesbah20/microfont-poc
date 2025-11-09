export const QUILL_MIN_EDITOR = {
  toolbar: [

    ['bold', 'italic', 'underline'],              // custom button values
    [{'header': [1, 2, 3, 4, 5, 6, false]}],
    [{'font': []}],
    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
    [{'script': 'sub'}, {'script': 'super'}],
    ['line-height']
  ]
};

export const QUILL_EDITOR_FOR_SPECS = {
  toolbar: [

    ['bold', 'italic', 'underline'],              // custom button values
    // [{'header': [1, 2, 3, 4, 5, 6, false]}],
    // [{'font': []}],
    // [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    // [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
    // [{'script': 'sub'}, {'script': 'super'}],

  ]
};

export const MEDIUM_EDITOR_CONFIG = {
  toolbar: [
    ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'Insert', 'RemoveFormat', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-',
      'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language', 'Link', 'Unlink', 'Anchor', 'Table', 'Styles', 'Image', 'Format', 'Font', 'FontSize', 'TextColor', 'BGColor', 'Maximize']
  ],
};

export const MIN_EDITOR_CONFIG = {
  toolbar: [
    ['Bold', 'Italic', 'Underline', 'NumberedList', 'BulletedList', 'Indent', 'line_height', 'Outdent', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', 'Subscript', 'Superscript', 'Styles', 'Image', 'Format', 'Font', 'FontSize', 'SpecialChar'],
  ],
};

export const QUILL_MAX_EDITOR = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],


    [{'header': 1}, {'header': 2}],               // custom button values
    [{'list': 'ordered'}, {'list': 'bullet'}],
    [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
    [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
    [{'direction': 'rtl'}],                         // text direction


    [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
    [{'header': [1, 2, 3, 4, 5, 6, false]}],


    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    [{'font': []}],
    [{'align': []}],


    ['clean'],                                         // remove formatting button
    ['specialChar'],

    ['link', 'image', 'video']                         // link and image, video
  ]
};
