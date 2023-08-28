import {useEffect, useMemo, useRef, useState} from 'react'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import useSound from "use-sound";
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

const getAverage = (a: number, b: number) => {
  a = a % 360;
  b = b % 360;

  let sum = a + b;
  if (sum > 360 && sum < 540)
  {
    sum = sum % 180;
  }
  return sum / 2;
}

const radToDeg = (r: number) => r * 180 / Math.PI;

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

const findWinner = (data: any[], winner?: `0x${string}`, randomize = true) : winnerWheel => {
  if (!data || !winner) {
    return {
      wheelPoint: 360,
      winnerIndex: -1
    }
  }

  const winnerIndex = data.findIndex(d => {
    return (new RegExp(`${winner}`, 'i')).test(d.address)
  });

  console.log('WINNER', data[winnerIndex]?.address, winnerIndex, data[winnerIndex]?.angle)

  return {
    wheelPoint: randomize ?
      getRandomInt(radToDeg(data[winnerIndex]?.shapeArgs.start), radToDeg(data[winnerIndex]?.shapeArgs.end)) :
      data[winnerIndex]?.angle,
    winnerIndex
  };
}

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
  end: [500, 2000, false]
} as any;

const Wheel = (props: WheelProps) => {
  const { container, winner, onWheelEnd, ...restProps } = props;
  const chartComponentRef = useRef<typeof HighchartsReact>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const [wheelEnding, setWheelEnding] = useState(0);
  const triangleRef = useRef<any>();
  const animationSpeed = 30;
  const isMounted = useMounted()
  const isLargeDevice = useMediaQuery({ minWidth: 1536 }) && isMounted
  const [seriesAngle, setSeriesAngle] = useState<Record<number, number>>({})

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
  const [playStart] = useSound(`/audio/game-start.mp3`, {
    volume: 0.8
  })
  const [playWheel, { stop: stopWheel}] = useSound(`/audio/wheel-spin.mp3`, {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    setWheelEnding(0);
  }, [roundId])

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (RoundStatus.Open === status) {
      playStart?.()
    }

    if (RoundStatus.Drawn === status) {
      playWheel?.({ id: 'start' })
    }
  }, [status, roundId, enableAudio])

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (wheelEnding === 1) {
      playWheel?.({ id: 'end' })
    }

    if (wheelEnding === 2) {
      playWin?.()
      setWheelEnding(2)
    }
  }, [wheelEnding, enableAudio])

  useEffect(() => {
    const chart = chartComponentRef.current?.chart

    if (chart) {
      if (hoverPlayerIndex !== undefined) {
        chart.series?.[0]?.points?.[hoverPlayerIndex]?.select(true, false);
      } else {
        chart.series?.[0]?.points?.forEach((p: Highcharts.Point) => {
          p.select(false);
        })
      }
    }
  }, [chartComponentRef, hoverPlayerIndex])

  useEffect(() => {
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

    chart.series?.[0]?.update({ startAngle: 360 });
    setHoverPlayerIndex?.(undefined);

    if ([RoundStatus.Drawing, RoundStatus.Drawn].includes(status)) {
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
    }

    let diff = 30
    let startAngle = chart.series?.[0]?.options?.startAngle | 0;

    // if (status === RoundStatus.Drawing) {
    //   spinIntervalRef.current = setInterval(() => {
    //     startAngle -= diff;
    //
    //     if (startAngle < 360) {
    //       startAngle += 360;
    //     }
    //
    //     chart.series?.[0]?.update({ startAngle }, true, false, false);
    //   }, animationSpeed)
    // }

    if (RoundStatus.Drawn === status) {
      const { wheelPoint, winnerIndex } = findWinner(chart.series?.[0]?.data, winner, false)
      let stopPoint = (seriesAngle[winnerIndex] || wheelPoint - 90)
      //let stopPoint = wheelPoint - 90

      console.log('stopPoint' , seriesAngle[winnerIndex], wheelPoint)

      if (stopPoint < 360) {
        stopPoint += 360;
      }

      diff = (360 * 30)
      spinIntervalRef.current = setInterval(() => {
        startAngle += diff
        startAngle = startAngle % 360
        diff = diff < 1000 ? diff - 30 : diff * 0.975

        chart.series?.[0]?.update({ startAngle: startAngle }, true, false, false);

        if (diff < (wheelPoint * 10) && wheelEnding === 0) {
          setWheelEnding(1)
        }

        // console.log(diff, stopPoint)

        if (diff < stopPoint) {
          clearInterval(spinIntervalRef.current);
          onWheelEnd(winnerIndex);
          setHoverPlayerIndex?.(winnerIndex);
          chart.series?.[0]?.update({ startAngle: stopPoint }, true, false, false);

          if (wheelEnding != 1) {
            setWheelEnding(2);
          }
        }
      }, animationSpeed)
    }
  }, [seriesAngle, status, roundId, winner])

  useEffect(() => {
    let cumulativePercentage = 0;
    const chart = chartComponentRef.current?.chart;
    if (chart && players.length > 0) {
      const seriesAngles: Record<number, number> = {};
      (chart.series?.[0]?.data || []).forEach((point: any, i: number) => {
        let angle = -90 + (cumulativePercentage + point.percentage / 2) * 360 / 100;
        if (angle > 90) {
          angle = angle + 180;
        }

        seriesAngles[i] = angle

        cumulativePercentage += point.percentage;
      })
      setSeriesAngle(seriesAngles);
    }
  }, [players, chartComponentRef])

  const options = useMemo<Highcharts.Options>(() => {
    const start = cutoffTime - duration;
    const current = ((new Date()).getTime() / 1000);
    const progressPercent = 100 * (1 - (current - start) / (cutoffTime - start))

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
            y: progressPercent,
            color: getProgressColor(progressPercent),
          }, {
            y: 100 - progressPercent,
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
  }, [players, status, cutoffTime, duration, countdown, isLargeDevice])

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