import { NgModule, ModuleWithProviders } from '@angular/core';

import { SheetbaseConfigService } from './services/sheetbase-config.service';

import { SpreadsheetService } from './services/spreadsheet.service';
import { DataService } from './services/data.service';
import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { UserDataService } from './services/user-data.service';
import { FileService } from './services/file.service';

import { ISheetbaseConfig } from './misc/interfaces';

@NgModule()
export class SheetbaseModule {

  static forRoot(sheetbaseConfig: ISheetbaseConfig): ModuleWithProviders {
    return {
      ngModule: SheetbaseModule,
      providers: [
        {
          provide: SheetbaseConfigService,
          useValue: sheetbaseConfig
        },
        
        SpreadsheetService,
        DataService,
        ApiService,
        UserService,
        UserDataService,
        FileService,
      ]
    }
  }
}