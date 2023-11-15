"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../../globals.js");

var _Frame = _interopRequireDefault(require("../Frame.js"));

var _OggPageHeader = _interopRequireDefault(require("./OggPageHeader.js"));

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
class OggPage extends _Frame.default {
  static *getFrame(codecParser, headerCache, readOffset) {
    const header = yield* _OggPageHeader.default.getHeader(codecParser, headerCache, readOffset);

    if (header) {
      const frameLength = _globals.headerStore.get(header).frameLength;

      const headerLength = _globals.headerStore.get(header).length;

      const totalLength = headerLength + frameLength;
      const rawData = (yield* codecParser.readRawData(totalLength, 0)).subarray(0, totalLength);
      const frame = (yield* codecParser.readRawData(frameLength, headerLength)).subarray(0, frameLength);
      return new OggPage(header, frame, rawData);
    } else {
      return null;
    }
  }

  constructor(header, frame, rawData) {
    super(header, frame);
    _globals.frameStore.get(this).length = rawData.length;
    this.codecFrames = [];
    this.rawData = rawData;
    this.absoluteGranulePosition = header.absoluteGranulePosition;
    this.crc32 = header.pageChecksum;
    this.duration = 0;
    this.isContinuedPacket = header.isContinuedPacket;
    this.isFirstPage = header.isFirstPage;
    this.isLastPage = header.isLastPage;
    this.pageSequenceNumber = header.pageSequenceNumber;
    this.samples = 0;
    this.streamSerialNumber = header.streamSerialNumber;
  }

}

exports.default = OggPage;