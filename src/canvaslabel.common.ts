import { Canvas, CanvasView, LayoutAlignment, StaticLayout } from 'nativescript-canvas';
import { ChangedData, ObservableArray } from '@nativescript/core/data/observable-array';
import { layout } from '@nativescript/core/utils/utils';
import { HorizontalAlignment, TextAlignment, TextDecoration, TextTransform, VerticalAlignment, WhiteSpace } from '@nativescript/core/ui/text-base';
import { Length, PercentLength } from '@nativescript/core/ui/styling/style-properties';
import { Observable } from '@nativescript/core/data/observable';
import { Color } from '@nativescript/core/color';
import { FontStyle, FontWeight } from '@nativescript/core/ui/styling/font';
import { CSSType } from '@nativescript/core/ui/core/view';
import { profile } from '@nativescript/core/profiling';
import Shape, { colorProperty, percentLengthProperty, stringProperty } from 'nativescript-canvas/shapes/shape';

export type VerticalTextAlignment = 'initial' | 'top' | 'middle' | 'bottom' | 'center';

// const debugPaint = new Paint();
// debugPaint.style = Style.STROKE;
// debugPaint.color = 'red';

export abstract class Span extends Shape {
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

    @stringProperty({ nonPaintProp: true }) horizontalAlignment: HorizontalAlignment;
    @stringProperty({ nonPaintProp: true }) verticalAlignment: VerticalAlignment;
    @stringProperty({ nonPaintProp: true }) verticalTextAlignment: VerticalTextAlignment;
    @colorProperty({ nonPaintProp: true }) backgroundColor: Color;
    @stringProperty({ nonPaintProp: true }) text: any;

    constructor() {
        super();
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

    abstract createNative(parent?: Group);

    // @profile
    getOrCreateNative(parent?: Group) {
        if (!this._native) {
            this.createNative(parent);
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
        // const startTime = Date.now();
        const paint = this.paint;
        if (!this.color && parent.style.color) {
            paint.color = parent.style.color;
        }

        if (!this.fontSize && parent.style.fontSize) {
            paint.textSize = parent.style.fontSize;
        }
        if (!this.fontFamily && (parent.style.fontFamily || parent.fontFamily)) {
            paint.setFontFamily(parent.style.fontFamily || parent.fontFamily);
        }
        if (!this.fontWeight && (parent.style.fontWeight || parent.fontWeight)) {
            paint.setFontWeight(parent.style.fontWeight || parent.fontWeight);
        }
        if (!this.fontStyle && (parent.style.fontStyle || parent.fontStyle)) {
            paint.setFontStyle(parent.style.fontStyle || parent.fontStyle);
        }
        this._staticlayout = new StaticLayout(text, paint, w, align, 1, 0, true);
        // this.log('create StaticLayout', text, paint.fontStyle, paint.fontWeight, paint.fontFamily, Date.now() - startTime, 'ms');
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
            }
        }
        if (this.height) {
            h = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.height, hPx, hPx));
        }
        if (this.paddingLeft || parent.effectivePaddingLeft !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingLeft, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingLeft);
            if (!this.width) {
                w -= decale;
            }
            if (align !== LayoutAlignment.ALIGN_OPPOSITE) {
                canvas.translate(decale, 0);
            }
        }

        if (this.paddingRight || parent.effectivePaddingRight !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingRight, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingRight);
            if (!this.width) {
                // dont translate here changing the width is enough
                w -= decale;
            } else {
                canvas.translate(-decale, 0);
            }
        }
        // console.log('drawOnCanvas', this.constructor.name, this.toString(), !!this._staticlayout, !!this._native);
        if (!this._staticlayout) {
            this.createStaticLayout(text, w, align, parent);
        }
        if (verticalalignment === 'bottom') {
            let height = this._staticlayout.getHeight();
            if (this.paddingBottom || parent.effectivePaddingBottom !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingBottom);
                height += decale;
            }
            canvas.translate(0, h - height);
        } else if (verticalalignment === 'middle') {
            const height = this._staticlayout.getHeight();
            let decale = 0;
            if (this.paddingTop || parent.effectivePaddingTop !== 0) {
                decale += layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingTop);
            }
            if (this.paddingBottom || parent.effectivePaddingBottom !== 0) {
                decale -= layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingBottom);
            }
            canvas.translate(0, h / 2 - height / 2 + decale);
        } else if (this.paddingTop || parent.effectivePaddingTop !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, wPx)) + layout.toDeviceIndependentPixels(parent.effectivePaddingTop);
            canvas.translate(0, decale);
        }
        // canvas.drawRect(0, 0, w, this._staticlayout.getHeight(), debugPaint);
        this._staticlayout.draw(canvas as any);
        canvas.restore();
        // console.log('drawOnCanvas', Date.now() - startTime, 'ms');
    }
}
export abstract class Group extends Span {
    fontSize: number;
    fontFamily: string;
    _spans: ObservableArray<Span>;
    getOrCreateSpans() {
        if (!this._spans) {
            this._spans = new ObservableArray<Span>();
            this._spans.addEventListener(ObservableArray.changeEvent, this.onShapesCollectionChanged, this);
        }
        return this._spans;
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
                const shape = (eventData.object as ObservableArray<Shape>).getItem(eventData.index + i);

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
            value._parent = new WeakRef(this as any);
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
