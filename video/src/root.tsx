import React from 'react';
import {Composition} from 'remotion';
import {LandscapeVideo, PortraitVideo} from './videos';

export const VideoRoot: React.FC = () => (
  <>
    <Composition
      id="Landscape35"
      component={LandscapeVideo}
      durationInFrames={1050}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="Portrait24"
      component={PortraitVideo}
      durationInFrames={720}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
