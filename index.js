
"use strict";

const protocPlugin = require('protoc-plugin');

function isDefine(a){return void 0!==a};

protocPlugin(function(protos) {
  var rets = [];
  var service_request = '';
  var service_response = '';
  var requires = '';
  protos.forEach(function(proto) {
    // console.error(proto);
    var content = '';
    content += `
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
 // GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');

function isDef(a){return void 0!==a};

`;
    if (isDefine(proto.messageTypeList)) {
      proto.messageTypeList.forEach(function(message) {
        // console.error(message);
        var msgname = proto.pb_package + '.' + message.name;
        content += `
//if (jspb.Message.GENERATE_FROM_OBJECT) {
/**
 * Loads data from an object into a new instance of this proto.
 * @param {!Object} obj The object representation of this proto to
 *     load the data from.
 * @return {!proto.${msgname}}
 */
proto.${msgname}.prototype.fromObject = function(obj) {
  return proto.${msgname}.fromObject(obj, this);
};

/**
 * Loads data from an object into a new instance of this proto.
 * @param {!Object} obj The object representation of this proto to
 *     load the data from.
 * @return {!proto.${msgname}}
 */
proto.${msgname}.fromObject = function(obj, msg) {
  var f;`;
        message.fieldList.forEach(function(field) {
          // console.error(field);
          if (field.type == 11) {
            content += `
  isDef(obj.${field.jsonName}) && (f = new proto${field.typeName}()) && f.fromObject(obj.${field.jsonName}) && jspb.Message.setWrapperField(msg, ${field.number}, f);`;
          } else {
            content += `
  isDef(obj.${field.jsonName}) && jspb.Message.setField(msg, ${field.number}, obj.${field.jsonName});`;
          }
        });
        content += `
 return msg;
};
//}
`;
      })
    }
    if (isDefine(proto.serviceList)) {
      proto.serviceList.forEach(function(service) {
        // console.error(service);
        service.methodList.forEach(function(method) {
          var url = ('/' + service.name.replace(/Service$/, '') + '/' + method.name).toLowerCase();
          url = url.replace(/\/create$/, '');
          service_request += `
    case '${url}': return proto${method.inputType};`;
          service_response += `
    case '${url}': return proto${method.outputType};`;
        })
      });
    }
    var ret = {};
    ret.name = proto.name.replace('.proto', '_fromobject.js');
    ret.content = content;
    rets.push(ret);
    requires += `
require('../proto/${proto.name.replace('.proto','_pb.js')}');
require('../proto/${proto.name.replace('.proto','_fromobject.js')}');`;
  })

  var ret = {};
  ret.name = 'services.js';
  ret.content = `
var protobuf = ` + requires + `

module.exports = function() {
};
  
module.exports.request = function(url) {
  switch(url)
  {` + service_request + `
  }
  return null;
};

module.exports.response = function(url) {
  switch(url)
  {` + service_response + `
  }
  return null;
};
`;
  rets.push(ret);

  return rets;
});