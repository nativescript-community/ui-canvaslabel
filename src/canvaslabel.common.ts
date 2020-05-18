import { Align, Canvas, CanvasView, LayoutAlignment, Paint, Rect, StaticLayout, Style } from 'nativescript-canvas';
import { ChangedData, ObservableArray } from '@nativescript/core/data/observable-array';
import { layout } from '@nativescript/core/utils/utils';
import { addWeakEventListener, removeWeakEventListener } from '@nativescript/core/ui/core/weak-event-listener';
import { Color, HorizontalAlignment, PercentLength, TextAlignment, TextDecoration, VerticalAlignment } from '@nativescript/core/ui/text-base';
import { Font, FontStyle, FontWeight } from '@nativescript/core/ui/styling/font';
import { profile } from '@nativescript/core/profiling';
export type VerticalTextAlignment = 'initial' | 'top' | 'middle' | 'bottom' | 'center';

// const debugPaint = new Paint();
// debugPaint.style = Style.STROKE;
// debugPaint.color = 'red';

export abstract class Span {
    fontsize: number;
    fontfamily: string;
    fontstyle: FontStyle;
    fontweight: FontWeight;
    textalignment: TextAlignment;
    color: Color | string | number;
    textdecoration: TextDecoration;

    width: PercentLength;
    height: PercentLength;

    paddingleft: PercentLength;
    paddingright: PercentLength;
    paddingtop: PercentLength;
    paddingbottom: PercentLength;

    horizontalalignment: HorizontalAlignment;
    verticalalignment: VerticalAlignment;
    verticaltextalignment: VerticalTextAlignment;
    backgroundcolor: Color | string | number;
    text: string;
    _paint: Paint;
    _parent: WeakRef<CanvasLabel | Group>;
    // rect: Rect = new Rect(0, 0, 0, 0);

    _staticlayout: StaticLayout;
    _startIndexInGroup = 0;
    _endIndexInGroup = 0;
    _native: any; // NSMutableAttributedString | android.text.Spannable
    constructor() {
        return new Proxy(this, {
            set(target, key: string, value) {
                if (key[0] === '_') {
                    target[key] = value;
                    return true;
                }
                const lkey = key.toLowerCase();

                target._native = null;
                target._staticlayout = null;
                // console.log(`${key} set to ${value}`, !!target.paint, !!target._parent, !!target._parent &&  !!target._parent.get());
                switch (lkey) {
                    case 'fontsize':
                        const newValue = parseFloat(value);
                        target[lkey] = newValue;
                        if (target._paint) {
                            target._paint.textSize = newValue;
                        }
                        break;
                    case 'paddingleft':
                    case 'paddingright':
                    case 'paddingbottom':
                    case 'paddingtop':
                    case 'width':
                    case 'height':
                        target[lkey] = PercentLength.parse(value);
                        break;
                    default:
                        target[lkey] = value;
                        break;

                    // case 'text':
                    //     target.staticlayout = null;
                    //     break;
                }
                const parent = target._parent && target._parent.get();
                if (parent) {
                    parent.onChildChange(target);
                }
                return true;
            },
        });
    }
    // @profile
    createPaint(parent: CanvasLabel) {
        // const startTime = Date.now();
        const paint = this._paint = new Paint();
        paint.setAntiAlias(true);
        paint.color = this.color || parent.color;
        let textSize = this.fontsize || parent.fontSize;
        if (typeof textSize === 'string') {
            textSize = parseFloat(textSize);
        }
        paint.setTypeface(new Font(this.fontfamily || parent.fontFamily, textSize, this.fontstyle || parent.fontStyle, this.fontweight || parent.fontWeight));
        switch (this.textdecoration || parent.textDecoration) {
            case 'none':
                // (this.paint as any).setFlags(0);
                break;
            case 'underline':
                (paint as any).setFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG);
                break;
            case 'line-through':
                (paint as any).setFlags(android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
                break;
            case 'underline line-through':
                (paint as any).setFlags(android.graphics.Paint.UNDERLINE_TEXT_FLAG | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG);
                break;
            // default:
            // (this.paint as any).setFlags(value);
            // break;
        }
        paint.setTextSize(textSize);
        // this.needsMeasurement = true;
        // console.log('createPaint', Date.now() - startTime, 'ms');
    }
    // @profile
    abstract createNative(parent?: Group);

    getOrCreateNative(parent?: Group) {
        if (!this._native) {
            this.createNative(parent);
        }
        return this._native;
    }
    getText() {
        return this.text;
    }
    toString() {
        return this.text;
    }
    redraw() {
        const parent = this._parent && this._parent.get();
        if (parent) {
            parent.redraw();
        }
    }
    // needsMeasurement = false;
    // @profile
    drawOnCanvas(canvas: Canvas, parent: CanvasLabel) {
        // console.log('drawOnCanvas');
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
        if (!this._paint) {
            this.createPaint(parent);
        }
        let align: LayoutAlignment = LayoutAlignment.ALIGN_NORMAL;
        switch (this.textalignment || parent.textAlignment) {
            case 'center':
                align = LayoutAlignment.ALIGN_CENTER;
                break;
            case 'right':
                align = LayoutAlignment.ALIGN_OPPOSITE;
                break;
        }

        const verticalalignment = this.verticalalignment;
        canvas.save();
        if (this.width) {
            w = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.width, wPx, wPx));
            if (this.horizontalalignment === 'right') {
                canvas.translate(cW - w, 0);
            } else if (this.horizontalalignment === 'center') {
                canvas.translate(cW/2 - w/2, 0);
            }
        }
        if (this.height) {
            h = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.height, hPx, hPx));
        }
        if (this.paddingleft || parent.effectivePaddingLeft !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingleft, 0, wPx)) + parent.effectivePaddingLeft;
            // console.log('paddingLeft', this.paddingleft, paddingLeft, parent.effectivePaddingLeft);
            w -= decale;
            if (align !== LayoutAlignment.ALIGN_OPPOSITE) {
                canvas.translate(decale, 0);
            }
        }

        if (this.paddingright || parent.effectivePaddingRight !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingright, 0, wPx)) + parent.effectivePaddingRight;
            w -= decale;
            // dont translate here changing the width is enough
        }
        // console.log('drawOnCanvas', this.constructor.name, this.toString(), this.textalignment || parent.textalignment, align);
        if (!this._staticlayout) {
            // const startTime2 = Date.now();
            this._staticlayout = new StaticLayout(text, this._paint, w, align, 1, 0, false);
            // console.log('_staticlayout', Date.now() - startTime2, 'ms');
        }
        if (verticalalignment === 'bottom') {
            let height = this._staticlayout.getHeight();
            if (this.paddingbottom || parent.effectivePaddingBottom !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingbottom, 0, wPx)) + parent.effectivePaddingBottom;
                height += decale;
            }
            canvas.translate(0, h - height);
        } else if (verticalalignment === 'middle') {
            let height = this._staticlayout.getHeight();
            if (this.paddingtop || parent.effectivePaddingTop !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingtop, 0, wPx)) + parent.effectivePaddingTop;
                height += decale;
            }
            if (this.paddingbottom || parent.effectivePaddingBottom !== 0) {
                const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingbottom, 0, wPx)) + parent.effectivePaddingBottom;
                height -= decale;
            }
            canvas.translate(0, h / 2 - height / 2);
        } else if (this.paddingtop || parent.effectivePaddingTop !== 0) {
            const decale = layout.toDeviceIndependentPixels(PercentLength.toDevicePixels(this.paddingtop, 0, wPx)) + parent.effectivePaddingTop;
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
    spans: ObservableArray<Span> = new ObservableArray([]);
    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof Span) {
            value._parent = new WeakRef(this);
            this.spans.push(value);
        }
    }
    public _removeView(view: any) {
        if (view instanceof Span) {
            const index = this.spans.indexOf(view);
            if (index !== -1) {
                const removed = this.spans.splice(index, 1);
                removed.forEach((s) => (s._parent = null));
                this.redraw();
            }
            // } else {
            // super._removeView(view);
        }
    }
    onChildChange(span: Span) {
        this.redraw();
    }
    // @profile
    abstract createNative();
    getText() {
        return this.getOrCreateNative();
    }

    toString() {
        return `[Group:${this.spans.length}]:` + JSON.stringify(this.spans.map((s) => s.text));
    }
}

declare module '@nativescript/core/ui/core/view' {
    interface View {
        _addChildFromBuilder(name: string, value: any);
    }
}

export class CanvasLabel extends CanvasView {
    fontSize: number;
    fontFamily: string;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    textAlignment: TextAlignment;
    // color: Color | string | number;
    textDecoration: TextDecoration;
    spans: ObservableArray<Span> = new ObservableArray([]);
    // groups: ObservableArray<Group> = new ObservableArray([]);
    constructor() {
        super();
        addWeakEventListener(this.spans, ObservableArray.changeEvent, this.requestLayout, this);
    }
    // initNativeView() {
    //     super.initNativeView();
    // }
    // disposeNativeView() {
    //     super.disposeNativeView();
    // }
    onChildChange(span: Span) {
        this.redraw();
    }
    public _addChildFromBuilder(name: string, value: any): void {
        if (value instanceof Span) {
            value._parent = new WeakRef(this);
            this.spans.push(value);
            // } else {
            // super._addChildFromBuilder(name, value);
        }
    }
    public _removeView(view: any) {
        if (view instanceof Span) {
            const index = this.spans.indexOf(view);
            if (index !== -1) {
                const removed = this.spans.splice(index, 1);
                removed.forEach((s) => (s._parent = null));
                this.redraw();
            }
            // } else {
            // super._removeView(view);
        }
    }
    // @profile
    protected onDraw(canvas: Canvas) {
        // const startTime = Date.now();
        // console.log('onDraw');
        this.spans.forEach((s) => s.drawOnCanvas(canvas, this));
        // console.log('onDraw', Date.now() - startTime, 'ms');
    }
}
