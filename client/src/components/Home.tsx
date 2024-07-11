import { Cursor } from "./Cursor";
import useWebSocket from "react-use-websocket";
import React from "react";
import throttle from "lodash.throttle";

export function Home({ username }: { username: string }) {
  const WS_URL = `ws://127.0.0.1:8000`;
  const { sendJsonMessage, lastJsonMessage } = useWebSocket<{
    [x: string]: { state: { x: number; y: number } };
  }>(WS_URL, {
    share: true,
    queryParams: { username },
  });

  const THROTTLE = 50;
  const sendJsonMessageThrottled = React.useRef(
    throttle(sendJsonMessage, THROTTLE),
  );
  function sendJSONMessage(e: MouseEvent) {
    sendJsonMessageThrottled.current({
      x: e.clientX,
      y: e.clientY,
    });
  }

  React.useEffect(() => {
    sendJsonMessage({
      x: 0,
      y: 0,
    });
    window.addEventListener("mousemove", sendJSONMessage);
    return () => {
      window.removeEventListener("mousemove", sendJSONMessage);
    };
  }, []);

  if (lastJsonMessage) {
    return (
      <>
        <ul>
          {Object.keys(lastJsonMessage).map((uuid) => {
            return (
              <li key={uuid}>{JSON.stringify(lastJsonMessage?.[uuid])}</li>
            );
          })}
        </ul>
        {Object.keys(lastJsonMessage).map((uuid) => {
          const user = lastJsonMessage[uuid];
          return (
            <Cursor
              key={uuid}
              userId={uuid}
              point={[user.state.x, user.state.y]}
            />
          );
        })}
      </>
    );
  }
}
