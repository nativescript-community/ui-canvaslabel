import { cssProperty } from '@nativescript-community/text';
import { Canvas, CanvasView, LayoutAlignment, Paint, RectF, StaticLayout } from '@nativescript-community/ui-canvas';
import Shape, { colorProperty, numberProperty, percentLengthProperty, stringProperty } from '@nativescript-community/ui-canvas/shapes/shape';
import { CSSType, ChangedData, Color, EventData, Length, Span as NSPan, Observable, ObservableArray, PercentLength , paddingLeftProperty, profile} from '@nativescript/core';
import { FontStyle, FontWeight } from '@nativescript/core/ui/styling/font';
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from '@nativescript/core/ui/text-base';
import { layout } from '@nativescript/core/utils/utils';

export const fontPaintCache = {};

function getCapitalizedString(str: string): string {
    const words = str.split(' ');
    const newWords = [];
    for (let i = 0, length = words.length; i < length; i++) {
        const word = words[i].toLowerCase();
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }

    return newWords.join(' ');
}

export function getTransformedText(text: string, textTransform: TextTransform): string {
    switch (textTransform) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        case 'capitalize':
            return getCapitalizedString(text);
        case 'none':
        default:
            return text;
    }
}
export function computeBaseLineOffset(align, fontAscent, fontDescent, fontBottom, fontTop, fontSize, maxFontSize) {
    let result = 0;
    switch (align) {
        case 'top':
            result = -maxFontSize - fontBottom - fontTop;
            break;

        case 'bottom':
            result = fontBottom;
            break;

        case 'text-top':
            result = -maxFontSize - fontDescent - fontAscent;
            break;

        case 'text-bottom':
            result = fontBottom - fontDescent;
            break;

        case 'middle':
        case 'center':
            result = (fontAscent - fontDescent) / 2 - fontAscent - maxFontSize / 2;
            break;

        case 'super':
            result = -(maxFontSize - fontSize);
            break;

        case 'sub':
            result = 0;
            break;
    }
    return result;
}

export type VerticalTextAlignment = 'initial' | 'top' | 'middle' | 'bottom' | 'center';

// const debugPaint = new Paint();
// debugPaint.style = Style.STROKE;
// debugPaint.color = 'red';

export abstract class Span extends Shape {
    _parent: WeakRef<any>;
    static linkTapEvent = 'linkTap';
    @numberProperty({ nonPaintProp: true }) fontSize: number;
    @stringProperty({ nonPaintProp: true }) fontFamily: string;
    @stringProperty({ nonPaintProp: true }) fontStyle: FontStyle;
    @stringProperty({ nonPaintProp: true }) fontWeight: FontWeight;
    @stringProperty({ nonPaintProp: true }) textAlignment: TextAlignment & 'middle';
    @stringProperty({ nonPaintProp: true }) textDecoration: TextDecoration;
    @stringProperty({ nonPaintProp: true }) textTransform: TextTransform;

    @percentLengthProperty({ nonPaintProp: true }) width: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) height: PercentLength;

    @percentLengthProperty({ nonPaintProp: true }) paddingLeft: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingRight: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingTop: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingBottom: PercentLength;

    @stringProperty({ nonPaintProp: true }) verticalTextAlignment: VerticalTextAlignment;
    @colorProperty({ nonPaintProp: true }) backgroundColor: Color;
    @numberProperty({ nonPaintProp: true }) borderRadius: number;
    @numberProperty({ nonPaintProp: true }) letterSpacing: number;
    @numberProperty({ nonPaintProp: true }) lineHeight: number;
    @stringProperty({ nonPaintProp: true }) text: any;

    __fontSize: number;
    __fontFamily: string;
    __fontWeight: FontWeight;
    __verticalTextAlignment: any;

    addEventListener(arg: string, callback: (data: EventData) => void, thisArg?: any) {
        super.addEventListener(arg, callback, thisArg);
        if (arg === Span.linkTapEvent) {
            this._setTappable(true);
        }
    }

    removeEventListener(arg: string, callback?: any, thisArg?: any) {
        super.removeEventListener(arg, callback, thisArg);
        if (arg === Span.linkTapEvent) {
            this._setTappable(this.hasListeners(Span.linkTapEvent));
        }
    }
    _tappable = false;
    private _setTappable(value: boolean): void {
        if (this._tappable !== value) {
            this._tappable = value;
            this.notifyPropertyChange('tappable', value);
        }
    }

    get style() {
        return this;
    }
    // toString() {
    //     return `[CSpan: ${this.text}]`;
    // }
    set _fontFamily(value) {
        this.__fontFamily = value;
    }
    get _fontFamily() {
        const parent = this._parent && this._parent.get();
        if (this.__fontFamily) {
            return this.__fontFamily;
        }
        if (parent) {
            return parent._fontFamily || (parent.style && parent.style.fontFamily);
        }
    }

    set _fontSize(value) {
        this.__fontSize = value;
    }
    get _fontSize() {
        const parent = this._parent && this._parent.get();
        if (this.__fontSize) {
            return this.__fontSize;
        }
        if (parent) {
            return parent._fontSize || (parent.style && parent.style.fontSize);
        }
    }
    set _fontWeight(value: FontWeight) {
        this.__fontWeight = value;
    }
    get _fontWeight(): FontWeight {
        const parent = this._parent && this._parent.get();
        if (this.__fontWeight) {
            return this.__fontWeight;
        }
        if (parent) {
            return parent._fontWeight || (parent.style && parent.style.fontWeight);
        }
        return null;
    }
    set _verticalTextAlignment(value: any) {
        this.__verticalTextAlignment = value;
    }
    get _verticalTextAlignment(): any {
        const parent = this._parent && this._parent.get();
        if (this.__verticalTextAlignment) {
            return this.__verticalTextAlignment;
        }
        if (parent) {
            return parent._verticalTextAlignment || (parent.style && parent.style.verticalTextAlignment);
        }
        return null;
    }

    constructor() {
        super();
        this.handleAlignment = true;
        this.paint.setAntiAlias(true);
    }

    reset() {
        this._staticlayout = null;
        this._native = null;
    }
    notifyPropertyChange(propertyName: string, value: any, oldValue?: any) {
        this.reset();
        super.notifyPropertyChange(propertyName, value, oldValue);
    }

    _staticlayout: StaticLayout;
    // _startIndexInGroup = 0;
    // _endIndexInGroup = 0;
    _native: any; // NSMutableAttributedString | android.text.Spannable

    abstract createNative(parent?: Group, maxFontSize?: number);

    // @profile
    getOrCreateNative(parent?: Group, maxFontSize?: number) {
        if (!this._native) {
            this.createNative(parent, maxFontSize);
        }
        return this._native;
    }
    getText() {
        return this.text;
    }
    redraw() {
        const parent = this._parent && this._parent.get();
        if (parent) {
            parent.redraw();
        }
    }
    // @profile
    createStaticLayout(text, w, align, parent: CanvasLabel) {
        const fontweight = this.fontWeight;
        const fontstyle = this.fontStyle || parent.style.fontStyle || parent.fontStyle;
        const fontFamily = this.fontFamily;
        const fontCacheKey = fontFamily + fontweight + fontstyle;
        let paint = fontPaintCache[fontCacheKey];
        if (!paint) {
            paint = this.paint;
            paint.setFontFamily(fontFamily);
            paint.setFontWeight(fontweight);
            paint.setFontStyle(fontstyle);
            fontPaintCache[fontCacheKey] = paint;
        }
        paint.color = this.color || parent.style.color;
        paint.textSize = this.fontSize;
        // paint.setFontFamily(this.fontFamily);
        // paint.setFontWeight(this.fontWeight);
        // paint.setFontStyle(this.fontStyle || parent.style.fontStyle || parent.fontStyle);
        this._staticlayout = new StaticLayout(text, paint, w, align, 1, 0, true);
    }

    // needsMeasurement = false;
    // @profile
    drawOnCanvas(canvas: Canvas, parent: CanvasLabel) {
        const text = this.getText();
        if (!text) {
            return;
        }
        // const startTime = Date.now();
        const cW = canvas.getWidth();
        const cH = canvas.getHeight();
        let w = cW;
        let h = cH;
        const wPx = layout.toDevicePixels(w);
        const hPx = layout.toDevicePixels(h);

        let paddingLeft = layout.toDeviceIndependentPixels(parent.effectivePaddingLeft) + layout.toDeviceIndependentPixels(parent.effectiveBorderLeftWidth);
        let paddingRight = layout.toDeviceIndependentPixels(parent.effectivePaddingRight) + layout.toDeviceIndependentPixels(parent.effectiveBorderRightWidth);
        if (this.paddingLeft) {
            paddingLeft += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingLeft, 0, wPx - paddingLeft - paddingRight));
        }
        if (this.paddingRight) {
            paddingRight += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingRight, 0, wPx - paddingLeft - paddingRight));
        }
        let paddingTop = layout.toDeviceIndependentPixels(parent.effectivePaddingTop) + layout.toDeviceIndependentPixels(parent.effectiveBorderTopWidth);
        let paddingBottom = layout.toDeviceIndependentPixels(parent.effectivePaddingBottom) + layout.toDeviceIndependentPixels(parent.effectiveBorderBottomWidth);
        if (this.paddingTop) {
            paddingTop += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, hPx - paddingTop - paddingBottom));
        }
        if (this.paddingBottom) {
            paddingBottom += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, hPx - paddingTop - paddingBottom));
        }

        let align: LayoutAlignment = LayoutAlignment.ALIGN_NORMAL;
        switch (this.textAlignment || parent.style.textAlignment) {
            case 'center':
                align = LayoutAlignment.ALIGN_CENTER;
                break;
            case 'right':
                align = LayoutAlignment.ALIGN_OPPOSITE;
                break;
        }

        const verticalalignment = this.verticalAlignment;
        let deltaX = 0,
            deltaY = 0;
        if (this.width) {
            w = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.width, 0, wPx - paddingLeft - paddingRight));
            if (this.horizontalAlignment === 'right') {
                deltaX += cW - w;
            } else if (this.horizontalAlignment === 'center') {
                deltaX += cW / 2 - w / 2;
            } else if (this.width) {
                // deltaX += w / 2;
            }
        }
        if (this.height) {
            h = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.height, 0, hPx - paddingTop - paddingBottom));
        }
        if (paddingLeft !== 0 && align !== LayoutAlignment.ALIGN_OPPOSITE && this.horizontalAlignment !== 'right') {
            if (!this.width) {
                w -= paddingLeft;
            }
            deltaX += paddingLeft;
        }

        if (paddingRight !== 0) {
            if (!this.width) {
                // dont translate here changing the width is enough
                w -= paddingRight;
            } else if (align === LayoutAlignment.ALIGN_OPPOSITE || this.horizontalAlignment !== 'right') {
                deltaX += -paddingRight;
            }
        }
        if (!this._staticlayout) {
            this.createStaticLayout(text, w, align, parent);
        }
        let _staticHeight;
        const getStaticHeight = () => {
            if (!_staticHeight) {
                _staticHeight = this._staticlayout.getHeight();
            }
            return _staticHeight;
        };
        if (verticalalignment === 'bottom') {
            let height = getStaticHeight();
            if (paddingBottom !== 0) {
                height += paddingBottom;
            }
            if (this.height) {
                height += (h - height) / 2;
            }
            deltaY += cH - height;
        } else if (verticalalignment === 'middle' || verticalalignment === 'center') {
            const height = getStaticHeight();
            let decale = 0;
            if (paddingTop !== 0) {
                decale += paddingTop;
            }
            if (paddingBottom !== 0) {
                decale -= paddingBottom;
            }
            deltaY += cH / 2 - height / 2 + decale;
        } else {
            if (paddingTop !== 0) {
                deltaY += paddingTop;
            }
            if (this.height) {
                const height = getStaticHeight();
                deltaY += (h - height) / 2;
            }
        }
        const needsTranslate = deltaX > 0 || deltaY > 0;
        if (needsTranslate) {
            canvas.save();
            canvas.translate(deltaX, deltaY);
        }
        const spanParent = this._parent && this._parent.get();
        if (!(spanParent instanceof Group)) {
            let paint: Paint;
            const backgroundcolor = this.backgroundColor;
            if (backgroundcolor) {
                paint = paint || new Paint();
                paint.color = backgroundcolor;
                const borderRadius = this.borderRadius;
                const top = this.height ? -getStaticHeight() / 2 : 0;
                const bottom = top + (this.height ? h : getStaticHeight());
                if (borderRadius > 0) {
                    canvas.drawRoundRect(new RectF(0, top, this._staticlayout.getWidth(), bottom), borderRadius, borderRadius, paint);
                } else {
                    canvas.drawRect(0, top, this._staticlayout.getWidth(), bottom, paint);
                }
            }
        }
        this._staticlayout.draw(canvas as any);
        if (needsTranslate) {
            canvas.restore();
        }
    }
    toNativeString() {}
}
Span.prototype.toNativeString = NSPan.prototype.toNativeString;
export abstract class Group extends Span {
    _spans: ObservableArray<Span>;
    getOrCreateSpans() {
        if (!this._spans) {
            this._spans = new ObservableArray<Span>();
            this._spans.addEventListener(ObservableArray.changeEvent, this.onShapesCollectionChanged, this);
        }
        return this._spans;
    }
    reset() {
        super.reset();
        this._spans && this._spans.forEach((s) => s.reset());
    }
    getMaxFontSize() {
        let max = this.__fontSize || 0;
        this._spans && this._spans.forEach((s) => {
            if (s instanceof Group) {
                max = Math.max(max, s.getMaxFontSize());
            } else if (s.__fontSize) {
                max = Math.max(max, s.__fontSize);
            }
        });
        return max;
    }
    onShapePropertyChange() {
        this.notifyPropertyChange('.', null, null);
    }
    private addPropertyChangeHandler(shape: Shape) {
        // const style = shape.style;
        shape.on(Observable.propertyChangeEvent, this.onShapePropertyChange, this);
    }
    private removePropertyChangeHandler(shape: Shape) {
        shape.off(Observable.propertyChangeEvent, this.onShapePropertyChange, this);
    }
    private onShapesCollectionChanged(eventData: ChangedData<Shape>) {
        if (eventData.addedCount > 0) {
            for (let i = 0; i < eventData.addedCount; i++) {
                const shape = (eventData.object as any).getItem(eventData.index + i);

                // Then attach handlers - we skip the first nofitication because
                // we raise change for the whole instance.
                shape._parent = new WeakRef(this as any);
                this.addPropertyChangeHandler(shape);
            }
        }

        if (eventData.removed && eventData.removed.length > 0) {
            for (let p = 0; p < eventData.removed.length; p++) {
                const shape = eventData.removed[p];

                // First remove handlers so that we don't listen for changes
                // on inherited properties.
                shape._parent = null;
                this.removePropertyChangeHandler(shape);
            }
        }
    }
    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof Span) {
            this.getOrCreateSpans().push(value);
        }
    }
    public _removeView(view: any) {
        if (view instanceof Span && this._spans) {
            const index = this._spans.indexOf(view);
            if (index !== -1) {
                this._spans.splice(index, 1);
            }
            // } else {
            // super._removeView(view);
        }
    }
    onChildChange(span: Span) {
        this.redraw();
    }
    abstract createNative();

    @profile
    getText() {
        return this.getOrCreateNative();
    }

    // toString() {
    //     return `[Group:${this._spans.length}]:` + JSON.stringify(this._spans.map((s) => s.text));
    // }
}

declare module '@nativescript/core/ui/core/view' {
    interface View {
        _addChildFromBuilder(name: string, value: any);
    }
}

@CSSType('CanvasLabel')
export class CanvasLabel extends CanvasView {
    // fontSize: number;
    // fontFamily: string;
    // fontStyle: FontStyle;
    // fontWeight: FontWeight;
    // textAlignment: TextAlignment;
    // textDecoration: TextDecoration;
    @cssProperty fontFamily: string;
    @cssProperty fontSize: number;
    @cssProperty fontStyle: FontStyle;
    @cssProperty fontWeight: FontWeight;
    @cssProperty letterSpacing: number;
    @cssProperty lineHeight: number;
    @cssProperty textAlignment: TextAlignment;
    @cssProperty textDecoration: TextDecoration;
    @cssProperty textTransform: TextTransform;
    @cssProperty whiteSpace: WhiteSpace;

    handlePropertyChange() {
        const shapes = this.shapes;
        shapes && shapes.forEach((s) => s instanceof Span && s.reset());
    }

    //@ts-ignore
    set color(value) {
        this.style.color = value;
        this.handlePropertyChange();
    }

    get padding(): string | Length {
        return this.style.padding;
    }
    set padding(value: string | Length) {
        this.style.padding = value;
    }

    get paddingTop(): Length {
        return this.style.paddingTop;
    }
    set paddingTop(value: Length) {
        this.style.paddingTop = value;
    }

    get paddingRight(): Length {
        return this.style.paddingRight;
    }
    set paddingRight(value: Length) {
        this.style.paddingRight = value;
    }

    get paddingBottom(): Length {
        return this.style.paddingBottom;
    }
    set paddingBottom(value: Length) {
        this.style.paddingBottom = value;
    }

    get paddingLeft(): Length {
        return this.style.paddingLeft;
    }
    set paddingLeft(value: Length) {
        this.style.paddingLeft = value;
    }
}
