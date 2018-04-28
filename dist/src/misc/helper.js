import { orderBy } from 'lodash';
export var HELPER = {
    o2a: function (object, clone, limit, honorable) {
        if (clone === void 0) { clone = false; }
        if (limit === void 0) { limit = null; }
        if (honorable === void 0) { honorable = false; }
        if (clone && object !== undefined) {
            object = JSON.parse(JSON.stringify(object));
        }
        var array = [];
        for (var key in object) {
            if (typeof object[key] === 'object') {
                object[key]['$key'] = key;
            }
            else {
                object[key] = {
                    $key: key,
                    value: object[key]
                };
            }
            array.push(object[key]);
        }
        if (limit) {
            array.splice(limit, array.length);
        }
        if (honorable && array.length < 1) {
            array = null;
        }
        return array;
    },
    sort: function (value, key, order) {
        if (key === void 0) { key = '$key'; }
        if (order === void 0) { order = 'desc'; }
        return orderBy(value, [key], [order]);
    }
};
//# sourceMappingURL=helper.js.map