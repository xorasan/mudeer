"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utilities = require("./utilities.js");

var _HeaderCache = _interopRequireDefault(require("./codecs/HeaderCache.js"));

var _MPEGParser = _interopRequireDefault(require("./codecs/mpeg/MPEGParser.js"));

var _AACParser = _interopRequireDefault(require("./codecs/aac/AACParser.js"));

var _FLACParser = _interopRequireDefault(require("./codecs/flac/FLACParser.js"));

var _OggParser = _interopRequireDefault(require("./containers/ogg/OggParser.js"));

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
const noOp = () => {};

class CodecParser {
  constructor(mimeType, {
    onCodecUpdate,
    onCodec,
    enableLogging
  } = {}) {
    this._inputMimeType = mimeType;
    this._onCodec = onCodec || noOp;
    this._headerCache = new _HeaderCache.default(onCodecUpdate);
    this._enableLogging = enableLogging;

    if (this._inputMimeType.match(/aac/)) {
      this._parser = new _AACParser.default(this, this._headerCache, this._onCodec);
    } else if (this._inputMimeType.match(/mpeg/)) {
      this._parser = new _MPEGParser.default(this, this._headerCache, this._onCodec);
    } else if (this._inputMimeType.match(/flac/)) {
      this._parser = new _FLACParser.default(this, this._headerCache, this._onCodec);
    } else if (this._inputMimeType.match(/ogg/)) {
      this._parser = new _OggParser.default(this, this._headerCache, this._onCodec);
    } else {
      throw new Error(`Unsupported Codec ${mimeType}`);
    }

    this._frameNumber = 0;
    this._currentReadPosition = 0;
    this._totalBytesIn = 0;
    this._totalBytesOut = 0;
    this._totalSamples = 0;
    this._sampleRate = undefined;
    this._rawData = new Uint8Array(0);
    this._generator = this._generator();

    this._generator.next();
  }
  /**
   * @public
   * @returns The detected codec
   */


  get codec() {
    return this._parser.codec;
  }
  /**
   * @public
   * @description Returns an iterator for the passed in codec data.
   * @param {Uint8Array} chunk Next chunk of codec data to read
   * @returns {IterableIterator} Iterator that operates over the codec data.
   * @yields {Uint8Array} Codec Frames
   */


  *iterator(chunk) {
    for (let i = this._generator.next(chunk); i.value; i = this._generator.next()) {
      yield i.value;
    }
  }

  *_generator() {
    // start parsing out frames
    while (true) {
      const frame = yield* this._parser.parseFrame();
      if (frame) yield frame;
    }
  }
  /**
   *
   * @param {number} minSize Minimum bytes to have present in buffer
   * @returns {Uint8Array} rawData
   */


  *readRawData(minSize = 0, readOffset = 0) {
    let rawData;

    while (this._rawData.length <= minSize + readOffset) {
      rawData = yield;

      if (rawData) {
        this._totalBytesIn += rawData.length;
        this._rawData = (0, _utilities.concatBuffers)(this._rawData, rawData);
      }
    }

    return this._rawData.subarray(readOffset);
  }
  /**
   *
   * @param {number} increment Bytes to increment codec data
   */


  incrementRawData(increment) {
    this._currentReadPosition += increment;
    this._rawData = this._rawData.subarray(increment);
  }

  mapCodecFrameStats(frame) {
    if (this._sampleRate !== frame.header.sampleRate) this._sampleRate = frame.header.sampleRate;
    frame.header.bitrate = Math.round(frame.data.length / frame.duration) * 8;
    frame.frameNumber = this._frameNumber++;
    frame.totalBytesOut = this._totalBytesOut;
    frame.totalSamples = this._totalSamples;
    frame.totalDuration = this._totalSamples / this._sampleRate * 1000;
    frame.crc32 = (0, _utilities.crc32)(frame.data);

    this._headerCache.checkCodecUpdate(frame.header.bitrate, frame.totalDuration);

    this._totalBytesOut += frame.data.length;
    this._totalSamples += frame.samples;
  }

  mapFrameStats(frame) {
    if (frame.codecFrames) {
      // Ogg container
      frame.codecFrames.forEach(codecFrame => {
        frame.duration += codecFrame.duration;
        frame.samples += codecFrame.samples;
        this.mapCodecFrameStats(codecFrame);
      });
      frame.totalSamples = this._totalSamples;
      frame.totalDuration = this._totalSamples / this._sampleRate * 1000 || 0;
      frame.totalBytesOut = this._totalBytesOut;
    } else {
      this.mapCodecFrameStats(frame);
    }
  }

  _log(logger, messages) {
    if (this._enableLogging) {
      const stats = [`codec:         ${this.codec}`, `inputMimeType: ${this._inputMimeType}`, `readPosition:  ${this._currentReadPosition}`, `totalBytesIn:  ${this._totalBytesIn}`, `totalBytesOut: ${this._totalBytesOut}`];
      const width = Math.max(...stats.map(s => s.length));
      messages.push(`--stats--${"-".repeat(width - 9)}`, ...stats, "-".repeat(width));
      logger("codec-parser", messages.reduce((acc, message) => acc + "\n  " + message, ""));
    }
  }

  logWarning(...messages) {
    this._log(console.warn, messages);
  }

  logError(...messages) {
    this._log(console.error, messages);
  }

}

exports.default = CodecParser;