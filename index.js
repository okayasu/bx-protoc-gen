
"use strict";

const protocPlugin = require('protoc-plugin');

function isDefine(a){return void 0!==a};

protocPlugin(function(protos) {
  var rets = [];
  var service_request = '';
  var service_response = '';
  var service_functions = '';
  var requires = '';
  var namespace = '';
  protos.forEach(function(proto) {
    // console.error(proto);
    if (namespace == '')
      namespace = proto.pb_package;
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
          if (method.options && method.options.http && method.options.http.post) {
            url = method.options.http.post;
          }
          service_request += `
    case '${url}': return proto${method.inputType};`;
          service_response += `
    case '${url}': return proto${method.outputType};`;
          var fname = (service.name.replace(/Service$/, '') + method.name);
          service_functions += `
        public delegate void Def${fname}Callback(${method.outputType.replace('.'+proto.pb_package+'.', '')} response);
        public virtual void ${fname}(${method.inputType.replace('.'+proto.pb_package+'.', '')} req, Def${fname}Callback cb)
        {
            StartCoroutine(Send(m_current_url + "${url}", req, delegate (byte[] buff)
            {
                var res = new ${method.outputType.replace('.'+proto.pb_package+'.', '')}();
                res.MergeFrom(buff);
                if (cb != null)
                    cb(res);
            }));
        }
`;
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

  ret = {};
  ret.name = 'Services.cs';
  ret.content = `
using UnityEngine;
using System.Collections;
using Google.Protobuf;

namespace ${namespace.charAt(0).toUpperCase() + namespace.slice(1)}
{
    public abstract class Services : MonoBehaviour
    {
        protected static string m_current_url {get; set;}

        protected delegate void DefCallback(byte[] res);
        protected abstract IEnumerator Send(string url, IMessage req, DefCallback cb);

${service_functions}

    }
}
`;
  rets.push(ret);

  return rets;
});