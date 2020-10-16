package com.nativescript.canvaslabel;

import android.annotation.SuppressLint;
import android.graphics.Typeface;
import android.text.TextPaint;
import android.text.style.TypefaceSpan;

@SuppressLint("ParcelCreator")
public class CustomTypefaceSpan extends TypefaceSpan {
    private Typeface typeface;

    public CustomTypefaceSpan(String family, Typeface typeface) {
        super(family);
        this.typeface = typeface;
    }

    public Typeface getTypeface() {
        return this.typeface;
    }

    public void updateDrawState(TextPaint ds) {
        this.applyCustomTypeFace(ds);
    }

    public void updateMeasureState(TextPaint paint) {
        this.applyCustomTypeFace(paint);
    }

    private void applyCustomTypeFace(TextPaint paint) {
        Typeface typeface = this.typeface;
        paint.setTypeface(typeface);
    }
}
