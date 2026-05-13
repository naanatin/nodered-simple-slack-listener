# Slack Listener for Node-RED (RedBot-Compatible)

A lightweight replacement Slack receiver node for ``node-red-contrib-chatbot``, built to support modern Node.js versions (18+).

This node focuses on compatibility with RedBot-style Slack message formatting while supporting Slack Socket Mode, Block Actions, Slash Commands, and standard messages.


## Why this exists

The original Slack receiver in ``node-red-contrib-chatbot`` was not compatible with Node.js 18+ without significant changes to the entire chatbot ecosystem.

Instead of upgrading the full stack, this node was created as a drop-in replacement for Slack ingestion only.

## Features

- Compatible with RedBot-style message format
- Supports:
  - Slack messages
  - Slash commands
  - Block actions (radio buttons, dropdowns, buttons)
  - Other support not fully tested
- Socket Mode (default), HTTP mode (ExpressReceiver-based, experimental)

## Installation

```bash
npm install @naanatin/node-red-simple-slack-listener
```
Or inside Node-RED user directory:

```bash
cd ~/.node-red
npm install @naanatin/node-red-simple-slack-listener
```

## Configuration

### Socket Mode (default)

Requires:
- Bot Token (xoxb-...)
- App Token (xapp-...)

Enable Socket Mode in your Slack App settings.

### HTTP Mode (experimental)

Requires:
- Bot Token (xoxb-...)
- Signing Secret

Expose endpoint: ``/slack/events``

## Output format

The node emits messages in a RedBot-compatible structure:
```
{
  "originalMessage": {
    "...": ... 
  },
  "payload": {
    "type": "message | response | command",
    "chatId": "...",
    "userId": "...",
    "ts": "timestamp",
    "transport": "slack",
    "inbound": true,
    "content": (parsed value)
  }
}
```

## Notes

- Designed to match RedBot Slack Receiver behavior
- Some edge cases may need tuning

## Status

- Socket Mode: stable
- HTTP Mode: experimental
- RedBot compatibility: best-effort

## The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.