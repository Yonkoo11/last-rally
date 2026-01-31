import { Composition } from "remotion";
import { GoldcoinPromo } from "./GoldcoinPromo";

// 30fps, 30 seconds total
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GoldcoinPongPromo"
        component={GoldcoinPromo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
