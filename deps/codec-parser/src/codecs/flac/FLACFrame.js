"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../../globals.js");

var _utilities = require("../../utilities.js");

var _CodecFrame = _interopRequireDefault(require("../CodecFrame.js"));

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
class FLACFrame extends _CodecFrame.default {
  static getFrameFooterCrc16(data) {
    return (data[data.length - 2] << 8) + data[data.length - 1];
  } // check frame footer crc
  // https://xiph.org/flac/format.html#frame_footer


  static checkFrameFooterCrc16(data) {
    const expectedCrc16 = FLACFrame.getFrameFooterCrc16(data);
    const actualCrc16 = (0, _utilities.flacCrc16)(data.subarray(0, -2));
    return expectedCrc16 === actualCrc16;
  }

  constructor(data, header, streamInfo) {
    header.streamInfo = streamInfo;
    header.crc16 = FLACFrame.getFrameFooterCrc16(data);
    super(header, data, _globals.headerStore.get(header).samples);
  }

}

exports.default = FLACFrame;