import { Observable } from 'rxjs';

import { orderBy } from 'lodash';

export const HELPER =  {

  o2a: (object: {[$key: string]: any}, clone: boolean = false, limit: number = null, honorable: boolean = false): any => {
    if(clone && object !== undefined) {
      object = JSON.parse(JSON.stringify(object));
    }
    let array = [];
    for(let key in object) {
      if(typeof object[key] === 'object') {
        object[key]['$key'] = key;
      } else {
        object[key] = {
          $key: key,
          value: object[key]
        };
      }
      array.push(object[key]);
    }
    if(limit) {
      array.splice(limit, array.length);
    }
    if(honorable && array.length < 1) {
      array = null;
    }
    return array;
  },

  sort: (value: any[], key: string = '$key', order: string = 'desc') => {
    return orderBy(value, [key], [order]);
  }

}
