import { CSSType, ChangedData, Color, Length, Observable, ObservableArray, PercentLength, profile } from '@nativescript/core';
import { FontStyle, FontWeight } from '@nativescript/core/ui/styling/font';
import { HorizontalAlignment, VerticalAlignment } from '@nativescript/core/ui/styling/style-properties';
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from '@nativescript/core/ui/text-base';
import { layout } from '@nativescript/core/utils/utils';
import { Canvas, CanvasView, LayoutAlignment, Paint, StaticLayout } from '@nativescript-community/ui-canvas';
import Shape, { colorProperty, numberProperty, percentLengthProperty, stringProperty } from '@nativescript-community/ui-canvas/shapes/shape';

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
    @numberProperty({ nonPaintProp: true }) fontSize: number;
    @stringProperty({ nonPaintProp: true }) fontFamily: string;
    @stringProperty({ nonPaintProp: true }) fontStyle: FontStyle;
    @stringProperty({ nonPaintProp: true }) fontWeight: FontWeight;
    @stringProperty({ nonPaintProp: true }) textAlignment: TextAlignment;
    @stringProperty({ nonPaintProp: true }) textDecoration: TextDecoration;

    @percentLengthProperty({ nonPaintProp: true }) width: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) height: PercentLength;

    @percentLengthProperty({ nonPaintProp: true }) paddingLeft: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingRight: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingTop: PercentLength;
    @percentLengthProperty({ nonPaintProp: true }) paddingBottom: PercentLength;

    @stringProperty({ nonPaintProp: true }) verticalTextAlignment: VerticalTextAlignment;
    @colorProperty({ nonPaintProp: true }) backgroundColor: Color;
    @numberProperty({ nonPaintProp: true }) borderRadius: number;
    @stringProperty({ nonPaintProp: true }) text: any;

    __fontSize: number;
    __fontFamily: string;
    __fontWeight: FontWeight;
    __verticalTextAlignment: any;

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

    notifyPropertyChange(propertyName: string, value: any, oldValue?: any) {
        this._staticlayout = null;
        this._native = null;
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
        const paint = this.paint;
        paint.color = this.color || parent.style.color;
        paint.textSize = this.fontSize;
        paint.setFontFamily(this.fontFamily);
        paint.setFontWeight(this.fontWeight);
        paint.setFontStyle(this.fontStyle || parent.style.fontStyle || parent.fontStyle);
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

        let paddingLeft = parent.effectivePaddingLeft + layout.toDeviceIndependentPixels(parent.effectiveBorderLeftWidth);
        let paddingRight = parent.effectivePaddingRight + layout.toDeviceIndependentPixels(parent.effectiveBorderRightWidth);
        if (this.paddingLeft) {
            paddingLeft += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingLeft, 0, wPx - paddingLeft - paddingRight));
        }
        if (this.paddingRight) {
            paddingRight += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingRight, 0, wPx - paddingLeft - paddingRight));
        }
        let paddingTop = parent.effectivePaddingTop + layout.toDeviceIndependentPixels(parent.effectiveBorderTopWidth);
        let paddingBottom = parent.effectivePaddingBottom + layout.toDeviceIndependentPixels(parent.effectiveBorderBottomWidth);
        if (this.paddingTop) {
            paddingTop += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, wPx - paddingTop - paddingBottom));
        }
        if (this.paddingBottom) {
            paddingBottom += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, wPx - paddingTop - paddingBottom));
        }
        // if (!this._paint) {
        //     this.createPaint(parent);
        // }
        // const paint = this.paint;
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
        canvas.save();
        if (this.width) {
            w = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.width, wPx, wPx));
            if (this.horizontalAlignment === 'right') {
                canvas.translate(cW - w, 0);
            } else if (this.horizontalAlignment === 'center') {
                canvas.translate(cW / 2 - w / 2, 0);
            } else if (this.width) {
                canvas.translate(w / 2, 0);
            }
        }
        if (this.height) {
            h = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.height, hPx, hPx));
        }
        if (paddingLeft !== 0) {
            if (!this.width) {
                w -= paddingLeft;
            }
            if (align !== LayoutAlignment.ALIGN_OPPOSITE) {
                canvas.translate(paddingLeft, 0);
            }
        }

        if (paddingRight !== 0) {
            if (!this.width) {
                // dont translate here changing the width is enough
                w -= paddingRight;
            } else {
                canvas.translate(-paddingRight, 0);
            }
        }
        if (!this._staticlayout) {
            this.createStaticLayout(text, w, align, parent);
        }
        if (verticalalignment === 'bottom') {
            let height = this._staticlayout.getHeight();
            if (paddingBottom !== 0) {
                height += paddingBottom;
            }
            if (this.height) {
                height += (h - height) / 2;
            }
            canvas.translate(0, cH - height);
        } else if (verticalalignment === 'middle' || verticalalignment === 'center') {
            const height = this._staticlayout.getHeight();
            let decale = 0;
            if (paddingTop !== 0) {
                decale += paddingTop;
            }
            if (paddingBottom !== 0) {
                decale -= paddingBottom;
            }
            canvas.translate(0, cH / 2 - height / 2 + decale);
        } else {
            if (paddingTop !== 0) {
                canvas.translate(0, paddingTop);
            }
            if (this.height) {
                const height = this._staticlayout.getHeight();
                canvas.translate(0, (h - height) / 2);
            }
        }
        const spanParent = this._parent && this._parent.get();
        if (!(spanParent instanceof Group)) {
            let paint: Paint;
            const backgroundcolor = this.backgroundColor;
            if (backgroundcolor) {
                paint = paint || new Paint();
                paint.color = backgroundcolor;
                const borderRadius = this.borderRadius;
                const top = this.height ? -this._staticlayout.getHeight() / 2 : 0;
                const bottom = top + (this.height ? h : this._staticlayout.getHeight());
                if (borderRadius > 0) {
                    canvas.drawRoundRect(0, top, this._staticlayout.getWidth(), bottom, borderRadius, borderRadius, paint);
                } else {
                    canvas.drawRect(0, top, this._staticlayout.getWidth(), bottom, paint);
                }
            }
        }
        this._staticlayout.draw(canvas as any);
        canvas.restore();
    }
}
export abstract class Group extends Span {
    _spans: ObservableArray<Span>;
    getOrCreateSpans() {
        if (!this._spans) {
            this._spans = new ObservableArray<Span>();
            this._spans.addEventListener(ObservableArray.changeEvent, this.onShapesCollectionChanged, this);
        }
        return this._spans;
    }

    getMaxFontSize() {
        let max = this.__fontSize || 0;
        this._spans.forEach((s) => {
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
    constructor() {
        super();
        this.hardwareAccelerated = false;
    }
    // fontSize: number;
    // fontFamily: string;
    // fontStyle: FontStyle;
    // fontWeight: FontWeight;
    // textAlignment: TextAlignment;
    // textDecoration: TextDecoration;

    get fontFamily(): string {
        return this.style.fontFamily;
    }
    set fontFamily(value: string) {
        this.style.fontFamily = value;
    }

    get fontSize(): number {
        return this.style.fontSize;
    }
    set fontSize(value: number) {
        this.style.fontSize = value;
    }

    get fontStyle(): FontStyle {
        return this.style.fontStyle;
    }
    set fontStyle(value: FontStyle) {
        this.style.fontStyle = value;
    }

    get fontWeight(): FontWeight {
        return this.style.fontWeight;
    }
    set fontWeight(value: FontWeight) {
        this.style.fontWeight = value;
    }

    get letterSpacing(): number {
        return this.style.letterSpacing;
    }
    set letterSpacing(value: number) {
        this.style.letterSpacing = value;
    }

    get lineHeight(): number {
        return this.style.lineHeight;
    }
    set lineHeight(value: number) {
        this.style.lineHeight = value;
    }

    get textAlignment(): TextAlignment {
        return this.style.textAlignment;
    }
    set textAlignment(value: TextAlignment) {
        this.style.textAlignment = value;
    }

    get textDecoration(): TextDecoration {
        return this.style.textDecoration;
    }
    set textDecoration(value: TextDecoration) {
        this.style.textDecoration = value;
    }

    get textTransform(): TextTransform {
        return this.style.textTransform;
    }
    set textTransform(value: TextTransform) {
        this.style.textTransform = value;
    }

    get whiteSpace(): WhiteSpace {
        return this.style.whiteSpace;
    }
    set whiteSpace(value: WhiteSpace) {
        this.style.whiteSpace = value;
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
