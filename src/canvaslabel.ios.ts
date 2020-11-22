import { Color, getTransformedText } from '@nativescript/core';
import { Font } from '@nativescript/core/ui/styling/font';
import { CanvasLabel as CanvasLabelBase, Group as GroupBase, Span as SpanBase, computeBaseLineOffset } from './canvaslabel.common';


export function createSpannable(span: Span, parent?: Group, maxFontSize?): NSMutableAttributedString {
    let text = span.text;
    if (!text || span.visibility !== 'visible') {
        return null;
    }
    const attrDict = {} as { key: string; value: any };
    const fontFamily = span.fontFamily;
    const fontSize = span.fontSize;
    const fontweight = span.fontWeight || 'normal';
    const fontstyle = span.fontStyle || (parent && parent.fontStyle) || 'normal';
    const textcolor = span.color;
    const backgroundcolor = span.backgroundColor || (parent && parent.backgroundColor);
    const textDecorations = span.textDecoration || (parent && parent.textDecoration);
    const letterSpacing = span.letterSpacing || (parent && parent.letterSpacing);
    const lineHeight = span.lineHeight || (parent && parent.lineHeight);
    const textAlignment = span.textAlignment || (parent && parent.textAlignment);
    const verticaltextalignment = span.verticalTextAlignment;
    let iosFont: UIFont;
    if (fontweight || fontstyle || fontFamily || fontSize) {
        const font = new Font(fontFamily, fontSize, fontstyle, typeof span.fontWeight === 'string' ? fontweight : ((fontweight + '') as any));
        iosFont = font.getUIFont(UIFont.systemFontOfSize(fontSize));
        attrDict[NSFontAttributeName] = iosFont;
    }
    if (verticaltextalignment && iosFont) {
        attrDict[NSBaselineOffsetAttributeName] = -computeBaseLineOffset(verticaltextalignment, -iosFont.ascender, -iosFont.descender, -iosFont.ascender, -iosFont.descender, fontSize, maxFontSize);
    }
    // if (span._tappable) {
    //     attrDict[NSLinkAttributeName] = text;
    // }
    if (textcolor) {
        const color = textcolor instanceof Color ? textcolor : new Color(textcolor as any);
        attrDict[NSForegroundColorAttributeName] = color.ios;
    }

    if (backgroundcolor) {
        const color = backgroundcolor instanceof Color ? backgroundcolor : new Color(backgroundcolor as any);
        attrDict[NSBackgroundColorAttributeName] = color.ios;
    }
    if (letterSpacing) {
        attrDict[NSKernAttributeName] = letterSpacing * iosFont.pointSize;
    }

    let paragraphStyle;
    if (lineHeight !== undefined) {
        paragraphStyle = NSMutableParagraphStyle.alloc().init();
        switch (textAlignment) {
            case 'middle':
            case 'center':
                paragraphStyle.alignment = NSTextAlignment.Center;
                break;
            case 'right':
                paragraphStyle.alignment = NSTextAlignment.Right;
                break;
            default:
                paragraphStyle.alignment = NSTextAlignment.Left;
                break;
        }
        paragraphStyle.minimumLineHeight = lineHeight;
    }
    if (paragraphStyle) {
        attrDict[NSParagraphStyleAttributeName] = paragraphStyle;
    }

    if (textDecorations) {
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            attrDict[NSUnderlineStyleAttributeName] = underline;
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            attrDict[NSStrikethroughStyleAttributeName] = strikethrough;
        }
    }

    if (!(text instanceof NSAttributedString)) {
        if (!(typeof text === 'string')) {
            text = text.toString();
        }
        if (text.indexOf('\n') !== -1) {
            text = text.replace(/\\n/g, '\u{2029}');
        }
        const textTransform = span.textTransform || (parent && parent.textTransform);
        if (textTransform) {
            text = getTransformedText(text, textTransform);
        }
        return NSMutableAttributedString.alloc().initWithStringAttributes(text, attrDict as any);
    } else {
        const result = NSMutableAttributedString.alloc().initWithAttributedString(text);
        result.setAttributesRange(attrDict as any, { location: 0, length: text.length });
        return result;
    }
}

export class Span extends SpanBase {
    createNative(parent?: Group, maxFontSize?: number) {
        this._native = createSpannable(this, parent, maxFontSize);
    }
}
export class Group extends GroupBase {
    createNative(parent?: Group, maxFontSize?: number) {
        const ssb = NSMutableAttributedString.new();

        if (maxFontSize === undefined) {
            // top group let s get max font Size
            maxFontSize = this.getMaxFontSize();
        }
        this._spans && this._spans.forEach((s) => {
            // s._startIndexInGroup = ssb.length;
            // s._endIndexInGroup = s.text ? s.text.length : 0;
            const native = s.getOrCreateNative(this, maxFontSize);
            if (native) {
                ssb.appendAttributedString(native);
            }
        });
        // console.log('Group', 'createNative', ssb.toString());
        this._native = ssb;
    }
    onChildChange(span: Span) {
        this._native = null;
        this._staticlayout = null;
        super.onChildChange(span);
        // console.log('Group onChildChange', span.text, !!this._native, span._startIndexInGroup, span._endIndexInGroup, span.getOrCreateNative(this));
        // if (this._native) {
        //     (this._native as NSMutableAttributedString).replaceCharactersInRangeWithAttributedString({location:span._startIndexInGroup, length:span._endIndexInGroup}, span.getOrCreateNative(this) );
        // }
        // span._endIndexInGroup = span.text ? span.text.length : 0;
    }
}

export class CanvasLabel extends CanvasLabelBase {

}
