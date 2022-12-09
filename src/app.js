import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import { ControlType, BackgroundColorClass } from '../enums/enums';
import Control from '../plugins/control_plugin/control';
import Math from '../plugins/math_plugin/math';
import icons from '@ckeditor/ckeditor5-core/theme/icons/object-size-full.svg';

class CKEditor extends ClassicEditor {
    static ControlType = ControlType;
    static BackgroundColorClass = BackgroundColorClass;
};
CKEditor.builtinPlugins = [
    Essentials,
    Bold,
    Italic,
    Heading,
    Paragraph,
    Alignment,
    GeneralHtmlSupport,
    Control,
    Math,
    Image, ImageResizeEditing, ImageResizeHandles, ImageResize,
    SimpleUploadAdapter,
    ImageUpload, ImageInsert,
    List,
    Table, TableToolbar, TableCaption, TableColumnResize,
    SourceEditing,
];
// Editor configuration.
CKEditor.defaultConfig = {
    language: 'vi',
    htmlSupport: {
        allow: [ /* HTML features to allow */ ],
        disallow: [ /* HTML features to disallow */ ]
    },
    toolbar: {
        items: [
            'undo', 'redo',
            '|',
            'heading',
            '|',
            'bold', 'italic',
            '|',
            'bulletedList', 'numberedList',
            '|',
            'alignment', 'uploadImage', 'resizeImage',
            '|',
            'math',
            '|',
            'sourceEditing'
        ]
    },
    alignment: {
        options: ['left', 'right', 'center', 'justify']
    },
    simpleUpload: {
        uploadUrl: 'http://example.com',
        withCredentials: true,
        headers: {
            'X-CSRF-TOKEN': 'CSRF-Token',
            Authorization: 'Bearer <JSON Web Token>'
        }
    },
    image: {
        resizeOptions: [{
                name: 'resizeImage:original',
                value: null,
                icon: 'original'
            },
            {
                name: 'resizeImage:25',
                value: '25',
                icon: 'small'
            },
            {
                name: 'resizeImage:50',
                value: '50',
                icon: 'medium'
            },
            {
                name: 'resizeImage:75',
                value: '75',
                icon: 'large'
            }
        ]
    }
}
export default CKEditor;