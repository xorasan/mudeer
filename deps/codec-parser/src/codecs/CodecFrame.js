"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../globals.js");

var _Frame = _interopRequireDefault(require("../containers/Frame.js"));

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
class CodecFrame extends _Frame.default {
  static *getFrame(Header, Frame, codecParser, headerCache, readOffset) {
    const header = yield* Header.getHeader(codecParser, headerCache, readOffset);

    if (header) {
      const frameLength = _globals.headerStore.get(header).frameLength;

      const samples = _globals.headerStore.get(header).samples;

      const frame = (yield* codecParser.readRawData(frameLength, readOffset)).subarray(0, frameLength);
      return new Frame(header, frame, samples);
    } else {
      return null;
    }
  }

  constructor(header, data, samples) {
    super(header, data);
    this.header = header;
    this.samples = samples;
    this.duration = samples / this.header.sampleRate * 1000;
    this.frameNumber = undefined;
    this.totalBytesOut = undefined;
    this.totalSamples = undefined;
    this.totalDuration = undefined;
    _globals.frameStore.get(this).length = this.data.length;
  }

}

exports.default = CodecFrame;