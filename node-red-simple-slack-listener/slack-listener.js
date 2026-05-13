module.exports = function (RED) {

    function SlackListenerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const slack = RED.nodes.getNode(config.slack);
        if (!slack) return;

        // =========================
        // MESSAGE FORMATTING
        // Create a Redbot-compatible message format from the raw Slack event.
        // This is to prevent large changes in previously made automation done based on Redbot's
        // Slack Receiver -node.
        // Most of the complexity here is due to the different payload structures 
        // for different Slack event types (block actions, commands, etc.).
        // =========================
        function formatMessage(type, event) {
            const body = event?.body || event?.event || event;
            const ts = body?.ts || body?.event_ts || body?.event?.ts || body?.container?.message_ts || null;
            const chatId = body?.channel?.id ||
                body?.channel ||
                body?.channel_id ||
                body?.container?.channel_id ||
                body?.event?.channel ||
                null;
            const userId = body?.user?.id ||
                body?.user ||
                body?.user_id ||
                body?.event?.user ||
                null;
            let originalMessage = body;
            let payload = {};

            // Slack Events API wrapper
            if (
                body?.type === "event_callback" &&
                body?.event
            ) {
                originalMessage = body.event;
            }

            let messageType = "unknown";

            // =========================
            // BLOCK ACTIONS
            // =========================
            if (
                body?.type === "block_actions" ||
                (Array.isArray(body?.actions) && body.actions.length > 0)
            ) {
                messageType = "response"
                originalMessage = {
                    type: messageType,
                    channel: chatId,
                    user: userId,
                    response: {},
                    actions: body.actions || [],
                    ts: ts,
                    trigger_id: body.trigger_id || null,
                    chatId,
                    userId,
                    transport: "slack",
                    chatbotId: ""
                };
                payload = {
                    type: messageType,
                    chatId,
                    userId,
                    ts: ts,
                    transport: "slack",
                    inbound: true,
                    content: {}
                };
            }

            // =========================
            // MESSAGE
            // =========================
            else if (
                body?.type === "message" ||
                body?.event?.type === "message"
            ) {
                messageType = "message";
            }

            // =========================
            // COMMAND
            // =========================
            else if (body?.command) {
                messageType = "command";
                const args = body.text
                    ? body.text.trim().split(/\s+/)
                    : [];

                originalMessage = {
                    ...body,
                    type: messageType,
                    channel: chatId,
                    user: userId,
                    chatId,
                    userId,
                    transport: "slack",
                    ts: ts
                };
                payload = {
                    type: messageType,
                    chatId,
                    userId,
                    ts: ts,
                    transport: "slack",
                    inbound: true,
                    content: body.command,
                    arguments: args
                };
            }

            if (Object.keys(payload).length === 0) {
                payload = {
                    type: messageType,
                    chatId,
                    userId,
                    ts: ts,
                    transport: "slack",
                    inbound: true
                };
            }

            return ({
                originalMessage: originalMessage,
                payload: payload
            });
        }

        function emit(type, event) {
            const msg = formatMessage(type, event);
            node.send(msg);
        }

        // =========================
        // RAW BINDING
        // =========================
        slack.emitter.on("raw", (event) => {
            emit(event.type, event);
        });

        node.on("close", () => {
            slack.emitter.removeAllListeners("raw");
        });
    }

    RED.nodes.registerType("slack-listener", SlackListenerNode);
};