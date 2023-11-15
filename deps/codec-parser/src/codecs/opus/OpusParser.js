"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../../globals.js");

var _Parser = _interopRequireDefault(require("../Parser.js"));

var _OpusFrame = _interopRequireDefault(require("./OpusFrame.js"));

var _OpusHeader = _interopRequireDefault(require("./OpusHeader.js"));

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
class OpusParser extends _Parser.default {
  constructor(codecParser, headerCache) {
    super(codecParser, headerCache);
    this.Frame = _OpusFrame.default;
    this.Header = _OpusHeader.default;
    this._identificationHeader = null;
  }

  get codec() {
    return "opus";
  }
  /**
   * @todo implement continued page support
   */


  parseOggPage(oggPage) {
    if (oggPage.pageSequenceNumber === 0) {
      // Identification header
      this._headerCache.enable();

      this._identificationHeader = _OpusHeader.default.getHeaderFromUint8Array(oggPage.data, this._headerCache);
      if (!this._identificationHeader) this._codecParser.logError("Failed to parse Ogg Opus Identification Header", "Not a valid Ogg Opus file");
    } else if (oggPage.pageSequenceNumber === 1) {// OpusTags
    } else {
      oggPage.codecFrames = _globals.frameStore.get(oggPage).segments.map(segment => new _OpusFrame.default(segment, this._identificationHeader));
    }

    return oggPage;
  }

}

exports.default = OpusParser;