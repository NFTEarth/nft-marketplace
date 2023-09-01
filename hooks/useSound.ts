import {useCallback, useEffect, useRef, useState} from "react";

type AudioOptions = {
  loop?: boolean
  interrupt?: boolean
  volume?: number
  rate?: number
  sprite?: Record<string, [number, number, boolean | undefined]>
}

const audioStore: Record<string, HTMLAudioElement> = {}
type SoundContext = {
  stop: () => void
  reset: () => void
  audio?: HTMLAudioElement
}

const useSound = (src: string, options: AudioOptions) : [(id?: string) => void, SoundContext] => {
  const audioRef = useRef<HTMLAudioElement>()

  useEffect(() => {
    return () => {
      reset();
    }
  }, [])

  useEffect(() => {
    if (audioStore[src]) {
      audioRef.current = audioStore[src]
    } else {
      audioRef.current = new Audio(src)
      audioRef.current.load();
      audioStore[src] = audioRef.current
    }
    audioRef.current.loop = !!options.loop;
    audioRef.current.playbackRate = options.rate || 1
    audioRef.current.volume = options.volume || 1
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

  const reset = () => {
    Object.keys(audioStore).forEach(key => {
      audioStore[key].pause()
      audioStore[key].currentTime = 0
    })
  }

  return [play, {  stop, reset, audio: audioRef.current }]
}

export default useSound