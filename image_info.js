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
    const settings = RED.settings;  
    const sizeOf = require('image-size');
   
    function ImageInfoNode(n) {
        RED.nodes.createNode(this,n);
        
        const node = this;
        
        node.on("input", function(msg) { 
         let buffer = null;
 
         function isBase64(v) {
          if (v instanceof Boolean || typeof v === 'boolean') { return false }
          var regex = '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\/]{3}=)?'
          return (new RegExp('^' + regex + '$', 'gi')).test(v)
          }
            
            if (Buffer.isBuffer(msg.payload)) {
                buffer = msg.payload;
            }
            else {
                if (typeof msg.payload === 'string') { 
                    if (isBase64(msg.payload)) {
                         buffer = Buffer.from(msg.payload, 'base64')
                    }
                    else {
                        buffer = Buffer.from(msg.payload);
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
