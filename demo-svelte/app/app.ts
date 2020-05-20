/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { svelteNative } from 'svelte-native';
import { registerNativeViewElement } from 'svelte-native/dom';
import App from './App.svelte';

import { enableIOSDTCoreText } from 'nativescript-htmllabel';
enableIOSDTCoreText();
registerNativeViewElement('line', () => require('nativescript-canvas/shapes/line').default);
registerNativeViewElement('canvaslabel', () => require('nativescript-canvaslabel').CanvasLabel);
registerNativeViewElement('cspan', () => require('nativescript-canvaslabel').Span);
registerNativeViewElement('cgroup', () => require('nativescript-canvaslabel').Group);
import CollectionViewElement from './collectionview';
CollectionViewElement.register();
svelteNative(App, {});
