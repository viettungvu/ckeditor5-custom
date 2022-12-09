import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Utils from '../utils/utils';
import { ControlType, DefaultColors, BackgroundColorClass } from '../../enums/enums';
export default class ControlEditing extends Plugin {
    static get requires() {
        return [Widget];
    }

    init() {
        const editor = this.editor;
        this._defineSchema();
        this._defineConverters();
        this._defineClipboardInputOutput();
        this._defineProperty();
        editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement(editor.model, viewElement => viewElement.hasClass('t-control'))
        );
        editor.config.define('katexConf', {
            outputType: 'span',
            forceOutputType: false,
            katexRenderOptions: {
                throwOnError: false,
                display: false
            }
        });

    }
    _defineSchema() {
        const schema = this.editor.model.schema;
        //#region Define Schema Widget Control
        schema.register('t-control', {
            allowWhere: '$text',
            isInline: true,
            isObject: true,
            allowAttributes: ['id', 'values', 'type', 'classes']
        });
        //#endregion
    }
    _defineConverters() {
        const conversion = this.editor.conversion;
        //#region Convert Widget Control

        // Data-to-model conversion.
        conversion.for('upcast').elementToElement({
            view: {
                name: 'div',
                classes: ['t-control']
            },
            model: (viewElement, { writer }) => {
                return writer.createElement('t-control', getControlDataFromViewElement(viewElement));
            }
        });

        // Model-to-data conversion.
        conversion.for('dataDowncast').elementToElement({
            model: 't-control',
            view: (modelItem, { writer: viewWriter }) => createControlView(modelItem, viewWriter)
        });

        // Model-to-view conversion.
        conversion.for('editingDowncast').elementToElement({
            model: 't-control',
            view: (modelItem, { writer: viewWriter }) => toWidget(createControlView(modelItem, viewWriter), viewWriter)
        });
        //#endregion

        //
        function createControlView(modelItem, viewWriter) {
            const id = modelItem.getAttribute('id');
            const values = modelItem.getAttribute('values');
            const type = modelItem.getAttribute('type');
            const classes=modelItem.getAttribute('classes');
            let cardView;
            try {
                if (type === ControlType.LUA_CHON) {
                    const optionsView = values.map((v, index) => viewWriter.createRawElement('span', { value: v.value, 'data-equation': v.equation }, function (domElement) {
                        domElement.innerHTML = v.text == '' ? Utils.renderEquationString(v.equation) : v.text;
                    }));
                    cardView = viewWriter.createContainerElement('div', { class: classes, 'data-type': type, 'data-id': id}, viewWriter.createContainerElement('span', { class: 'number-options', 'data-value': 'Chọn' }, [
                        viewWriter.createContainerElement('input', { type: 'hidden', value: '', name: 'ANS_LUA_CHON_' + id }),
                        viewWriter.createContainerElement('span', {}, optionsView)
                    ]))
                }
                else if (type === ControlType.NHAP) {
                    return viewWriter.createContainerElement('div', { class: classes, 'data-type': type, 'data-id': id},
                        viewWriter.createContainerElement('span', { class: 'input-number' }, viewWriter.createContainerElement('input', { class: 'katex', type: 'text', name: 'ANS_' + id }))
                    );
                }
                else if (type === ControlType.PHAN_SO) {
                    var childrenElements = [];

                    if (values.tuSo == '') {
                        childrenElements.push(viewWriter.createContainerElement('span', { class: 'tu-so', value: '' }, viewWriter.createContainerElement('input', { type: 'text', class:'katex', name: 'ANS_TU_SO_' + id })));
                    }
                    else {
                        childrenElements.push(viewWriter.createContainerElement('span', { class: 'tu-so', value: values.tuSo }, viewWriter.createRawElement('span', {}, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.tuSo);
                        })));
                    }
                    if (values.mauSo == '') {
                        childrenElements.push(viewWriter.createContainerElement('span', { class: 'mau-so', value: '' }, viewWriter.createContainerElement('input', { type: 'text',class:'katex', name: 'ANS_MAU_SO_' + id })));
                    }
                    else {
                        childrenElements.push(viewWriter.createContainerElement('span', { class: 'mau-so', value: values.mauSo }, viewWriter.createRawElement('span', {}, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.mauSo);
                        })));
                    }
                    cardView = viewWriter.createContainerElement('div', { class: classes, 'data-type': type, 'data-id': id}, viewWriter.createContainerElement('span', { class: 'frac frac-input' }, childrenElements));
                }
                else if (type === ControlType.PHEP_CHIA) {
                    let firstChilds = [];
                    let secondChilds = [];
                    if (values.soBiChia == '') {
                        firstChilds.push(viewWriter.createContainerElement('span', {class:'so-bi-chia'}, viewWriter.createContainerElement('input', { class: 'katex ', type: 'text', name:'ANS_SO_BI_CHIA_'+id })));
                    }
                    else {
                        firstChilds.push(viewWriter.createContainerElement('span', {class: 'so-bi-chia', value: values.soBiChia }, viewWriter.createRawElement('span', { }, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.soBiChia);
                        })));
                    }
                    if (values.soChia == '') {
                        secondChilds.push(viewWriter.createContainerElement('span', {class:'so-chia'}, viewWriter.createContainerElement('input', { class: 'katex', type: 'text',name:'ANS_SO_CHIA_'+id })));
                    }
                    else {
                        secondChilds.push(viewWriter.createRawElement('span', { class: 'so-chia', value: values.soChia }, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.soChia);
                        }));
                    }

                    if (values.thuongSo == '') {
                        secondChilds.push(viewWriter.createContainerElement('span', {class:'thuong-so'}, viewWriter.createContainerElement('input', { class: 'katex', type: 'text' ,name:'ANS_SO_THUONG_'+id})));
                    }
                    else {
                        secondChilds.push(viewWriter.createRawElement('span', { class: 'thuong-so', value: values.thuongSo }, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.thuongSo);
                        }));
                    }
                    if (values.soDu == '') {
                        firstChilds.push(viewWriter.createContainerElement('span', {class: 'so-du'}, viewWriter.createContainerElement('input', { class: 'katex', type: 'text' })));
                    }
                    else {
                        firstChilds.push(viewWriter.createRawElement('span', { class: 'so-du', value: values.soDu }, function (domElement) {
                            domElement.innerHTML = Utils.renderEquationString(values.soDu);
                        }));
                    }

                    cardView = viewWriter.createContainerElement('div', { class: classes, 'data-type': type, 'data-id': id}, viewWriter.createContainerElement('span', { class: 'division' }, [
                        viewWriter.createContainerElement('span', {class:'division__left'}, firstChilds),
                        viewWriter.createContainerElement('span', {class:'division__right'}, secondChilds),
                    ]));
                }
                else {
                    console.error('CreateControlView: Unsupported control');
                }
            } catch (error) {
                console.error('CreateControlView: ' + error);
                return;
            }

            return cardView;
        }

        function getControlDataFromViewElement(viewElement) {
            try {
                const controlId = viewElement?.is('element', 'div') ? viewElement.getAttribute('data-id') : genId();
                const children = Array.from(viewElement.getChildren());
                const controlType = viewElement.getAttribute('data-type');
                const elementClasses=Array.from(viewElement.getClassNames());
                const filteredArray = BackgroundColorClass.filter(value => elementClasses.includes(value));
                let controlClasses='';
                if(filteredArray.length==0){
                    controlClasses+='t-control ' + BackgroundColorClass[controlId % BackgroundColorClass.length];
                }
                else{
                    if(!elementClasses.includes('t-control')){
                        elementClasses.push('t-control');
                    }
                    controlClasses=elementClasses.join(' ');
                }
                if (controlType === ControlType.LUA_CHON) {
                    try {
                        let values = children.map(e => {
                            if (e.is('element', 'span')) {
                                return {
                                    value: Utils.getInputValue(e),
                                    text: Utils.renderEquationString(Utils.getText(e)),
                                    equation: Utils.getEquation(e)
                                }
                            }
                        })

                        return {
                            id: controlId,
                            values: values,
                            type: controlType,
                            classes:controlClasses,
                        };
                    } catch (error) {
                        console.error('[getControlDataFromView]-luachon: ' + error);
                    }
                }
                else if (controlType === ControlType.PHAN_SO) {
                    try {
                        const phanSoElement=children.find(e=>e.is('element', 'span')  && e.hasClass('frac','frac-input'));
                        const phanSoChild=Array.from(phanSoElement.getChildren());
                        const tuSoElement = phanSoChild.find(element => (element.is('element', 'span')) && element.hasClass('tu-so'));
                        const mauSoElement = phanSoChild.find(element => (element.is('element', 'span')) && element.hasClass('mau-so'));
                        return {
                            id: controlId,
                            values: {
                                tuSo: Utils.getInputValue(tuSoElement),
                                mauSo: Utils.getInputValue(mauSoElement)
                            },
                            type: controlType,
                            classes:controlClasses,
                        }
                    } catch (error) {
                        console.error('[getControlDataFromView]-phanso: ' + error);
                    }

                }
                else if (controlType === ControlType.NHAP) {
                    try {
                        return {
                            id: controlId,
                            values: {},
                            type: controlType,
                            classes:controlClasses,
                        }
                    } catch (error) {
                        console.error('[getControlDataFromView]-nhap: ' + error);
                    }
                }
                else if (controlType === ControlType.PHEP_CHIA) {
                    try {
                        const divisionElement=children.find(e=>e.is('element','span') && e.hasClass('division'));
                        const divisionLeftElement=divisionElement.getChild(0);
                        const divisionRightElement=divisionElement.getChild(1);
                        const soBiChiaElement =divisionLeftElement.getChild(0);
                        const soDuElement = divisionLeftElement.getChild(1);
                        const soChiaElement =divisionRightElement.getChild(0);
                        const thuongElement = divisionRightElement.getChild(1);
                        return {
                            id: controlId,
                            values: {
                                soBiChia: Utils.getInputValue(soBiChiaElement),
                                soChia: Utils.getInputValue(soChiaElement),
                                thuongSo: Utils.getInputValue(thuongElement),
                                soDu: Utils.getInputValue(soDuElement),
                            },
                            type: controlType,
                            classes:controlClasses,
                        }
                    } catch (error) {
                        console.error('[getControlDataFromView]-phepchia: ' + error);
                    }
                }
                else {
                    console.error('[getControlDataFromView]: Unsupported control');
                    return {
                        id: 'chua-xu-ly',
                        values: [],
                        type: 'unknow'
                    };
                }
            } catch (error) {
                console.error(error.stack);
            }
        }





    }
    // Integration with the clipboard pipeline.
    _defineClipboardInputOutput() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;

        // Processing pasted or dropped content.
        this.listenTo(viewDocument, 'clipboardInput', (evt, data) => {
            // The clipboard content was already processed by the listener on the higher priority
            // (for example while pasting into the code block).
            if (data.content) {
                return;
            }

            const controlData = data.dataTransfer.getData('control');

            if (!controlData) {
                return;
            }

            // Use JSON data encoded in the DataTransfer.
            const control = JSON.parse(controlData);
            // Translate the h-card data to a view fragment.
            const writer = new UpcastWriter(viewDocument);
            const fragment = writer.createDocumentFragment();
            try {
                const sharedId = this._getControlCounter();
                if (control.type === ControlType.LUA_CHON) {
                    const optionsElement = control.values.map((v, index) =>
                        writer.createElement('span', { value: `opt_${index}_${sharedId}`, 'data-equation': v }, v)
                    );
                    writer.appendChild(
                        writer.createElement('div', { class: 't-control', 'data-type': control.type, 'data-id': sharedId }, optionsElement),
                        fragment);
                    this._increaseControlCounter(sharedId);
                }
                else if (control.type === ControlType.NHAP) {
                    writer.appendChild(
                        writer.createElement('div', { class: 't-control', 'data-type': control.type, 'data-id': sharedId }, [
                        ]),
                        fragment
                    );
                    this._increaseControlCounter(sharedId);
                }
                else if (control.type === ControlType.PHEP_CHIA) {
                    if (control.values) {
                        var firstChilds=[
                            writer.createElement('span', { class: 'so-bi-chia', value: control.values.soBiChia||'' }),
                            writer.createElement('span', { class: 'so-du', value: control.values.soDu||'' })
                        ];
                        var secondChilds=[
                            writer.createElement('span', { class: 'so-chia', value: control.values.soChia||'' }),
                            writer.createElement('span', { class: 'so-thuong', value: control.values.thuongSo||'' })
                        ];
                        
                        writer.appendChild(
                            writer.createElement('div', { class: 't-control', 'data-type': control.type, 'data-id': sharedId }, writer.createElement('span', { class: 'division' }, [
                                writer.createElement('span', {class:'division__left'}, firstChilds),
                                writer.createElement('span', {class:'division__right'}, secondChilds),
                            ])),
                            fragment
                        );
                        this._increaseControlCounter(sharedId);
                    }
                }
                else if (control.type === ControlType.PHAN_SO) {
                    if (control.values) {
                        var childrenElements = [
                            writer.createElement('span', { class: 'tu-so', value: control.values.tuSo }),
                            writer.createElement('span', { class: 'mau-so', value: control.values.mauSo }),
                        ];
                        writer.appendChild(
                            writer.createElement('div', { class: 't-control', 'data-type': control.type, 'data-id': sharedId }, writer.createElement('span', {class:'frac frac-input'}, childrenElements)),
                            fragment
                        );
                        this._increaseControlCounter(sharedId);
                    }
                }
                else {
                    console.error('Unsupported control');
                }
            } catch (error) {
                console.error('Error from _defineClipboard: ' + error);
            }
            // Provide the content to the clipboard pipeline for further processing.
            data.content = fragment;
        });

        // Processing copied, pasted or dragged content.
        this.listenTo(document, 'clipboardOutput', (evt, data) => {
            if (data.content.childCount != 1) {
                return;
            }

            const viewElement = data.content.getChild(0);
            if (viewElement.is('element', 'div') && viewElement.hasClass('t-control')) {
                data.dataTransfer.setData('control', JSON.stringify(getCardDataFromViewElement(viewElement)));
            }
        });
    }

    _increaseControlCounter(currentCounter) {
        try {
            this.set('controlCounter', ++currentCounter);
        } catch (error) {
            console.error('Cannot increase control counter');
        }

    }

    _decreaseControlCounter(currentCounter) {
        try {
            this.set('controlCounter', --currentCounter);
        } catch (error) {
            console.error('Cannot decrease control counter');
        }
    }

    _getControlCounter() {
        const counter = this.controlCounter;
        if (counter == null || counter == 'undefined') {
            this._increaseControlCounter(0);
            return 1;
        }
        return counter;
    }

    _defineProperty() {
        this.set('controlCounter', 1);
    }

    _setDataTransfer(evt, name, value) {
        evt.dataTransfer.setData(name, value);
    }


}
