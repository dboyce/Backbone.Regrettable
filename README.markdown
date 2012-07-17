# Backbone.Regrettable

## About

A simple Backbone plugin for transparent undo/redo on models and collections

Example here: http://dboyce.github.com/Backbone.Regrettable/sample/

## Usage

```javascript
var ItemModel = Backbone.Model.extend({
    initialize: function() {
        Backbone.Regrettable.bind(this);
    }
});
var ItemList = Backbone.Collection.extend({
    model: ItemModel,
    initialize: function() {
        Backbone.Regrettable.bind(this);
    }
});

$('#undo-button').click(function(){
    Backbone.Regrettable.undo();
});

$('#redo-button').click(function(){
    Backbone.Regrettable.redo();
});
```

## Dependencies

Backbone, underscore and jQuery


