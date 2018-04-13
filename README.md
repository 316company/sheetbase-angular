# Sheetbase Angular

Angular module for using Sheetbase in Angular/Ionic projects.

## Install

``npm install --save sheetbase-angular``

## Usage

Import __SheetbaseModule__ to your _app.module.ts_.
	
    import { SheetbaseModule } from 'sheetbase-angular';
	import { CONFIG } from '../config';

	imports: [
		SheetbaseModule.forRoot(CONFIG)
    ]
    
Inject SheetbaseService into your page.

	import { SheetbaseService as SheetbaseProvider } from 'sheetbase-angular';
    
    constructor(
    	private sheetbase: SheetbaseProvider
    ) {}

## Config

See how to config Sheetbase project [here](https://sheetbase.net/docs?a=config).