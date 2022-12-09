import katex from 'katex';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
class Utils {
    static renderEquation(equation, element, renderOptions = { throwOnError: false, output: 'html' }) {
        katex.render(equation, element, {
            throwOnError: false,
            displayMode: true,
            ...renderOptions
        })
    }

    static renderEquationString(equation, renderOptions = { throwOnError: false, output: 'html' }) {
        if (equation == '') {
            return equation;
        }
        return katex.renderToString(equation, renderOptions);
    }

    static getText(viewElement) {
        return Array.from(viewElement.getChildren())
            .map(node => node.is('$text') ? node.data : '')
            .join('');
    }


    static getEquation(viewElement) {
        const equation = viewElement?.getAttribute('data-equation') || '';
        return equation;
    }
    static getInputValue(viewElement) {
        const value = viewElement?.getAttribute('value') || '';
        if (value == 'undefined') {
            value = '';
        }
        return value;
    }

    static getOptionDataId(optionElement) {
        const value = optionElement?.getAttribute('data-id') || '';
        if (value == 'undefined') {
            value = '';
        }
        return value;
    }


    static reRenderContent(content) {
        if (content == '' || content === 'undefined') {
            return '';
        }
        else {
            const matches = content.replace(/[KATEX](.*)[/KATEX]/ig, Utils.renderEquationString('$1'));
        }
    }



    //#region For math plugin


    static getSelectedMathModelWidget(selection) {
        const selectedElement = selection.getSelectedElement();

        if (selectedElement && (selectedElement.is('element', 'mathtex-inline') || selectedElement.is('element', 'mathtex-display'))) {
            return selectedElement;
        }

        return null;
    }

    // Simple MathJax 3 version check
    static isMathJaxVersion3(version) {
        return version && typeof version === 'string' && version.split('.').length === 3 && version.split('.')[0] === '3';
    }

    // Check if equation has delimiters.
    static hasDelimiters(text) {
        return text.match(/^(\\\[.*?\\\]|\\\(.*?\\\))$/);
    }

    // Find delimiters count
    static delimitersCounts(text) {
        return text.match(/(\\\[|\\\]|\\\(|\\\))/g).length;
    }

    // Extract delimiters and figure display mode for the model
    static extractDelimiters(equation) {
        equation = equation.trim();

        // Remove delimiters (e.g. \( \) or \[ \])
        const hasInlineDelimiters = equation.includes('\\(') && equation.includes('\\)');
        const hasDisplayDelimiters = equation.includes('\\[') && equation.includes('\\]');
        if (hasInlineDelimiters || hasDisplayDelimiters) {
            equation = equation.substring(2, equation.length - 2).trim();
        }

        return {
            equation,
            display: hasDisplayDelimiters
        };
    }

    static async renderEquation(
        equation, element, engine = 'katex', lazyLoad, display = false, preview = false, previewUid, previewClassName = [],
        katexRenderOptions = {}
    ) {
        if (engine === 'mathjax' && typeof MathJax !== 'undefined') {
            if (Utils.isMathJaxVersion3(MathJax.version)) {
                Utils.selectRenderMode(element, preview, previewUid, previewClassName, el => {
                    renderMathJax3(equation, el, display, () => {
                        if (preview) {
                            Utils.moveAndScaleElement(element, el);
                            el.style.visibility = 'visible';
                        }
                    });
                });
            } else {
                Utils.selectRenderMode(element, preview, previewUid, previewClassName, el => {
                    // Fixme: MathJax typesetting cause occasionally math processing error without asynchronous call
                    global.window.setTimeout(() => {
                        Utils.renderMathJax2(equation, el, display);

                        // Move and scale after rendering
                        if (preview) {
                            // eslint-disable-next-line
                            MathJax.Hub.Queue(() => {
                                Utils.moveAndScaleElement(element, el);
                                el.style.visibility = 'visible';
                            });
                        }
                    });
                });
            }
        } else if (engine === 'katex' && typeof katex !== 'undefined') {
            Utils.selectRenderMode(element, preview, previewUid, previewClassName, el => {
                katex.render(equation, el, {
                    throwOnError: false,
                    displayMode: display,
                    ...katexRenderOptions
                });
                if (preview) {
                    Utils.moveAndScaleElement(element, el);
                    el.style.visibility = 'visible';
                }
            });
        } else if (typeof engine === 'function') {
            engine(equation, element, display);
        } else {
            if (typeof lazyLoad !== 'undefined') {
                try {
                    if (!global.window.CKEDITOR_MATH_LAZY_LOAD) {
                        global.window.CKEDITOR_MATH_LAZY_LOAD = lazyLoad();
                    }
                    element.innerHTML = equation;
                    await global.window.CKEDITOR_MATH_LAZY_LOAD;
                    renderEquation(equation, element, engine, undefined, display, preview, previewUid, previewClassName, katexRenderOptions);
                }
                catch (err) {
                    element.innerHTML = equation;
                    console.error(`math-tex-typesetting-lazy-load-failed: Lazy load failed: ${err}`);
                }
            } else {
                element.innerHTML = equation;
                console.warn(`math-tex-typesetting-missing: Missing the mathematical typesetting engine (${engine}) for tex.`);
            }
        }
    }

    static getBalloonPositionData(editor) {
        const view = editor.editing.view;
        const defaultPositions = BalloonPanelView.defaultPositions;

        const selectedElement = view.document.selection.getSelectedElement();
        if (selectedElement) {
            return {
                target: view.domConverter.viewToDom(selectedElement),
                positions: [
                    defaultPositions.southArrowNorth,
                    defaultPositions.southArrowNorthWest,
                    defaultPositions.southArrowNorthEast
                ]
            };
        }
        else {
            const viewDocument = view.document;
            return {
                target: view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange()),
                positions: [
                    defaultPositions.southArrowNorth,
                    defaultPositions.southArrowNorthWest,
                    defaultPositions.southArrowNorthEast
                ]
            };
        }
    }

    static selectRenderMode(element, preview, previewUid, previewClassName, cb) {
        if (preview) {
            Utils.createPreviewElement(element, previewUid, previewClassName, previewEl => {
                cb(previewEl);
            });
        } else {
            cb(element);
        }
    }

    static renderMathJax3(equation, element, display, cb) {
        let promiseFunction = undefined;
        if (typeof MathJax.tex2chtmlPromise !== 'undefined') {
            promiseFunction = MathJax.tex2chtmlPromise;
        } else if (typeof MathJax.tex2svgPromise !== 'undefined') {
            promiseFunction = MathJax.tex2svgPromise;
        }

        if (typeof promiseFunction !== 'undefined') {
            Utils.promiseFunction(equation, { display }).then(node => {
                if (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                element.appendChild(node);
                cb();
            });
        }
    }

    static renderMathJax2(equation, element, display) {
        if (display) {
            element.innerHTML = '\\[' + equation + '\\]';
        } else {
            element.innerHTML = '\\(' + equation + '\\)';
        }
        // eslint-disable-next-line
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
    }

    static createPreviewElement(element, previewUid, previewClassName, render) {
        const previewEl = Utils.getPreviewElement(element, previewUid, previewClassName);
        render(previewEl);
    }

    static getPreviewElement(element, previewUid, previewClassName) {
        let previewEl = global.document.getElementById(previewUid);
        // Create if not found
        if (!previewEl) {
            previewEl = global.document.createElement('div');
            previewEl.setAttribute('id', previewUid);
            previewEl.classList.add(...previewClassName);
            previewEl.style.visibility = 'hidden';
            global.document.body.appendChild(previewEl);

            let ticking = false;

            const renderTransformation = () => {
                if (!ticking) {
                    global.window.requestAnimationFrame(() => {
                        Utils.moveElement(element, previewEl);
                        ticking = false;
                    });

                    ticking = true;
                }
            };

            // Create scroll listener for following
            global.window.addEventListener('resize', renderTransformation);
            global.window.addEventListener('scroll', renderTransformation);
        }
        return previewEl;
    }
    static moveAndScaleElement(parent, child) {
        // Move to right place
        Utils.moveElement(parent, child);

        // Scale parent element same as preview
        const domRect = child.getBoundingClientRect();
        parent.style.width = domRect.width + 'px';
        parent.style.height = domRect.height + 'px';
    }

    static moveElement(parent, child) {
        const domRect = parent.getBoundingClientRect();
        const left = global.window.scrollX + domRect.left;
        const top = global.window.scrollY + domRect.top;
        child.style.position = 'absolute';
        child.style.left = left + 'px';
        child.style.top = top + 'px';
        child.style.zIndex = 'var(--ck-z-modal)';
        child.style.pointerEvents = 'none';
    }
    //#endregion

}
export default Utils;