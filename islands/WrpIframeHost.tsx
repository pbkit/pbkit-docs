/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, useMemo, useState } from "../client_deps.ts";
import { createWrpChannel } from "https://deno.land/x/wrp@v0.0.3/channel.ts";
import useWrpIframeSocket from "https://deno.land/x/wrp@v0.0.3/react/useWrpIframeSocket.ts";
import useWrpServer from "https://deno.land/x/wrp@v0.0.3/react/useWrpServer.ts";
import { methodDescriptors } from "../wrp-example/generated/services/pbkit/wrp/example/WrpExampleService.ts";

export default function WrpIframeHost() {
  const [sliderValue, setSliderValue] = useState(50);
  const [text, setText] = useState("Hello World");
  const { iframeRef, socket } = useWrpIframeSocket();
  const channel = useMemo(() => socket && createWrpChannel(socket), [socket]);
  useWrpServer(channel, { sliderValue, text }, [
    [
      methodDescriptors.getSliderValue,
      ({ req, res, getState, stateChanges }) => {
        res.header({});
        const value = getState().sliderValue;
        res.send({ value });
        const off = stateChanges.on("sliderValue", (value) =>
          res.send({ value })
        );
        req.metadata?.on("cancel-response", teardown);
        req.metadata?.on("close", teardown);
        function teardown() {
          off();
          res.end({});
        }
      },
    ],
    [
      methodDescriptors.getTextValue,
      ({ res, getState }) => {
        const { text } = getState();
        res.header({});
        res.send({ text });
        res.end({});
      },
    ],
  ]);
  return (
    <>
      <div>
        <h2>host inputs</h2>
        <label>
          <span>slider</span>
          <input
            type="range"
            value={sliderValue}
            min="0"
            max="100"
            onInput={(e) => setSliderValue(+(e.target as any).value)}
          />
        </label>
        <label>
          <span>text</span>
          <input
            type="text"
            value={text}
            onInput={(e) => setText((e.target as any).value)}
          />
        </label>
      </div>
      <div>
        <h2>iframe</h2>
        <iframe ref={iframeRef} src="/wrp-example-guest" />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            div {
              display: flex;
              flex-direction: column;
              padding: 1em;
            }
            h2 {
              font-size: 2em;
            }
            label > span {
              margin-right: 1em;
            }
            input[type=text] {
              border: 1px solid black;
            }
            iframe {
              width: 30em;
              height: 30em;
              border: 1px solid black;
              resize: both;
            }
          `,
        }}
      />
    </>
  );
}
