# Sheetbase Angular

Angular module for using Sheetbase in Angular/Ionic projects.

## Install

``npm install --save sheetbase-angular``

## Usage

Import __SheetbaseModule__ to your _app.module.ts_.
	
    import { SheetbaseModule } from 'sheetbase-angular';
	import { SHEETBASE_CONFIG } from '../configs/sheetbase.config';

	imports: [
		SheetbaseModule.forRoot(SHEETBASE_CONFIG)
    ]
    
Inject SheetbaseService into your page.

	import { SheetbaseService as SheetbaseProvider } from 'sheetbase-angular';
    
    constructor(
    	private sheetbase: SheetbaseProvider
    ) {}

## Docs

See [Documentation](https://sheetbase.net/docs) for more.

## Support us
[<img src="https://cloakandmeeple.files.wordpress.com/2017/06/become_a_patron_button3x.png?w=200">](https://www.patreon.com/lamnhan)