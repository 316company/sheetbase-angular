import { InjectionToken } from '@angular/core';

import { IConfig } from '../misc/interfaces';

export const SheetbaseConfigService = new InjectionToken<IConfig>('SheetbaseConfig');