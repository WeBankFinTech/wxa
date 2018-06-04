#!/bin/bash

cd node_modules/lodash

sed -i '.bak' 's/module.exports = freeGlobal;/module.exports={Array:Array,Date:Date,Error:Error,Function:Function,Math:Math,Object:Object,RegExp:RegExp,String:String,TypeError:TypeError,setTimeout:setTimeout,clearTimeout:clearTimeout,setInterval:setInterval,clearInterval:clearInterval};/' _freeGlobal.js
