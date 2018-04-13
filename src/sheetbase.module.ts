import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';

import { SheetbaseConfigService } from './services/sheetbase-config.service';
import { SheetbaseService } from './services/sheetbase.service';

import { IConfig } from './misc/interfaces';

@NgModule()
export class SheetbaseModule {

  static forRoot(config: IConfig): ModuleWithProviders {
    return {
      ngModule: SheetbaseModule,
      providers: [
        SheetbaseService,
        {
          provide: SheetbaseConfigService,
          useValue: config
        }
      ]
    }
  }
}