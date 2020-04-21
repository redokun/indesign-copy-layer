function map(obj, callback) {
  var result = [], c;
  for (c = 0, length = obj.length; c < length; c++) {
    result.push(callback(obj[c]));
  }
  return result;
}

function each(obj, callback) {
  var c;
  for (c = 0; c < obj.length; c++) {
    callback.call(obj, obj[c]);
  }
}

function filter(obj, callback) {
  var result = [], c;
  for (c = 0, length = obj.length; c < length; c++) {
    if (callback(obj[c])) {
      result.push(obj[c]);
    }
  }
  return result;
}

function errorAlert(str) {
  alert(str, true);
}

function getStackingIndex(pageItem) {
  var page = pageItem.parentPage;
  if (page === null) {
    return null;
  }

  var pageItems = page.allPageItems;
  for (var i = 0; i < pageItems.length; i++) {
    if (pageItem === pageItems[i]) {
      return i;
    }
  }
  return null;
}
