"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CodecFrame = _interopRequireDefault(require("../CodecFrame.js"));

var _AACHeader = _interopRequireDefault(require("./AACHeader.js"));

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
class AACFrame extends _CodecFrame.default {
  static *getFrame(codecParser, headerCache, readOffset) {
    return yield* super.getFrame(_AACHeader.default, AACFrame, codecParser, headerCache, readOffset);
  }

  constructor(header, frame, samples) {
    super(header, frame, samples);
  }

}

exports.default = AACFrame;