import {useCallback, useEffect, useRef, useState} from "react";

type AudioOptions = {
  loop?: boolean
  interrupt?: boolean
  volume?: number
  sprite?: Record<string, [number, number, boolean | undefined]>
}

const audioStore: Record<string, HTMLAudioElement> = {}

const useSound = (src: string, options: AudioOptions) => {
  const audioRef = useRef<HTMLAudioElement>()

  useEffect(() => {
    audioRef.current = new Audio(src)
    audioRef.current.load();
    audioRef.current.loop = !!options.loop;
    audioRef.current.volume = options.volume || 1
    audioStore[src] = audioRef.current
  }, [options])


  const play =  useCallback((id?: string) => {
    if (options.interrupt) {
      Object.keys(audioStore).forEach(key => {
        audioStore[key].pause()
        audioStore[key].currentTime = 0
      })
    }

    if (audioRef.current && !options.sprite) {
      audioRef.current?.play()
    }

    if (audioRef.current && options.sprite && id) {
      const sprite = options.sprite[id]
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          // Loop
          if (!!sprite?.[2] && audioRef.current.currentTime >= (sprite[1] / 1000)) {
            audioRef.current.currentTime = (sprite[0] / 1000)
          }

          // No Loop
          if (!sprite?.[2] && audioRef.current.currentTime >= (sprite[1] / 1000)) {
            audioRef.current.pause()
            audioRef.current.currentTime = (sprite[0] / 1000)
          }
        }
      }
      audioRef.current.currentTime = (sprite[0] / 1000)
      audioRef.current?.play()
    }
  }, [audioRef, options])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [audioRef])

  return [play,stop]
}

export default useSound