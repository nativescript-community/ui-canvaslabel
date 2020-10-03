package com.nativescript.canvaslabel;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.graphics.Paint;
import android.graphics.Canvas;
import android.text.TextPaint;
import android.text.style.MetricAffectingSpan;
import java.lang.CharSequence;

import android.util.Log;

@SuppressLint("ParcelCreator")
public class VerticalCenterSpan extends MetricAffectingSpan {
    private String verticaltextalignment;

    public VerticalCenterSpan(String verticaltextalignment) {
        super();
        this.verticaltextalignment = verticaltextalignment;
    }

    @Override
    public void updateDrawState(android.text.TextPaint paint) {
        updateState(paint);
    }

    @Override
    public void updateMeasureState(android.text.TextPaint paint) {
        updateState(paint);
    }

    public void updateState(android.text.TextPaint paint) {
        final Paint.FontMetrics metrics = paint.getFontMetrics();
        final float textSize = paint.getTextSize();
        Log.d("JS",
                "updateState " + verticaltextalignment + " textSize " + textSize + " metrics.bottom " + metrics.bottom
                        + " metrics.top " + metrics.top + " metrics.ascent " + metrics.ascent + " metrics.descent "
                        + metrics.descent + " paint.baselineShift " + paint.baselineShift);
        switch (verticaltextalignment) {
            case "top":
                paint.baselineShift = (int) (-textSize - metrics.bottom - metrics.top);
                break;
            case "bottom":
                paint.baselineShift = (int) (metrics.bottom);
                break;
            case "text-top":
                paint.baselineShift = (int) (-textSize - metrics.descent - metrics.ascent);
                break;
            case "text-bottom":
                paint.baselineShift = (int) (metrics.bottom - metrics.descent);
                break;
            case "middle":
            case "center":
                Log.d("JS",
                        "baselineShift middle " + (int) ((metrics.descent - metrics.ascent) / 2.0 - metrics.descent));

                paint.baselineShift = (int) ((metrics.descent - metrics.ascent) / 2.0 - metrics.descent) * 2;
                break;
            case "super":
                paint.baselineShift = (int) (-textSize * 0.4);
            case "sub":
                paint.baselineShift = (int) ((metrics.descent - metrics.ascent) * 0.4);
                break;
        }

    }
}
