import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CollectionViewModule } from '@nativescript-community/ui-collectionview/angular';
import { NativeScriptCommonModule } from '@nativescript/angular';
import { AppRoutingModule } from '../app-routing.module';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

@NgModule({
    imports: [NativeScriptCommonModule, HomeRoutingModule, CollectionViewModule],
    declarations: [HomeComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class HomeModule {}
