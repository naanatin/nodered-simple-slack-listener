module.exports = function (RED) {
    const { App, ExpressReceiver } = require("@slack/bolt");
    const EventEmitter = require("events");

    function SlackConfigNode(n) {
        RED.nodes.createNode(this, n);
        const node = this;

        node.mode = n.mode || "socket";

        node.botToken = node.credentials.botToken;
        node.appToken = node.credentials.appToken;
        node.signingSecret = node.credentials.signingSecret;

        node.emitter = new EventEmitter();

        node.slackApp = null;
        node.connected = false;

        function emitRaw(type, args) {
            node.emitter.emit("raw", args);
        }

        async function connect() {

            node.slackApp = new App({
                token: node.botToken,
                appToken: node.appToken,
                socketMode: node.mode === "socket"
            });

            // Emitting all events through a single listener
            // for better compatibility with Redbot message format.
            // Block events had troubles with the previous approach of using `app.event()` or `app.action()`
            // since the event type was not in the expected place in the payload.
            node.slackApp.use(async (args) => {
                try {
                    if (typeof args.ack === 'function') await args.ack();
                } catch (e) {
                    node.warn(e && e.message);
                }

                const type = args?.body?.type || args?.payload?.type || args?.body?.event?.type || 'unknown';
                emitRaw(type, args);

                if (typeof args.next === 'function') await args.next();
            });

            await node.slackApp.start();
            node.connected = true;
            node.log("Slack connected using " + (node.mode === "socket" ? "Socket Mode" : "HTTP Receiver"));
        }

        connect();

        node.on("close", async () => {
            try {
                if (node.slackApp) await node.slackApp.stop();
            } catch (e) { }
        });
    }

    RED.nodes.registerType("slack-config", SlackConfigNode, {
        credentials: {
            botToken: { type: "password" },
            appToken: { type: "password" },
            signingSecret: { type: "password" }
        }
    });
};