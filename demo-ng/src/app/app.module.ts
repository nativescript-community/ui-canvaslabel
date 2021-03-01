import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule, registerElement } from '@nativescript/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasLabel, Group, Span } from '@nativescript-community/ui-canvaslabel';
import { Label as HTMLLabel } from '@nativescript-community/ui-label';

registerElement('HTMLLabel', () => HTMLLabel);
registerElement('CanvasLabel', () => CanvasLabel);
registerElement('CGroup', () => Group);
registerElement('CSpan', () => Span);

@NgModule({
    bootstrap: [AppComponent],
    imports: [NativeScriptModule, AppRoutingModule],
    declarations: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {}
