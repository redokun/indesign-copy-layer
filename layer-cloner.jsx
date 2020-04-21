#target indesign;
#include './libs.jsx';

/*
 * Layer cloner
 * Redokun Srls 2016-2020
 *
 * @license MIT (http://www.opensource.org/licenses/MIT)
 */

var VERSION = '1.4.3';
var allDocs = app.documents;

var isDebug = false;

if (allDocs.length > 1) {
  var activeDoc = app.activeDocument;

  var itemLayer, itemDoc, isOk = false;

  // Exclude current doc
  var otherDocs = filter(allDocs, function(doc) {
    return doc !== activeDoc;
  });

  // Get all doc names
  var docNames = map(otherDocs, function(doc) {
    return doc.name;
  });

  // Get all layers names
  var layersNames = map(activeDoc.layers, function(layer) {
    return layer.name;
  });

  // Create window
  var win = new Window('dialog', 'Layer cloner v' + VERSION + ' (redokun.com)');
  win.spacing = 15;
  this.windowRef = win;

  win.TxtTitle = win.add('statictext', undefined,
    'Copy layer to other document');
  win.TxtTitle.alignment = 'left';

  win.Panel1 = win.add('panel', undefined, '');
  var panel = win.Panel1;
  panel.spacing = 15;

  // Layer selection
  panel.Txt1 = panel.add('statictext', undefined, 'Select source layer');
  panel.Txt1.alignment = 'left';
  panel.LayerList = panel.add('dropdownlist', undefined, layersNames);
  panel.LayerList.alignment = 'left';
  panel.LayerList.selection = 0;
  itemLayer = panel.LayerList.selection.index;

  panel.LayerList.onChange = function() {
    itemLayer = panel.LayerList.selection.index;

    return itemLayer;
  };

  // Doc selection
  panel.Txt2 = panel.add('statictext', undefined,
    'Select destination document');
  panel.Txt2.alignment = 'left';
  panel.NewList = panel.add('dropdownlist', undefined, docNames);
  panel.NewList.alignment = 'left';
  panel.NewList.selection = 0;
  itemDoc = panel.NewList.selection.index;

  panel.NewList.onChange = function() {
    itemDoc = panel.NewList.selection.index;

    return itemDoc;
  };

  // Window actions
  panel.Group01 = panel.add('group', undefined);
  panel.Group01.alignment = 'fill';

  panel.Group01.cancelBtn = panel.Group01.add('button', undefined, 'Cancel');
  panel.Group01.cancelElement = panel.Group01.cancelBtn;

  panel.Group01.quitBtn = panel.Group01.add('button', undefined, 'Ok');
  panel.Group01.quitBtn.onClick = function() {
    isOk = true;

    win.close();
  };

  // Footnote text (credits)
  win.TxtCredit1 = win.add('statictext', undefined,
    'Layer cloner (v' + VERSION + ')',
  );
  win.TxtCredit3 = win.add('statictext', undefined,
    'Redokun 2016-2020 (https://redokun.com)');

  // Show
  win.show();

  // Window closed here

  // Copy
  if (isOk) {
    var destDoc = otherDocs[itemDoc];
    var sourceLayer = activeDoc.layers[itemLayer];

    // Check if layer already exists
    var hasLayer = destDoc.layers.itemByName(sourceLayer.name);
    if (!isDebug && hasLayer.isValid) {
      var errStr = 'Layer "'
        + sourceLayer.name
        + '" already exists in the target document';

      errorAlert(errStr);
    } else {
      // New layer
      var destLayer;
      if (isDebug && hasLayer && hasLayer.isValid) {
        destLayer = hasLayer;
      } else {
        destLayer = destDoc.layers.add({name: sourceLayer.name});
      }

      var linkMap = [], // Old Item -> prev old Item, new old Item
        tfMap = {}; // Old Item -> New Item

      /*
       * Copy Items
       */

      var sourceItem, targetItem, page,
        elementCount = sourceLayer.pageItems.length;

      // Copy them
      for (var i = elementCount - 1; i >= 0; i--) {
        sourceItem = sourceLayer.pageItems.item(i);
        page = sourceItem.parentPage;
        tfMap[sourceItem.id] = targetItem = sourceItem.duplicate(destLayer);

        if (typeof sourceItem.previousTextFrame != 'undefined' &&
          sourceItem.previousTextFrame && sourceItem.textFrameIndex > 0) {
          linkMap.push({
            item: sourceItem,
            prev: sourceItem.previousTextFrame,
          });
        }
      }

      // Links between threaded TFs are not copied, so we need to do that ourselves
      repairTextFramesLinks(linkMap, tfMap);

      // Focus on new doc
      app.activeDocument = destDoc;

      alert('Done');
    }
  }
} else {
  errorAlert('Open the source and the destination file first. ' +
    'Execute the script when the source document is active.');
}

function repairTextFramesLinks(linkMap, copyMap) {
  for (var c = 0, length = linkMap.length; c < length; c++) {
    var element = linkMap[c];
    var oldItem = element.item;
    var parentItem = copyMap[oldItem.id];
    var newPrevItem;

    if (element.prev) {
      newPrevItem = copyMap[element.prev.id];

      parentItem.previousTextFrame = newPrevItem;
    }
  }
}

true;
