import React, {useEffect} from 'react';
import {HookOptions, PlayFunction, PlayOptions} from "use-sound/dist/types";
import { useMounted } from "./";

export interface ExposedData {
  sound: Howl | null;
  stop: (id?: string) => void;
  pause: (id?: string) => void;
  duration: number | null;
}
export declare type ReturnedValue = [PlayFunction, ExposedData];

export default function useSound<T = any>(
  src: string | string[],
  {
    id,
    volume = 1,
    playbackRate = 1,
    soundEnabled = true,
    interrupt = false,
    onload,
    ...delegated
  }: HookOptions<T> = {} as HookOptions
) {
  const HowlConstructor = React.useRef<HowlStatic | null>(null);
  const [mounted, setMounted] = React.useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [duration, setDuration] = React.useState<number | null>(null);

  const [sound, setSound] = React.useState<Howl | null>(null);
  const source = JSON.stringify(src);

  const handleLoad = function() {
    if (typeof onload === 'function') {
      // @ts-ignore
      onload.call(this);
    }

    if (mounted) {
      // @ts-ignore
      setDuration(this.duration() * 1000);
    }

    // @ts-ignore
    setSound(this);
  };

  // We want to lazy-load Howler, since sounds can't play on load anyway.
  useEffect(() => {
    if (!mounted) {
      return;
    }

    import('howler').then(mod => {
      // Depending on the module system used, `mod` might hold
      // the export directly, or it might be under `default`.
      HowlConstructor.current = mod.Howl ?? mod.default.Howl;

      new HowlConstructor.current({
        src: Array.isArray(src) ? src : [src],
        volume,
        rate: playbackRate,
        onload: handleLoad,
        ...delegated,
      });
    });
  }, [mounted]);

  // When the `src` changes, we have to do a whole thing where we recreate
  // the Howl instance. This is because Howler doesn't expose a way to
  // tweak the sound
  React.useEffect(() => {
    if (HowlConstructor.current && sound) {
      setSound(
        new HowlConstructor.current({
          src: Array.isArray(src) ? src : [src],
          volume,
          onload: handleLoad,
          ...delegated,
        })
      );
    }
  }, [source]);

  // Whenever volume/playbackRate are changed, change those properties
  // on the sound instance.
  React.useEffect(() => {
    try {
      sound?.volume(volume);
      sound?.rate(playbackRate);
    } catch (e) {
      // Empty
    }
    // A weird bug means that including the `sound` here can trigger an
    // error on unmount, where the state loses track of the sprites??
    // No idea, but anyway I don't need to re-run this if only the `sound`
    // changes.
  }, [sound, volume, playbackRate]);

  const play: PlayFunction = React.useCallback(
    (options?: PlayOptions) => {
      if (typeof options === 'undefined') {
        options = {};
      }

      if (!sound || (!soundEnabled && !options.forceSoundEnabled)) {
        return;
      }

      if (interrupt) {
        sound.stop();
      }

      if (options.playbackRate) {
        sound.rate(options.playbackRate);
      }

      sound.play(options.id);
    },
    [soundEnabled, interrupt]
  );

  const stop = React.useCallback(
    (id?: string) => {
      if (!sound) {
        return;
      }
      // @ts-ignore
      sound.stop(id);
    },
    [sound]
  );

  const pause = React.useCallback(
    (id?: string) => {
      if (!sound) {
        return;
      }
      // @ts-ignore
      sound.pause(id);
    },
    [sound]
  );

  const returnedValue: ReturnedValue = [
    play,
    {
      sound,
      stop,
      pause,
      duration,
    },
  ];

  return returnedValue;
}

export { useSound };