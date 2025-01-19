/**
 * Copyright 2017 Bart Butenaers
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 module.exports = function(RED) {
    var settings = RED.settings;  
    var sizeOf = require('image-size');
   
    function ImageInfoNode(config) { 
        RED.nodes.createNode(this, config);
        this.data       = config.data || "";
        this.dataType   = config.dataType || "msg";
        var node = this;
        let buffer = null;
        let image = null;
        
        node.on("input", function(msg) { 
             // Get the image from the location specified in the typedinput field
             RED.util.evaluateNodeProperty(node.data, node.dataType, node, msg, (err, value) => {
                if (err) {
                    handleError(err, msg, "Invalid source");
                    return;
                } else {
                    image = value;
                }
            });
        
         
 
         function isBase64(v) {
          if (v instanceof Boolean || typeof v === 'boolean') { return false }
          var regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?'
          return (new RegExp('^' + regex + '$', 'gi')).test(v)
          }
            
            if (Buffer.isBuffer(image)) {
                buffer = image;
            }
            else {
                if (typeof image === 'string') { 
                    if (isBase64(image)) {
                         buffer = Buffer.from(image, 'base64')
                    }
                    else {
                        buffer = Buffer.from(image);
                    }
                }
            }
            
            if (buffer) {
                var imageInfo;

                try {
                    imageInfo = sizeOf(buffer);
                    
                    msg.type = imageInfo.type;
                    msg.width = imageInfo.width;
                    msg.height = imageInfo.height;
                    
                    const status = imageInfo.type + " (" + imageInfo.width + " x " + imageInfo.height + ")"; 
                    node.status({fill:"blue",shape:"dot",text:status});
                }
                catch (err) {
                    node.error("Unknown image format: " + err);
                    node.status({fill:"red",shape:"dot",text:"unknown format"});
                }
            }
            else {
                node.error("Invalid input type");
                node.status({fill:"red",shape:"dot",text:"invalid input"});
            }

            node.send(msg);
        });
        
        node.on("close", function() {
            node.status({});
        });
    }

    RED.nodes.registerType("image-info",ImageInfoNode);
}
