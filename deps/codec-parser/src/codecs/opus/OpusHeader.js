"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CodecHeader = _interopRequireDefault(require("../CodecHeader.js"));

var _HeaderCache = _interopRequireDefault(require("../HeaderCache.js"));

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

/*
https://tools.ietf.org/html/rfc7845.html
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      'O'      |      'p'      |      'u'      |      's'      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      'H'      |      'e'      |      'a'      |      'd'      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Version = 1  | Channel Count |           Pre-skip            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Input Sample Rate (Hz)                    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Output Gain (Q7.8 in dB)    | Mapping Family|               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+               :
|                                                               |
:               Optional Channel Mapping Table...               :
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Letter  Length (bits)  Description
A  64  Magic Signature - OpusHead
B  8   Version number - 00000001
C  8   Output channel count (unsigned)
D  16  Pre-skip (unsigned, little endian)
E  32  Sample rate (unsigned, little endian)
F  16  Output Gain (signed, little endian)
G  8   Channel Mapping family (unsigned)

// if(channel mapping !== 0)
H  8   Stream count (unsigned)
I  8   Coupled Stream Count (unsigned)
J  8*C Channel Mapping
*/

/* prettier-ignore */
const channelMappingFamilies = {
  0b00000000: ["monophonic (mono)", "stereo (left, right)"],
  0b00000001: ["monophonic (mono)", "stereo (left, right)", "linear surround (left, center, right)", "quadraphonic (front left, front right, rear left, rear right)", "5.0 surround (front left, front center, front right, rear left, rear right)", "5.1 surround (front left, front center, front right, rear left, rear right, LFE)", "6.1 surround (front left, front center, front right, side left, side right, rear center, LFE)", "7.1 surround (front left, front center, front right, side left, side right, rear left, rear right, LFE)"]
};

class OpusHeader extends _CodecHeader.default {
  static getHeaderFromUint8Array(data, headerCache) {
    const header = {}; // Must be at least 19 bytes.

    if (data.length < 19) throw new Error("Out of data while inside an Ogg Page"); // Check header cache

    const key = _HeaderCache.default.getKey(data.subarray(0, 19));

    const cachedHeader = headerCache.getHeader(key);

    if (!cachedHeader) {
      // Bytes (1-8 of 19): OpusHead - Magic Signature
      if (data[0] !== 0x4f || data[1] !== 0x70 || data[2] !== 0x75 || data[3] !== 0x73 || data[4] !== 0x48 || data[5] !== 0x65 || data[6] !== 0x61 || data[7] !== 0x64) {
        return null;
      } // Byte (9 of 19)
      // * `00000001`: Version number


      if (data[8] !== 1) return null;
      const view = new DataView(Uint8Array.of(...data.subarray(0, 19)).buffer);
      header.bitDepth = 16;
      header.length = 19; // Byte (10 of 19)
      // * `CCCCCCCC`: Channel Count

      header.channels = data[9]; // Byte (11-12 of 19)
      // * `DDDDDDDD|DDDDDDDD`: Pre skip

      header.preSkip = view.getUint16(10, true); // Byte (13-16 of 19)
      // * `EEEEEEEE|EEEEEEEE|EEEEEEEE|EEEEEEEE`: Sample Rate

      header.inputSampleRate = view.getUint32(12, true); // Opus is always decoded at 48kHz

      header.sampleRate = 48000; // Byte (17-18 of 19)
      // * `FFFFFFFF|FFFFFFFF`: Output Gain

      header.outputGain = view.getInt16(16, true); // Byte (19 of 19)
      // * `GGGGGGGG`: Channel Mapping Family

      header.channelMappingFamily = data[18];
      if (!header.channelMappingFamily in channelMappingFamilies) return null;
      header.channelMode = channelMappingFamilies[header.channelMappingFamily][header.channels - 1];
      if (!header.channelMode) return null;
    } else {
      Object.assign(header, cachedHeader);
    }

    if (header.channelMappingFamily !== 0) {
      header.length += 2 + header.channels;
      if (data.length < header.length) return new OpusHeader(header, false); // out of data
      // * `HHHHHHHH`: Stream count

      header.streamCount = data[19]; // * `IIIIIIII`: Coupled Stream count

      header.coupledStreamCount = data[20]; // * `JJJJJJJJ|...` Channel Mapping table

      header.channelMappingTable = data.subarray(21, header.channels + 21);
    }

    header.data = Uint8Array.of(...data.subarray(0, header.length));

    if (!cachedHeader) {
      // set header cache
      const {
        length,
        data,
        channelMappingFamily,
        ...codecUpdateFields
      } = header;
      headerCache.setHeader(key, header, codecUpdateFields);
    }

    return new OpusHeader(header);
  }
  /**
   * @private
   * Call OpusHeader.getHeader(Array<Uint8>) to get instance
   */


  constructor(header) {
    super(header);
    this.data = header.data;
    this.channelMappingFamily = header.channelMappingFamily;
    this.channelMode = header.channelMode;
    this.coupledStreamCount = header.coupledStreamCount;
    this.preSkip = header.preSkip;
    this.outputGain = header.outputGain;
    this.inputSampleRate = header.inputSampleRate;
    this.streamCount = header.streamCount;
    this.channelMappingTable = header.channelMappingTable;
  }

}

exports.default = OpusHeader;