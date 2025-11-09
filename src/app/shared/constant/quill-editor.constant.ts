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
    [{'header': [1, 2, 3, 4, 5, 6, false]}],
    [{'font': []}],
    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
    [{'script': 'sub'}, {'script': 'super'}],

  ]
};

export const MEDIUM_EDITOR_CONFIG = {
  toolbar: [
    // Text formatting
    ['bold', 'italic', 'underline', 'strike'],
    [{ script: 'sub' }, { script: 'super' }], // Subscript/Superscript

    // Lists, indentation
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],

    // Alignment
    [{ align: [] }],

    // Headers and block types
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['blockquote', 'code-block'],

    // Colors and fonts
    [{ color: [] }, { background: [] }],
    [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],

    // Direction, links, and media
    [{ direction: 'rtl' }],
    ['link', 'image', 'video'],

    // Clear formatting
    ['clean']
  ],
};


export const MIN_EDITOR_CONFIG = {
  toolbar: [
    // Basic text styling
    ['bold', 'italic', 'underline'],

    // Lists and indentation
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],

    // Alignment
    [{ align: [] }],

    // Subscript / Superscript
    [{ script: 'sub' }, { script: 'super' }],

    // Fonts and formatting
    [{ font: [] }, { size: [] }, { color: [] }],

    // Links and images (light media)
    ['link', 'image'],

    // Remove formatting
    ['clean']
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
