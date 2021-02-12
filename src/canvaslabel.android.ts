import { Paint } from '@nativescript-community/ui-canvas';
import { Color, getTransformedText, profile } from '@nativescript/core';
import { FontWeight } from '@nativescript/core/ui/styling/font';
import { CanvasLabel as CanvasLabelBase, Group as GroupBase, Span as SpanBase, computeBaseLineOffset, fontPaintCache } from './canvaslabel.common';

function isBold(fontWeight: FontWeight): boolean {
    return fontWeight === 'bold' || fontWeight === '700' || fontWeight === '800' || fontWeight === '900';
}

type BaselineAdjustedSpan = new (fontSize, align: string, maxFontSize) => android.text.style.MetricAffectingSpan;
type ClickableSpan = new (owner: Span) => android.text.style.ClickableSpan;


export const typefaceCache = {};

let SDK_INT = -1;
function getSDK() {
    if (SDK_INT === -1) {
        SDK_INT = android.os.Build.VERSION.SDK_INT;
    }
    return SDK_INT;
}


// eslint-disable-next-line no-redeclare
let ClickableSpan: ClickableSpan;
function initializeClickableSpan(): void {
    if (ClickableSpan) {
        return;
    }

    @NativeClass
    class ClickableSpanImpl extends android.text.style.ClickableSpan {
        owner: WeakRef<Span>;

        constructor(owner: Span) {
            super();
            this.owner = new WeakRef(owner);

            return global.__native(this);
        }
        onClick(view: android.view.View) {
            const owner = this.owner.get();
            if (owner) {
                owner._emit(Span.linkTapEvent);
            }
        }
        updateDrawState(tp: android.text.TextPaint) {
            // don't style as link
        }
    }

    ClickableSpan = ClickableSpanImpl;
}

let lineSeparator;
let Style: typeof  android.text.style;

export const createSpannable = profile('createSpannable', function (span: Span, parent?: Group, maxFontSize?: number) {
    let text = span.text;
    if (!text || span.visibility !== 'visible') {
        return null;
    }
    if (!(text instanceof android.text.Spannable)) {
        if (!(typeof text === 'string')) {
            text = text.toString();
        }
        if (text.indexOf('\n') !== -1) {
            if (!lineSeparator) {
                lineSeparator = java.lang.System.getProperty('line.separator');
            }
            text = text.replace(/\\n/g, lineSeparator);
        }
    }
    const textTransform = span.textTransform || (parent && parent.textTransform);
    if (textTransform) {
        text = getTransformedText(text, textTransform);
    }

    let ssb = span._ssb;
    if (!ssb) {
        span._ssb = ssb = new android.text.SpannableStringBuilder(text);
    } else {
        ssb.clear();
        ssb.clearSpans();
        ssb.append(text);
    }
    const length = typeof text.length === 'function' ? text.length() : text.length;

    const fontSize = span.fontSize;
    const fontweight = span.fontWeight || 'normal';
    const fontstyle = span.fontStyle || (parent && parent.fontStyle) || 'normal';
    const fontFamily = span.fontFamily;


    const textcolor = span.color;
    const textDecorations = span.textDecoration || (parent && parent.textDecoration);
    const backgroundcolor = span.backgroundColor || (parent && parent.backgroundColor);
    const verticaltextalignment = span.verticalTextAlignment;
    const letterSpacing = span.letterSpacing || (parent && parent.letterSpacing);
    const lineHeight = span.lineHeight || (parent && parent.lineHeight);

    if (!Style) {
        Style = android.text.style;
    }
    const bold = isBold(fontweight);
    const italic = fontstyle === 'italic';
    if (getSDK() < 28) {
        if (bold && italic) {
            ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.BOLD_ITALIC), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        } else if (bold) {
            ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.BOLD), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        } else if (italic) {
            ssb.setSpan(new Style.StyleSpan(android.graphics.Typeface.ITALIC), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }

    if (fontFamily) {
        const fontCacheKey = fontFamily + fontweight + fontstyle;

        let typeface = typefaceCache[fontCacheKey];
        if (!typeface) {
            let paint: Paint = fontPaintCache[fontCacheKey];
            if (!paint) {
                paint = span.paint;
                paint.setFontFamily(fontFamily);
                paint.setFontWeight(fontweight);
                paint.setFontStyle(fontstyle);
                fontPaintCache[fontCacheKey] = paint;
            }
            typeface = typefaceCache[fontCacheKey] = paint.getFont().getAndroidTypeface();
        }
        const typefaceSpan = new com.nativescript.text.CustomTypefaceSpan(fontFamily, typeface);
        ssb.setSpan(typefaceSpan, 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (verticaltextalignment && verticaltextalignment !== 'initial') {
        ssb.setSpan(new com.nativescript.text.BaselineAdjustedSpan(fontSize, verticaltextalignment, maxFontSize), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (fontSize) {
        ssb.setSpan(new Style.AbsoluteSizeSpan(fontSize), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (letterSpacing) {
        ssb.setSpan(new Style.ScaleXSpan((letterSpacing + 1) / 10), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (lineHeight !== undefined) {
        ssb.setSpan(new com.nativescript.text.HeightSpan(lineHeight), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (textcolor) {
        const color = textcolor instanceof Color ? textcolor : new Color(textcolor as any);
        ssb.setSpan(new Style.ForegroundColorSpan(color.android), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }
    if (backgroundcolor) {
        const color = backgroundcolor instanceof Color ? backgroundcolor : new Color(backgroundcolor as any);
        ssb.setSpan(new Style.BackgroundColorSpan(color.android), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    if (textDecorations) {
        const underline = textDecorations.indexOf('underline') !== -1;
        if (underline) {
            ssb.setSpan(new Style.UnderlineSpan(), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        const strikethrough = textDecorations.indexOf('line-through') !== -1;
        if (strikethrough) {
            ssb.setSpan(new Style.StrikethroughSpan(), 0, length, android.text.Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }
    }
    // if (span._tappable) {
    //     initializeClickableSpan();
    //     ssb.setSpan(new ClickableSpan(span), 0, length, android.text.Spanned.SPAN_INCLUSIVE_INCLUSIVE);
    // }
    return ssb;
});

export class Span extends SpanBase {
    _ssb: android.text.SpannableStringBuilder;

    @profile
    createNative(parent?: Group, maxFontSize?: number) {
        this._native = this._ssb = createSpannable(this, parent, maxFontSize);
    }
}

export class Group extends GroupBase {
    _ssb: android.text.SpannableStringBuilder;

    @profile
    createNative(parent?: Group, maxFontSize?: number) {
        let ssb = this._ssb;
        if (!ssb) {
            this._ssb = ssb = new android.text.SpannableStringBuilder();
        } else {
            ssb.clear();
            ssb.clearSpans();
        }
        if (maxFontSize === undefined) {
            // top group let s get max font Size
            maxFontSize = this.getMaxFontSize();
        }
        this._spans && this._spans.forEach((s) => {
            const native = (s as Span).getOrCreateNative(this, maxFontSize);
            if (native) {
                ssb.append(native);
            }
        });
        this._native = ssb;
    }
    onChildChange(span: Span) {
        this._native = null;
        this._staticlayout = null;
        super.onChildChange(span);
    }
}

export class CanvasLabel extends CanvasLabelBase {

}
