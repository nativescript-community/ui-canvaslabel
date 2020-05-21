import { Canvas, CanvasView, LayoutAlignment, StaticLayout } from 'nativescript-canvas';
import { ChangedData, ObservableArray } from '@nativescript/core/data/observable-array';
import { layout } from '@nativescript/core/utils/utils';
import { Color, HorizontalAlignment, Observable, PercentLength, TextAlignment, TextDecoration, VerticalAlignment } from '@nativescript/core/ui/text-base';
import { FontStyle, FontWeight } from '@nativescript/core/ui/styling/font';
import { CSSType } from '@nativescript/core/ui/core/view';
import { profile } from '@nativescript/core/profiling';
import Shape, { colorProperty, percentLengthProperty, stringProperty } from 'nativescript-canvas/shapes/shape';

export type VerticalTextAlignment = 'initial' | 'top' | 'middle' | 'bottom' | 'center';

// const debugPaint = new Paint();
// debugPaint.style = Style.STROKE;
// debugPaint.color = 'red';

export abstract class Span extends Shape {
    @stringProperty fontFamily: string;
    @stringProperty fontStyle: FontStyle;
    @stringProperty fontWeight: FontWeight;
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
        this.antiAlias = true;
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
        if (!this.fontFamily && parent.style.fontFamily) {
            paint.setFontFamily(parent.style.fontFamily);
        }
        if (!this.fontWeight && parent.style.fontWeight) {
            paint.setFontWeight(parent.style.fontWeight);
        }
        this._staticlayout = new StaticLayout(text, this.paint, w, align, 1, 0, false);
        // this.log('create StaticLayout', Date.now() - startTime, 'ms');
    }
    // needsMeasurement = false;
    @profile
    drawOnCanvas(canvas: Canvas, parent: CanvasLabel) {
        const text = this.getText();
        if (!text) {
            return;
        }
        const startTime = Date.now();
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
        switch (this.textAlignment || parent.textAlignment) {
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
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingLeft, 0, wPx)) + parent.effectivePaddingLeft;
            // console.log('paddingLeft', this.paddingleft, paddingLeft, parent.effectivePaddingLeft);
            if (!this.width) {
                w -= decale;
            }
            if (align !== LayoutAlignment.ALIGN_OPPOSITE) {
                canvas.translate(decale, 0);
            }
        }

        if (this.paddingRight || parent.effectivePaddingRight !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingRight, 0, wPx)) + parent.effectivePaddingRight;
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
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, wPx)) + parent.effectivePaddingBottom;
                height += decale;
            }
            canvas.translate(0, h - height);
        } else if (verticalalignment === 'middle') {
            let height = this._staticlayout.getHeight();
            if (this.paddingTop || parent.effectivePaddingTop !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, wPx)) + parent.effectivePaddingTop;
                height += decale;
            }
            if (this.paddingBottom || parent.effectivePaddingBottom !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingBottom, 0, wPx)) + parent.effectivePaddingBottom;
                height -= decale;
            }
            canvas.translate(0, h / 2 - height / 2);
        } else if (this.paddingTop || parent.effectivePaddingTop !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingTop, 0, wPx)) + parent.effectivePaddingTop;
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
    fontSize: number;
    fontFamily: string;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    textAlignment: TextAlignment;
    // color: Color | string | number;
    textDecoration: TextDecoration;
    // spans: ObservableArray<Span> = new ObservableArray([]);
    // groups: ObservableArray<Group> = new ObservableArray([]);
    // constructor() {
    // super();
    // addWeakEventListener(this.spans, ObservableArray.changeEvent, this.requestLayout, this);
    // }
    // initNativeView() {
    //     super.initNativeView();
    // }
    // disposeNativeView() {
    //     super.disposeNativeView();
    // }
    // onChildChange(span: Span) {
    //     this.redraw();
    // }
    // public _addChildFromBuilder(name: string, value: any): void {
    //     if (value instanceof Span) {
    //         value._parent = new WeakRef(this);
    //         this.spans.push(value);
    //     } else {
    //         super._addChildFromBuilder(name, value);
    //     }
    // }

    // public addShape(shape: Shape) {
    // if (shape instanceof Span) {
    // console.log('add span', this.style.color, shape.color);
    // if (this.style.fontFamily && !shape.fontFamily) {
    //     shape.fontFamily = this.style.fontFamily;
    // }
    // if (this.style.fontSize && !shape.fontSize) {
    //     shape.fontSize = this.style.fontSize;
    // }
    // if (this.style.fontWeight && !shape.fontWeight) {
    //     shape.fontWeight = this.style.fontWeight;
    // }
    // if (this.style.textAlignment && !shape.textAlignment) {
    //     shape.textAlignment = this.style.textAlignment;
    // }
    // if (this.style.textDecoration && !shape.textDecoration) {
    //     shape.textDecoration = this.style.textDecoration;
    // }
    // if (this.style.fontStyle && !shape.fontStyle) {
    //     shape.fontStyle = this.style.fontStyle;
    // }
    // if (this.style.color && !shape.color) {
    //     shape.color = this.style.color;
    // }
    // }
    // super.addShape(shape);
    // }
    // public _removeView(view: any) {
    //     if (view instanceof Span) {
    //         const index = this.spans.indexOf(view);
    //         if (index !== -1) {
    //             const removed = this.spans.splice(index, 1);
    //             removed.forEach((s) => (s._parent = null));
    //             this.redraw();
    //         }
    //     } else {
    //         super._removeView(view);
    //     }
    // }
    // @profile
    // protected onDraw(canvas: Canvas) {
    //     super.onDraw(canvas);
    //     // const startTime = Date.now();
    //     // console.log('onDraw');
    //     this.spans.forEach((s) => s.drawOnCanvas(canvas, this as an));
    //     // console.log('onDraw', Date.now() - startTime, 'ms');
    // }
}
