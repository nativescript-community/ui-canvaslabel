package com.nativescript.canvaslabel;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.graphics.Paint;
import android.graphics.Canvas;
import android.text.TextPaint;
import android.text.style.ReplacementSpan;
import java.lang.CharSequence;

/**
 * Created by hhristov on 2/27/17.
 */

@SuppressLint("ParcelCreator")
public class VerticalCenterSpan extends ReplacementSpan {
    private String verticaltextalignment;

    public VerticalCenterSpan(String verticaltextalignment) {
        super();
        this.verticaltextalignment = verticaltextalignment;
    }

    @Override
    public int getSize(Paint paint, CharSequence text, int start, int end, Paint.FontMetricsInt fm) {

        // if (fm != null) {

        //     int space = paint.getFontMetricsInt(fm);

        //     fm.ascent -= space;
        //     fm.top -= space;

        // }

        return Math.round(paint.measureText(text, start, end));

    }
    @Override
    public void draw(Canvas canvas,
        CharSequence text, int start, int end,
        float x, int top, int y, int bottom,
        Paint paint) {

        
        int h = bottom - top;
        Paint.FontMetricsInt fm = paint.getFontMetricsInt();
        int space = fm.ascent - fm.descent + fm.leading;
        // canvas.drawText(text.subSequence(start, end).toString(), x, y, paint);
        switch (this.verticaltextalignment) {
            case "top":
                canvas.drawText(text.subSequence(start, end).toString(), x, y - h - space, paint);
                break;
            case "center":
            case "middle":
                canvas.drawText(text.subSequence(start, end).toString(), x, y - h / 2 - space / 2, paint);
                break;
            default:
                canvas.drawText(text.subSequence(start, end).toString(), x, y, paint);
        }
    }
}
