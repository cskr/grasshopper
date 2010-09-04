var EventEmitter = require('events').EventEmitter,
    sys = require('sys');

function ItemRepo() {
    EventEmitter.call(this);
    this.items = {};
}

sys.inherits(ItemRepo, EventEmitter);

ItemRepo.prototype.add = function(item) {
    var self = this;

    forEachTag(item.tags(), function(tag) {
        if(self.items[tag]) {
            self.items[tag].push(item);
        } else {
            self.items[tag] = [item];
        }

        self.emit(tag, item);
        self.removeAllListeners(tag);
    });
};

ItemRepo.prototype.search = function(tags) {
    var items = [], self = this;
    forEachTag(tags, function(tag) {
        if(self.items[tag])
            items = items.concat(self.items[tag]);
    });
    return items;
};

ItemRepo.prototype.watch = function(tags, cb) {
    var self = this;
    forEachTag(tags, function(tag) {
        self.on(tag, cb);
    });
};

function forEachTag(tagString, cb) {
    tagString.split(',').forEach(function (tag) {
        var trimmedTag = tag.trim();
        if(trimmedTag.length > 0)
            cb(tag.trim());
    });
}

exports.ItemRepo = ItemRepo;
