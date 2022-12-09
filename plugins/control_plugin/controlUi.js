
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';				
import ControlFormView from './controlView';
import {clickOutsideHandler}  from '@ckeditor/ckeditor5-ui';
export default class ControlUI extends Plugin {
    static get requires() {
		return [ ContextualBalloon ];
	}
    init() {
        const editor = this.editor;

        this._balloon = this.editor.plugins.get( ContextualBalloon );
        this.formView = this._createFormView();


        editor.ui.componentFactory.add( 'control', () => {
            const button = new ButtonView();

            button.label = 'Controls';
            button.tooltip = true;
            button.withText = true;


            this.listenTo( button, 'execute', () => {
                this._showUI();
            } );
            return button;
        } );
    }
    _createFormView() {
        const editor = this.editor;
        const formView = new ControlFormView( editor.locale );
        this.listenTo( formView, 'submit', () => {
            const mauSo = formView.titleInputView.fieldView.element.value;
            const tuSo = formView.abbrInputView.fieldView.element.value;
         
            editor.model.change( writer => {
                editor.model.insertContent(
                    writer.createText( `<math type="math/tex" data-value="\\frac{${tuSo}}{${mauSo}}"></math>`)
                );
            });
            this._hideUI();
        } );
        this.listenTo( formView, 'cancel', () => {
            this._hideUI();
        } );
        clickOutsideHandler( {
            emitter: formView,
            activator: () => this._balloon.visibleView === formView,
            contextElements: [ this._balloon.view.element ],
            callback: () => this._hideUI()
        } );
        return formView;
    }

    _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;
        let target = null;

        // Set a target position by converting view selection range to DOM.
        target = () => view.domConverter.viewRangeToDom(
            viewDocument.selection.getFirstRange()
        );

        return {
            target
        };
    }
    _showUI() {
        this._balloon.add( {
            view: this.formView,
            position: this._getBalloonPositionData()
        } );

        this.formView.focus();
    }
    _hideUI() {
        this.formView.abbrInputView.fieldView.value = '';
        this.formView.titleInputView.fieldView.value = '';
        this.formView.element.reset();

        this._balloon.remove( this.formView );

        // Focus the editing view after closing the form view.
        this.editor.editing.view.focus();
    }
}