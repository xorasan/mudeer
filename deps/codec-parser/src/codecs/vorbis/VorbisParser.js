"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _globals = require("../../globals.js");

var _utilities = require("../../utilities.js");

var _Parser = _interopRequireDefault(require("../Parser.js"));

var _VorbisFrame = _interopRequireDefault(require("./VorbisFrame.js"));

var _VorbisHeader = _interopRequireDefault(require("./VorbisHeader.js"));

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
class VorbisParser extends _Parser.default {
  constructor(codecParser, headerCache) {
    super(codecParser, headerCache);
    this.Frame = _VorbisFrame.default;
    this._identificationHeader = null;
    this._mode = {
      count: 0
    };
    this._prevBlockSize = 0;
    this._currBlockSize = 0;
  }

  get codec() {
    return "vorbis";
  }

  parseOggPage(oggPage) {
    const oggPageSegments = _globals.frameStore.get(oggPage).segments;

    if (oggPage.pageSequenceNumber === 0) {
      // Identification header
      this._headerCache.enable();

      this._identificationHeader = _VorbisHeader.default.getHeaderFromUint8Array(oggPage.data, this._headerCache);
      if (!this._identificationHeader) this._codecParser.logError("Failed to parse Ogg Vorbis Identification Header", "Not a valid Ogg Vorbis file");
    } else if (oggPage.pageSequenceNumber === 1) {
      // gather WEBM CodecPrivate data
      this._identificationHeader.vorbisComments = oggPageSegments[0];
      this._identificationHeader.vorbisSetup = oggPageSegments[1];
      this._mode = this._parseSetupHeader(oggPageSegments[1]);
    } else {
      oggPage.codecFrames = oggPageSegments.map(segment => new _VorbisFrame.default(segment, this._identificationHeader, this._getSamples(segment)));
    }

    return oggPage;
  }

  _getSamples(segment) {
    const byte = segment[0] >> 1;
    const blockFlag = this._mode[byte & this._mode.mask]; // is this a large window

    if (blockFlag) {
      this._prevBlockSize = byte & this._mode.prevMask ? this._identificationHeader.blocksize1 : this._identificationHeader.blocksize0;
    }

    this._currBlockSize = blockFlag ? this._identificationHeader.blocksize1 : this._identificationHeader.blocksize0;
    const samples = this._prevBlockSize + this._currBlockSize >> 2;
    this._prevBlockSize = this._currBlockSize;
    return samples;
  } // https://gitlab.xiph.org/xiph/liboggz/-/blob/master/src/liboggz/oggz_auto.c
  // https://github.com/FFmpeg/FFmpeg/blob/master/libavcodec/vorbis_parser.c

  /*
   * This is the format of the mode data at the end of the packet for all
   * Vorbis Version 1 :
   *
   * [ 6:number_of_modes ]
   * [ 1:size | 16:window_type(0) | 16:transform_type(0) | 8:mapping ]
   * [ 1:size | 16:window_type(0) | 16:transform_type(0) | 8:mapping ]
   * [ 1:size | 16:window_type(0) | 16:transform_type(0) | 8:mapping ]
   * [ 1:framing(1) ]
   *
   * e.g.:
   *
   * MsB         LsB
   *              <-
   * 0 0 0 0 0 1 0 0
   * 0 0 1 0 0 0 0 0
   * 0 0 1 0 0 0 0 0
   * 0 0 1|0 0 0 0 0
   * 0 0 0 0|0|0 0 0
   * 0 0 0 0 0 0 0 0
   * 0 0 0 0|0 0 0 0
   * 0 0 0 0 0 0 0 0
   * 0 0 0 0|0 0 0 0
   * 0 0 0|1|0 0 0 0 |
   * 0 0 0 0 0 0 0 0 V
   * 0 0 0|0 0 0 0 0
   * 0 0 0 0 0 0 0 0
   * 0 0 1|0 0 0 0 0
   *
   * The simplest way to approach this is to start at the end
   * and read backwards to determine the mode configuration.
   *
   * liboggz and ffmpeg both use this method.
   */


  _parseSetupHeader(setup) {
    const bitReader = new _utilities.BitReader(setup);
    let mode = {
      count: 0
    }; // sync with the framing bit

    while ((bitReader.read(1) & 0x01) !== 1) {}

    let modeBits; // search in reverse to parse out the mode entries
    // limit mode count to 63 so previous block flag will be in first packet byte

    while (mode.count < 64 && bitReader.position > 0) {
      const mapping = (0, _utilities.reverse)(bitReader.read(8));

      if (mapping in mode && !(mode.count === 1 && mapping === 0) // allows for the possibility of only one mode
      ) {
        this._codecParser.logError("received duplicate mode mapping, failed to parse vorbis modes");

        throw new Error("Failed to read Vorbis stream");
      } // 16 bits transform type, 16 bits window type, all values must be zero


      let i = 0;

      while (bitReader.read(8) === 0x00 && i++ < 3) {} // a non-zero value may indicate the end of the mode entries, or invalid data


      if (i === 4) {
        // transform type and window type were all zeros
        modeBits = bitReader.read(7); // modeBits may need to be used in the next iteration if this is the last mode entry

        mode[mapping] = modeBits & 0x01; // read and store mode -> block flag mapping

        bitReader.position += 6; // go back 6 bits so next iteration starts right after the block flag

        mode.count++;
      } else {
        // transform type and window type were not all zeros
        // check for mode count using previous iteration modeBits
        if ((((0, _utilities.reverse)(modeBits) & 0b01111110) >> 1) + 1 !== mode.count) {
          this._codecParser.logError("mode count did not match actual modes, failed to parse vorbis modes");

          throw new Error("Failed to read Vorbis stream");
        }

        break;
      }
    } // mode mask to read the mode from the first byte in the vorbis frame


    mode.mask = (1 << Math.log2(mode.count)) - 1; // previous window flag is the next bit after the mode mask

    mode.prevMask = (mode.mask | 0x1) + 1;
    return mode;
  }

}

exports.default = VorbisParser;