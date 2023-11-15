"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../../globals.js");

var _utilities = require("../../utilities.js");

var _Parser = _interopRequireDefault(require("../../codecs/Parser.js"));

var _OggPage = _interopRequireDefault(require("./OggPage.js"));

var _OggPageHeader = _interopRequireDefault(require("./OggPageHeader.js"));

var _FLACParser = _interopRequireDefault(require("../../codecs/flac/FLACParser.js"));

var _OpusParser = _interopRequireDefault(require("../../codecs/opus/OpusParser.js"));

var _VorbisParser = _interopRequireDefault(require("../../codecs/vorbis/VorbisParser.js"));

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
class OggParser extends _Parser.default {
  constructor(codecParser, headerCache, onCodec) {
    super(codecParser, headerCache);
    this._onCodec = onCodec;
    this.Frame = _OggPage.default;
    this.Header = _OggPageHeader.default;
    this._codec = null;
    this._continuedPacket = new Uint8Array();
    this._pageSequenceNumber = 0;
  }

  get codec() {
    return this._codec || "";
  }

  _updateCodec(codec, Parser) {
    if (this._codec !== codec) {
      this._parser = new Parser(this._codecParser, this._headerCache);
      this._codec = codec;

      this._onCodec(codec);
    }
  }

  checkForIdentifier({
    data
  }) {
    const idString = String.fromCharCode(...data.subarray(0, 8));

    switch (idString) {
      case "fishead\0":
        return false;
      // ignore ogg skeleton packets

      case "fisbone\0":
        return false;
      // ignore ogg skeleton packets

      case "OpusHead":
        this._updateCodec("opus", _OpusParser.default);

        return true;

      case /^\x7fFLAC/.test(idString) && idString:
        this._updateCodec("flac", _FLACParser.default);

        return true;

      case /^\x01vorbis/.test(idString) && idString:
        this._updateCodec("vorbis", _VorbisParser.default);

        return true;

      default:
        return true;
    }
  }

  checkPageSequenceNumber(oggPage) {
    if (oggPage.pageSequenceNumber !== this._pageSequenceNumber + 1 && this._pageSequenceNumber > 1 && oggPage.pageSequenceNumber > 1) {
      this._codecParser.logWarning("Unexpected gap in Ogg Page Sequence Number.", `Expected: ${this._pageSequenceNumber + 1}, Got: ${oggPage.pageSequenceNumber}`);
    }

    this._pageSequenceNumber = oggPage.pageSequenceNumber;
  }

  *parseFrame() {
    const oggPage = yield* this.fixedLengthFrameSync(true);
    this.checkPageSequenceNumber(oggPage);

    const oggPageStore = _globals.frameStore.get(oggPage);

    const pageSegmentTable = _globals.headerStore.get(oggPageStore.header).pageSegmentTable;

    let offset = 0;
    oggPageStore.segments = pageSegmentTable.map(segmentLength => oggPage.data.subarray(offset, offset += segmentLength));

    if (pageSegmentTable[pageSegmentTable.length - 1] === 0xff) {
      // continued packet
      this._continuedPacket = (0, _utilities.concatBuffers)(this._continuedPacket, oggPageStore.segments.pop());
    } else if (this._continuedPacket.length) {
      oggPageStore.segments[0] = (0, _utilities.concatBuffers)(this._continuedPacket, oggPageStore.segments[0]);
      this._continuedPacket = new Uint8Array();
    }

    if (this.checkForIdentifier(oggPage) && this._codec) {
      const frame = this._parser.parseOggPage(oggPage);

      this._codecParser.mapFrameStats(frame);

      return frame;
    }
  }

}

exports.default = OggParser;