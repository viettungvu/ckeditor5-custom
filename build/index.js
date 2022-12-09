const TypeOfCk = {
    CAU_HOI: 1,
    LOI_GIAI: 2,
    DAP_AN: 3
}
var editors;
let controlInserted = 0
let map = []
const TYPE = CKEditor.ControlType
const DEFAULT_COLORS = CKEditor.DefaultColors
function createEditor(editorId, type = TypeOfCk.CAU_HOI, placehoder='',data = '') {
    const editorContent = $('#' + editorId).find('.question-editor__content')
    return CKEditor
        .create(editorContent[0], {
            katexConf: {
                outputType: 'span',
                forceOutputType: false,
                katexRenderOptions: {
                    throwOnError: false,
                    display: false
                }
            },
            math: {
                engine: "katex",
                katexRenderOptions: {
                    throwOnError: false,
                    output: 'html'
                },
            },
            placeholder: placehoder,
            initalData:data,
        })
        .then(editor => {
            editors.set(editorId, editor);
            editor.setData(data);
            console.log('[' + editor.id + ']: Editor has been initalized successful')

            editor.model.document.on('change:data', (evt) => {
                try {
                    const changes = editor.model.document.differ.getChanges({ includeChangesInGraveyard: true })
                    const lastChanges = changes[changes.length - 1]
                    if (lastChanges.type === 'remove' && lastChanges.name === 't-control') {
                        const prevPath = lastChanges.position.path
                        const currentPath = editor.model.document.selection.getFirstPosition().path
                        if (JSON.stringify(prevPath) === JSON.stringify(currentPath)) {
                            const mapAttrs = lastChanges.attributes
                            removeAnswerInput(mapAttrs.get('id'))
                        }
                    }
                    if (lastChanges.type === 'insert' && lastChanges.name === 't-control') {
                        if(type==TypeOfCk.CAU_HOI){
                            const mapAttrs = lastChanges.attributes
                            const type = mapAttrs.get('type')
                            const controlId = mapAttrs.get('id')
                            const values = mapAttrs.get('values')
                            if (type === TYPE.PHAN_SO) {
                                createAnwserInput(type, controlId, values)
                            }
                            else if (type === TYPE.LUA_CHON) {
                                createAnwserInput(type, controlId, values)
                            }
                            else if (type === TYPE.PHEP_CHIA) {
                                createAnwserInput(type, controlId, values)
                            }
                            else if (type === TYPE.NHAP) {
                                createAnwserInput(type, controlId)
                            }
                            else {
                                console.error('Unsupported control')
                            }
                        }
                    }
                    updateLivePreview(editorId)
                    console.log(editor)
                }
                catch (err) {
                    console.log(err)
                }
            })
            editor.model.document.on('change', (evt, name, value) => {
                $('.answer-box').removeClass('highlight')
                const selectedElement = editor.model.document.selection.getSelectedElement()
                if (selectedElement != null && selectedElement.name === 't-control') {
                    const selectedElementId = selectedElement.getAttribute('id')
                    $('.answer-box[data-id="' + selectedElementId + '"]').addClass('highlight')
                }

            })
            editor.editing.view.document.on('paste', (evt, data) => {
                console.log(data)
                console.log('pasted')
            })
            editor.plugins.get('ClipboardPipeline').on('contentInsertion', (evt, data) => {
                console.log('Content was inserted.')
            }, { priority: 'lowest' })
        })
        .catch(err => console.error(err))
}
$(document).ready(function (e) {
    editors=new Map();
    init();
})

function init(){
    const eQuestionTmpl=$.templates('#EDITOR_CAU_HOI');
    const editorQuestion=eQuestionTmpl.render({editorId:'editor-cau-hoi'});
    $('#box-editor-question').append(editorQuestion);

    const eSolveTmpl=$.templates('#EDITOR_LOI_GIAI');
    const editorSolve=eSolveTmpl.render({editorId:'editor-loi-giai'});
    $('#box-editor-solve').append(editorSolve);
    createEditor('editor-cau-hoi',TypeOfCk.CAU_HOI, 'Nhập nội dung câu hỏi', 'abc')
    createEditor('editor-loi-giai',TypeOfCk.LOI_GIAI, 'Nhập lời giải')
    setTimeout(()=>bindActionEditor(), 500);
}

function bindActionEditor(){
   const editorKeys=(Array.from(editors.keys()));
   editorKeys.forEach((editorId)=>{
        $('#lua-chon-form'+editorId).submit((e) => {
            e.preventDefault()
            let options = $(e.target).find('[name="inputOptions"]').val()
            let values = options.split('\n').filter(v => v && v != '')
            values = values.length <= 0 ? [0] : values
            map = map.filter(x => x.type != TYPE.LUA_CHON)
            map.push({
                type: TYPE.LUA_CHON,
                values: values
            })
            $('[aria-labelledby="dropdownMenuButton4"]').removeClass('show')
        })
        $('#lua-chon-form'+editorId).on('reset', (e) => {
            map = map.filter(x => x.type != TYPE.LUA_CHON)
            $('[aria-labelledby="dropdownMenuButton4"]').removeClass('show')
        })
    
        $('#phanso-form'+editorId).submit((e) => {
            e.preventDefault()
            const form = $(e.target)
            let tuSo = form.find('[name="inputTuSo"]').val()
            let mauSo = form.find('[name="inputMauSo"]').val()
            map = map.filter(x => x.type != TYPE.PHAN_SO)
            map.push({
                type: TYPE.PHAN_SO,
                values: {
                    tuSo: tuSo,
                    mauSo: mauSo
                }
            })
            $('[aria-labelledby="dropdownMenuButton2"]').removeClass('show')
        })
        $('#phanso-form'+editorId).on('reset', (e) => {
            map = map.filter(x => x.type != TYPE.PHAN_SO)
            $('[aria-labelledby="dropdownMenuButton2"]').removeClass('show')
        })
    
    
    
        $('#phep-chia-form'+editorId).submit((e) => {
            e.preventDefault()
            const form = $(e.target)
            const soBiChia = form.find('[name="inputSoBiChia"]').val()
            const soChia = form.find('[name="inputSoChia"]').val()
            const thuong = form.find('[name="inputThuong"]').val()
            const soDu = form.find('[name="inputSoDu"]').val()
            map = map.filter(x => x.type != TYPE.PHEP_CHIA)
            map.push({
                type: TYPE.PHEP_CHIA,
                values: {
                    soBiChia: soBiChia,
                    soChia: soChia,
                    thuongSo: thuong,
                    soDu: soDu
                }
            })
            $('[aria-labelledby="dropdownMenuButton1"]').removeClass('show')
        })
        $('#phep-chia-form'+editorId).on('reset', (e) => {
            map = map.filter(x => x.type != TYPE.PHAN_SO)
            $('[aria-labelledby="dropdownMenuButton1"]').removeClass('show')
        })
    
        $('.btn-reset-ckcontent'+editorId).click((e) => {
            e.preventDefault()
            const parent = $(e.target).parents('.question-editor')
            console.log(parent.attr('id'))
            editors[parent.attr('id')].setData('')
        })
      
        
        $('#selectBoxOptions'+editorId).on('dragstart', event => {
            const target = event.target.nodeType == 1 ? event.target : event.target.parentElement
            const draggable = target.closest('[draggable]')
            const evt = event.originalEvent
            evt.dataTransfer.setData('text/plain', draggable.innerText)
            evt.dataTransfer.setData('text/html', draggable.innerText)
            const controlType = draggable.getAttribute('data-type').toLowerCase()
            const sharedId = ""
            if (controlType === 'lua-chon') {
                let storageControl = map.find(i => i.type == TYPE.LUA_CHON)
                if (storageControl && storageControl.values) {
                    ;
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: storageControl.values, type: TYPE.LUA_CHON }))
                }
                else {
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: [], type: TYPE.LUA_CHON }))
                }
            }
            else if (controlType === 'nhap') {
                evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: [], type: TYPE.NHAP }))
            }
            else if (controlType === 'phan-so') {
                let storageControl = map.find(i => i.type == TYPE.PHAN_SO)
                if (storageControl && storageControl.values) {
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: storageControl.values, type: TYPE.PHAN_SO }))
                }
                else {
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: { tuSo: '', mauSo: '' }, type: TYPE.PHAN_SO }))
                }
            }
            else if (controlType === 'phep-chia') {
                let storageControl = map.find(i => i.type == TYPE.PHEP_CHIA)
                if (storageControl && storageControl.values) {
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: storageControl.values, type: TYPE.PHEP_CHIA }))
                }
                else {
                    evt.dataTransfer.setData('control', JSON.stringify({ id: sharedId, values: { soBiChia: '', soChia: '', soDu: '', thuongSo: '' }, type: TYPE.PHEP_CHIA }))
                }
            } else {
                console.error('Unsupported control')
            }
            evt.dataTransfer.setDragImage(draggable, 0, 0)
        })
    
        $('#collapseToolboxQuestion'+editorId).on('show.bs.collapse', (e) =>{
            $(e.target).siblings('.question-group__left').addClass('has-selectbox')
        })
        $('#collapseToolboxQuestion'+editorId).on('hide.bs.collapse', (e)=>{
            $(e.target).siblings('.question-group__left').removeClass('has-selectbox')
        })
    
        $('#collapseDragEquationQuestion'+editorId).on('show.bs.collapse', (e) =>{
            const editorId=$(e.target).data('editor-id');
            $('#'+editorId).find('.question-group__left').addClass('select-box__opened')
        })
        $('#collapseDragEquationQuestion'+editorId).on('hide.bs.collapse', (e)=> {
            const editorId=$(e.target).data('editor-id');
            $('#'+editorId).find('.question-group__left').removeClass('select-box__opened')
        })
    
        $('#preview'+editorId).on('shown.bs.collapse', (e) => {
            updateLivePreview(editorId);
        })
    });
    $('#btn-save-data').click(function(e){
        e.preventDefault();
        submitQuestionData();
    });
}

function getEditorContent(editorId, removePTag = true) {
    try {
        let ckContent = editors.get(editorId).getData()

        //Replace p tag by nothing
        //if (ckContent.startsWith('<p>')) {
        //    ckContent = ckContent.replace(/<p>(.*)<\/p>/, '$1')
        //}
        return ckContent
    } catch (e) {
        console.error(e.stack)
    }

}
//#region Create/Delete answer box
function createAnwserInput(type, id, values) {
    if (id != '') {
        if ($('.answer-box[data-id="' + id + '"]').length == 0) {
            const bgColor = DEFAULT_COLORS[id % DEFAULT_COLORS.length]
            if (type === TYPE.NHAP) {
                var template = $.templates('#NHAP')
                var htmlOutput = template.render({ id: id, bgColor: bgColor })
                $("#form-dap-an").append(htmlOutput)
            }
            else if (type === TYPE.PHAN_SO) {
                var template = $.templates('#PHAN_SO')
                var htmlOutput = template.render({ id: id, values: values, bgColor: bgColor })
                $("#form-dap-an").append(htmlOutput)
            }
            else if (type === TYPE.LUA_CHON) {
                var template = $.templates('#LUA_CHON')

                var htmlOutput = template.render({ id: id, values: values, bgColor: bgColor })
                $("#form-dap-an").append(htmlOutput)
            }
            else if (type === TYPE.PHEP_CHIA) {
                var template = $.templates('#PHEP_CHIA')
                var htmlOutput = template.render({ id: id, values: values, bgColor: bgColor })
                $("#form-dap-an").append(htmlOutput)
            }
            else {
                console.error('Invalid control type')
            }
        }
        else {
        }
    }
    else {
        console.error('invalid control id')
    }
}

function removeAnswerInput(id) {
    if (id != '') {
        if ($('.t-control.ck-widget[data-id="' + id + '"]').length === 1) {
            $('.answer-box[data-id="' + id + '"]').remove()
        }
    }
}

function updateValueInputDapAnTuEditor(editorId, value) {
    $('box-dap-an').find(editorId).val(value)
}
///Cập nhật trực tiếp data từ editor xuống box xem trước
function updateLivePreview(editorId) {
    try {
        const previewBox = $('#preview'+editorId);
        var isExpanded = previewBox.hasClass('show');
        if (isExpanded) {
            const editor = editors.get(editorId);
            if (editor != null) {
                const editorContent = editor.getData();
                previewBox.find('.question-preview').html(editorContent);
            }
        }
    } catch (error) {
        console.error(error.stack);
    }
}



function submitQuestionData(){
    const chuDiemId=$('[name="select_chu_diem"]').val();
    const noiDungCauHoi=getEditorContent('editor-cau-hoi');
    const noiDungLoiGiai=getEditorContent('editor-loi-giai');
    var formDapAn=$('#form-dap-an').serializeArray();
    console.log(noiDungCauHoi);
    console.log(noiDungLoiGiai);
    console.log(formDapAn);

    $.ajax({
        type:'POST',
        url:'',
        dataType:'json',
        success:function(e){

        },
        error:function(e){
            console.error(e.stack);
        }
    })
}