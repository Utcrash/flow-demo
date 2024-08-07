import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactWrapper } from './react-modules/ReactWrapper';
import { PropsComponent } from './props/props.component';

@NgModule({
    declarations: [
        AppComponent,
        ReactWrapper,
        PropsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
