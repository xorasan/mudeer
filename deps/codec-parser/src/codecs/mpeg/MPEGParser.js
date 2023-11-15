"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Parser = _interopRequireDefault(require("../Parser.js"));

var _MPEGFrame = _interopRequireDefault(require("./MPEGFrame.js"));

var _MPEGHeader = _interopRequireDefault(require("./MPEGHeader.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Copyright 2020-2021 Ethan Halsall
    
    This file is part of codec-parser.
    
    codec-parser is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    codec-parser is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>
*/
class MPEGParser extends _Parser.default {
  constructor(codecParser, headerCache, onCodec) {
    super(codecParser, headerCache);
    this.Frame = _MPEGFrame.default;
    this.Header = _MPEGHeader.default;
    onCodec(this.codec);
  }

  get codec() {
    return "mpeg";
  }

  *parseFrame() {
    return yield* this.fixedLengthFrameSync();
  }

}

exports.default = MPEGParser;