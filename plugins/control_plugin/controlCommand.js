import Command from '@ckeditor/ckeditor5-core/src/command';
import { toWidget  } from '@ckeditor/ckeditor5-widget/src/utils';
import Utils from '../utils/utils';
export default class ControlCommand extends Command {
    execute(modelItem, writer, katexConfig) {
        const widgetElement =Utils.createMathtexEditingView(modelItem, writer,katexConfig);
        return toWidget(widgetElement, writer, 'span');
    }


}