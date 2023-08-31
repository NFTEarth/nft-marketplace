import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import useSound from "../../hooks/useSound";
import {useFortune, useMounted} from "../../hooks";
import {PlayerType} from "./Player";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";
import {useMediaQuery} from "react-responsive";

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

export interface WheelProps extends HighchartsReact.Props {
  onWheelEnd: any
  winner?: `0x${string}`
}

// const normalizeDeg = (r: number) => r % 360;
// const getAverage = (a: number, b: number) => {
//   return Math.atan2(Math.sin(b-a), Math.cos(b-a))
// }
//
// const getAverage2 = (a: number, b: number) => {
//   return normalizeDeg(((a - b + 180 + 360) % 360 - 180) + 360)
// }

// const sum = (a: number[]) => {
//   let s = 0;
//   for (let i = 0; i < a.length; i++) s += a[i];
//   return s;
// }
//
// const degToRad= (a: number) => {
//   return Math.PI / 180 * a;
// }

const oppositeDeg = (a: number) => (a + 180) % 360
//
// const meanAngleDeg = (a: number[]) => {
//   return 180 / Math.PI * Math.atan2(
//     sum(a.map(degToRad).map(Math.sin)) / a.length,
//     sum(a.map(degToRad).map(Math.cos)) / a.length
//   );
// }

const radToDeg = (r: number) =>  {
  if (r < 0) {
    r += 2*Math.PI;
  }

  return r * 180 / Math.PI;
}

function getRandomInt(min: number, max: number) {
  return min + (Math.random() * (max - min));
}

type winnerWheel = {
  wheelPoint: number,
  winnerIndex: number
}

type FortuneData = {
  round: Round
  countdown: number
  players: PlayerType[]
  enableAudio: boolean
  hoverPlayerIndex: number
}

type AnglePoint = {
  index: number
  start: number
  end: number
}
//
// const findWinner = (data: any[], winner?: `0x${string}`, randomize = true) : winnerWheel => {
//   if (!data || !winner) {
//     return {
//       wheelPoint: 360,
//       winnerIndex: -1
//     }
//   }
//
//   let cumulativeDegree = 0;
//   let winnerAngle: AnglePoint = { index: -1, start: 0, end: 0 };
//   (data || []).forEach((point: any, i: number) => {
//     if ((new RegExp(`${winner}`, 'i')).test(point.address)) {
//       winnerAngle = {
//         index: i,
//         start: cumulativeDegree,
//         end: (cumulativeDegree + (360 * (point.percentage / 100)))
//       }
//     }
//     cumulativeDegree = (cumulativeDegree + (360 * (point.percentage / 100)))
//   })
//
//   let avg = getAverage2(winnerAngle.start, winnerAngle.end)
//
//   console.log(winnerAngle.start, winnerAngle.end, avg, oppositeDeg(avg))
//
//   return {
//     wheelPoint: randomize ?
//       getRandomInt(winnerAngle.start, winnerAngle.end) :
//       data[winnerAngle.index].shapeArgs.start + 90,
//     winnerIndex: winnerAngle.index
//   };
// }

const getProgressColor = (percent: number) => {
  if (percent < 10) {
    return 'red'
  }

  if (percent < 50) {
    return 'orange'
  }

  return 'white'
}

const spinWheelAudioSpriteMap = {
  start: [0, 1200, true],
  end: [1200, 2000, false]
} as any;

enum WheelState {
  NONE,
  CLOCK,
  START,
  ENDING,
  ENDED
}

const Wheel = (props: WheelProps) => {
  const { container, winner, onWheelEnd, ...restProps } = props;
  const [wheelState, setWheelState] = useState(0)
  const chartComponentRef = useRef<typeof HighchartsReact>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const triangleRef = useRef<any>();
  const animationSpeed = 30;
  const isMounted = useMounted()
  const isLargeDevice = useMediaQuery({ minWidth: 1536 }) && isMounted

  const { data: {
    round,
    countdown,
    players,
    enableAudio,
    hoverPlayerIndex
  }, setHoverPlayerIndex } = useFortune<FortuneData>(d => d)

  const { status, roundId, cutoffTime, duration } = round || {};

  const [playWin] = useSound(`/audio/win.mp3`, {
    interrupt: true,
    volume: 0.8
  })
  // const [playClock, stopClock] = useSound(`/audio/clock.mp3`, {
  //   volume: 0.8,
  //   loop: true,
  //   interrupt: true,
  // })
  const [playStart] = useSound(`/audio/game-start.mp3`, {
    volume: 0.8,
    interrupt: true,
  })
  const [playWheel, stopWheel] = useSound(`/audio/wheel-spin.mp3`, {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    if (WheelState.NONE === wheelState && enableAudio) {
      playStart?.()
    }

    // if (WheelState.CLOCK === wheelState) {
    //   if (enableAudio) {
    //     playClock?.()
    //   } else {
    //     stopClock?.()
    //   }
    // }

    if (WheelState.START === wheelState) {
      if (enableAudio) {
        playWheel?.('start')
      } else {
        stopWheel?.()
      }
    }

    if (WheelState.ENDING === wheelState) {
      if (enableAudio) {
        playWheel?.('end')
      } else {
        stopWheel?.()
      }
    }

    if (WheelState.ENDED === wheelState && enableAudio) {
      playWin?.()
    }
  }, [wheelState, enableAudio])

  const rotateToWinner = useCallback(() => {
    const chart = chartComponentRef.current?.chart

    if (triangleRef.current) {
      triangleRef.current.destroy()
    }

    if (spinIntervalRef.current) {
      clearInterval(spinIntervalRef.current)
      spinIntervalRef.current = undefined;
    }

    if (!chart) {
      return;
    }

    setHoverPlayerIndex?.(undefined);
    triangleRef.current = chart.renderer.path([
      ['M', chart.chartWidth / 2 - 20, chart.plotTop + 18],
      ['L', chart.chartWidth / 2 + 20, chart.plotTop + 18],
      ['L', chart.chartWidth / 2, chart.plotTop + 50],
      ['Z']
    ])
      .attr({
        fill: 'white',
        zIndex: 3
      })
      .add();

    let wheelEnding = false
    chart.series?.[0]?.update({ startAngle: 0 });
    // const { wheelPoint, winnerIndex } = findWinner(chart.series?.[0]?.data, winner, false)

    let diff = 360 * 10
    let startAngle = 0;
    setWheelState(WheelState.START)
    const winnerIndex = chart.series?.[0]?.data.findIndex((d: any) => {
      return (new RegExp(`${winner}`, 'i')).test(d.address)
    });
    spinIntervalRef.current = setInterval(() => {
      startAngle += diff
      if (startAngle > 360) {
        startAngle -= 360
      }

      chart.series?.[0]?.update({ startAngle: startAngle });

      diff = diff < 360 ? diff - 5 : diff * 0.985
      // console.log(diff, wheelPoint)

      if (diff <  360 && !wheelEnding) {
        setWheelState(WheelState.ENDING)
        const wheelPoint = radToDeg(chart.series?.[0]?.data[winnerIndex].shapeArgs.start)
        wheelEnding = true

        if (diff < wheelPoint) {
          chart.series?.[0]?.update({ startAngle: oppositeDeg(wheelPoint) });
          clearInterval(spinIntervalRef.current);
          onWheelEnd(winnerIndex);
          setHoverPlayerIndex?.(winnerIndex);
          // chart.series?.[0]?.update({ startAngle: wheelPoint });
          setWheelState(WheelState.ENDED)
        }
      }
    }, animationSpeed)
  }, [chartComponentRef])

  useEffect(() => {
    if (RoundStatus.Open === status) {
      setWheelState(WheelState.NONE)
    }

    if (RoundStatus.Drawn === status) {
      rotateToWinner()
    }
  }, [status, roundId])

  const progress = useMemo(() => {
    const start = cutoffTime - duration;
    const current = ((new Date()).getTime() / 1000);

    return 100 * (1 - (current - start) / (cutoffTime - start))
  }, [cutoffTime, duration, countdown]);

  const options = useMemo<Highcharts.Options>(() => {
    return {
      chart: {
        name: '',
        animation: false,
        backgroundColor: 'transparent',
        renderTo: 'container',
        type: 'pie',
        width: isLargeDevice ? 490 : 380,
        height: isLargeDevice ? 490 : 380,
        style: {
          margin: 'auto'
        }
      },
      events: {
        resize: function () {
          const chart = chartComponentRef.current?.chart;
          if (triangleRef.current) {
            triangleRef.current.destroy();
          }

          if (chart) {
            chart.reflow()
          }
        }
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          innerSize: '100%',
          animation: false,
        },
        series: {
          shadow: true
        }
      },
      series: [
        {
          name: 'Win Chance',
          borderWidth: 0,
          data: (players.length && RoundStatus.Cancelled !== status) ? players : [{
            y: 100,
            color: RoundStatus.Cancelled === status ? '#F00' : '#888'
          }],
          type: 'pie',
          size: '90%',
          innerSize: '75%',
          showInLegend: false,
          enableMouseTracking: players.length > 0 && ![RoundStatus.Cancelled, RoundStatus.Drawn].includes(status),
          dataLabels: {
            enabled: false
          },
          tooltip: {
            followPointer: false,
          },
          events: {

          }
        },
        {
          type: 'pie',
          size: '100%',
          innerSize: '95%',
          name: 'Countdown',
          borderWidth: 0,
          shadow: false,
          enableMouseTracking: false,
          dataLabels: {
            enabled: false
          },
          data: status !== RoundStatus.Open ? [{
            y: 100,
            color: !round ? '#888' : '#fff'
          }] : [{
            y: progress,
            color: getProgressColor(progress),
          }, {
            y: 100 - progress,
            color: '#4e4e4e'
          }],
        }
      ],
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      }
    }
  }, [players, status, progress, isLargeDevice])


  if (!isMounted) {
    return null
  }

  return (
    <>
      <HighchartsReact
        ref={chartComponentRef}
        highcharts={Highcharts}
        containerProps={{
          style: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
          }
        }}
        options={options}
        {...restProps}
      />
    </>
  )
}

export default Wheel;